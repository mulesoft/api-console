import tmp from 'tmp';
import { Duplex } from 'stream';
import unzipper from 'unzipper';
import path from 'path';
import { fork } from 'child_process';
import fs from 'fs-extra';
import { ApiSearch } from './api-search.js';

/**
 * A class that handles parsing a file to AMF format.
 *
 * It unpacks zip files, searches for main entry point to the API and parses
 * the data to AMF json-ld format.
 *
 * The process can be split into 3 parts:
 *
 * - prepare - unzips file to temporaty location, sets paths
 * - resolve - in case when deterministic method of finding API main file
 * fails, the application should aks a user to choose the main file.
 * - parse - parsing API data and returning AMF model.
 *
 * Example use:
 *
 * ```javascript
 * const service = new AmfService(filePathOrBuffer);
 * service.prepare()
 * .then(() => service.resolve())
 * .then((candidates) => {
 *  // If "candidates" is set then the application
 *  // should ask the user to select main file
 *  if (candidates) {
 *    return askUser(candidates);
 *  } else {
 *    return service.parse();
 *  }
 * })
 * .then((mainFile) => service.parse(mainFile))
 * .then((model) => console.log(model))
 * .catch((cause) => console.error(cause));
 * ```
 */
export class AmfService {
  /**
   * The same as with constructror but resets the sate.
   * @param {Buffer|String} source Location of the API file on the disk or
   * buffer of a file. If the source is a file and it's not a zip file then
   * it must be the API file.
   * @param {?Object} opts Process options:
   * - zip {Boolean} - if true it treats the source as a zip data. Files are
   * unzzipped to a temporary location before processing.
   * - validate {Boolean} - if true it validates the API when parsing.
   * Validation is made in the `parse` phase and results (as string) are stored
   * in `validationResult` property of the service.
   */
  setSource(source, opts) {
    if (!opts) {
      opts = {};
    }
    this.source = source;
    this.isZip = opts.zip;
    this.validate = opts.validate;
    // created at run time.
    /**
     * Temp folder data object.
     * @type {Object}
     */
    this.tmpobj = undefined;
    /**
     * A directory path where files are stored.
     * @type {String}
     */
    this._workingDir = undefined;
    /**
     * API main file (entry point) in the working directory.
     * If this is set it means the files has been resolved.
     * @type {String}
     */
    this._mainFile = undefined;
    /**
     * True when tmp object represents a file and not a directory
     * @type {Boolean}
     */
    this._tmpIsFile = false;
  }
  /**
   * Returns current working directory.
   * @return {String}
   */
  get workingDir() {
    return this._workingDir;
  }

  set workingDir(value) {
    this._workingDir = value;
  }

  /**
   * Cleans up if the operation is canceled.
   * This must be called if `prepare()` was called or otherwise some temporary
   * files will be kept on the disk.
   * @return {Promise}
   */
  async cancel() {
    await this._cleanTempFiles();
    this.tmpobj = undefined;
    this._workingDir = undefined;
    this._mainFile = undefined;
  }

  async cleanup() {
    this._cancelMonitorParser();
    this._cancelParseProcTimeout();
    const proc = this._parserProc;
    if (!proc) {
      return await this.cancel();
    }
    return new Promise((resolve) => {
      this._killParser();
      proc.on('exit', () => {
        this.cancel().then(() => resolve());
      });
    });
  }
  /**
   * Prepares the file to be processed.
   * @return {Promise}
   */
  async prepare() {
    if (this.isZip) {
      return await this._prepareZip();
    }
    if (this.source instanceof Buffer) {
      return await this._prepareBuffer();
    }
    const stat = await fs.stat(this.source);
    if (stat.isDirectory()) {
      this._workingDir = this.source;
    } else {
      this._workingDir = path.dirname(this.source);
      this._mainFile = path.basename(this.source);
    }
  }

  async _prepareZip() {
    try {
      await this._unzipSource();
    } catch (cause) {
      await this._cleanTempFiles();
      throw cause;
    }
  }

  async _prepareBuffer() {
    const location = await this._tmpBuffer(this.source);
    this._workingDir = path.dirname(location);
    this._mainFile = path.basename(location);
  }
  /**
   * Resolves the API structure and tries to find main API file.
   *
   * @return {Promise<Array<String>>} If promise resolves to an array it means
   * that API type could not be determined automatically.
   */
  async resolve() {
    if (this._tmpIsFile) {
      return;
    }
    if (!this._workingDir) {
      await this._cleanTempFiles();
      throw new Error(`prepare() function not called`);
    }
    if (this._mainFile) {
      return;
    }
    const search = new ApiSearch(this._workingDir);
    try {
      const result = await search.findApiFile();
      if (!result) {
        throw new Error('Unable to find API files in the source location');
      }
      if (result instanceof Array) {
        return result;
      }
      this._mainFile = result;
    } catch (cause) {
      await this._cleanTempFiles();
      throw cause;
    }
  }
  /**
   * Parses API data using AMF parser.
   * @param {String=} mainFile Main API file to use.
   * @return {Promise<Object>} A promise resolved to AMF model.
   */
  async parse(mainFile) {
    if (!this._workingDir) {
      await this._cleanTempFiles();
      throw new Error(`prepare() function not called`);
    }
    if (mainFile && typeof mainFile === 'string') {
      this._mainFile = mainFile;
    }
    if (!this._mainFile) {
      await this._cleanTempFiles();
      throw new Error(`resolve() function not called`);
    }
    const search = new ApiSearch(this._workingDir);
    const apiLocation = path.join(this._workingDir, this._mainFile);

    try {
      const type = await search._readApiType(apiLocation);
      const model = await this._runParser(apiLocation, type);
      await this._cleanTempFiles();
      return model;
    } catch (cause) {
      await this._cleanTempFiles();
      throw cause;
    }
  }
  /**
   * Unzpis the source to a tem folder.
   * @return {Promise}
   */
  async _unzipSource() {
    let buffer;
    if (this.source instanceof Buffer) {
      buffer = this.source;
    } else {
      buffer = await fs.readFile(this.source);
    }
    const location = await this._unzip(buffer);
    this._workingDir = location;
    await this._removeZipMainFolder(location);
  }

  async _tmpBuffer(buffer) {
    this.tmpobj = tmp.fileSync();
    this._tmpIsFile = true;
    const fd = this.tmpobj.fd;
    await fs.write(fd, buffer);
    await fs.close(fd);
    return this.tmpobj.name;
  }
  /**
   * Unzips API folder and returns path to the folder in tmp location.
   * @param {ArrayBuffer} buffer Zip data
   * @return {Promise}
   */
  _unzip(buffer) {
    this.tmpobj = tmp.dirSync();
    return new Promise((resolve, reject) => {
      const stream = new Duplex();
      stream.push(buffer);
      stream.push(null);
      const extractor = unzipper.Extract({
        path: this.tmpobj.name
      });
      extractor.on('close', () => {
        resolve(this.tmpobj.name);
      });
      extractor.on('error', (err) => {
        reject(err);
      });
      stream.pipe(extractor);
    });
  }
  /**
   * The zip may have source files enclosed in a folder.
   * This will look for a folder in the root path and will copy sources from it.
   *
   * @param {String} destination A place where the zip sources has been
   * extracted.
   * @return {Promise}
   */
  async _removeZipMainFolder(destination) {
    let files = await fs.readdir(destination);
    files = files.filter((item) => item !== '__MACOSX');
    if (files.length > 1) {
      return;
    }
    const dirPath = path.join(destination, files[0]);
    const stats = await fs.stat(dirPath);
    if (stats.isDirectory()) {
      await fs.copy(dirPath, destination);
    }
  }
  /**
   * Removes created temporary directory.
   * @return {Promise}
   */
  async _cleanTempFiles() {
    if (!this.tmpobj) {
      return;
    }
    if (this._tmpIsFile) {
      this.tmpobj.removeCallback();
      this.tmpobj = undefined;
      return;
    }
    await fs.emptyDir(this.tmpobj.name);
    this.tmpobj.removeCallback();
    this.tmpobj = undefined;
  }

  _createParserProcess() {
    if (this._parserProc) {
      if (this._parserProc.connected) {
        return this._parserProc;
      } else {
        this._killParser();
      }
    }
    const env = Object.assign({ NODE_OPTIONS: '--max-old-space-size=4096' }, process.env);
    const options = {
      execArgv: [],
      env
    };
    this._parserProc = fork(`${__dirname}/amf-parser.js`, options);
    this._parserProc.on('exit', () => {
      this._cancelParseProcTimeout();
      this._cancelMonitorParser();
      this._parserProc = undefined;
    });
    return this._parserProc;
  }

  _setParserProcTimeout(cb, time = 180000) {
    this._parserProcCb = cb;
    this._parserProceTimeout = setTimeout(() => {
      this._parserProceTimeout = undefined;
      this._killParser();
      const fn = this._parserProcCb;
      this._parserProcCb = undefined;
      fn();
    }, time);
  }

  _cancelParseProcTimeout() {
    if (this._parserProceTimeout) {
      clearTimeout(this._parserProceTimeout);
      this._parserProceTimeout = undefined;
      this._parserProcCb = undefined;
    }
  }

  _killParser() {
    this._cancelParseProcTimeout();
    this._cancelMonitorParser();
    if (this._parserProc) {
      this._parserProc.disconnect();
      this._parserProc.removeAllListeners('message');
      this._parserProc.removeAllListeners('error');
      this._parserProc.removeAllListeners('exit');
      this._parserProc.kill();
      this._parserProc = undefined;
    }
  }

  _monitorParserProc() {
    this._parserMinitorTimeout = setTimeout(() => {
      this._parserMinitorTimeout = undefined;
      this._killParser();
    }, 60000);
  }

  _cancelMonitorParser() {
    if (this._parserMinitorTimeout) {
      clearTimeout(this._parserMinitorTimeout);
    }
  }
  /**
   * Runs the parser.
   *
   * @param {String} apiLocation API file location
   * @param {Object} type API type info object.
   * @return {Promise}
   */
  _runParser(apiLocation, type) {
    this._cancelMonitorParser();
    return new Promise((resolve, reject) => {
      const callbacks = {
        onmessage: (result) => {
          if (result.validation) {
            console.log(result.validation);
            return;
          }
          this._cancelParseProcTimeout();
          this._parserProc.removeAllListeners('message', callbacks.onmessage);
          this._parserProc.removeAllListeners('error', callbacks.onerror);
          this._parserProcCb = undefined;
          this._monitorParserProc();
          this._killParser();
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result.api);
          }
        },
        onerror: (err) => {
          this._cancelParseProcTimeout();
          this._parserProc.removeAllListeners('message', callbacks.onmessage);
          this._parserProc.removeAllListeners('error', callbacks.onerror);
          this._parserProcCb = undefined;
          this._monitorParserProc();
          reject(new Error(err.message || 'Unknown error'));
        }
      };

      const proc = this._createParserProcess();
      this._setParserProcTimeout(() => {
        reject(new Error('API parsing timeout'));
        this._parserProc.removeAllListeners('message', callbacks.onmessage);
        this._parserProc.removeAllListeners('error', callbacks.onerror);
        this._monitorParserProc();
      });
      proc.on('message', callbacks.onmessage);
      proc.on('error', callbacks.onerror);
      proc.send({
        source: apiLocation,
        from: type,
        validate: this.validate
      });
    });
  }
}
