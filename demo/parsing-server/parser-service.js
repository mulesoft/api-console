const tmp = require('tmp');
const fs = require('fs-extra');
const path = require('path');
const Duplex = require('stream').Duplex;
const unzip = require('unzip');
const amf = require('amf-client-js');

const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
const ramlParser = amf.Core.parser('RAML 1.0', 'application/raml');
const ramlParser8 = amf.Core.parser('RAML 0.8', 'application/raml');
const openAPIParser = amf.Core.parser('OAS 2.0', 'application/json');
const apiModelParser = amf.Core.parser('AMF Graph', 'application/ld+json');

/**
 * AMF demo parser for API console.
 */
class ParserService {
  /**
   * Handle for data parsing (text data)
   *
   * @param {Object} req
   * @param {Object} res
   */
  parseData(req, res) {
    const dataType = req.body.dataType;
    const dataFormat = req.body.dataFormat;
    const dataValue = req.body.dataValue;
    let p;
    switch (dataFormat) {
      case 'url':
        p = this.processFile(dataValue, dataType);
        break;
      case 'text':
        p = this.processData(dataValue, dataType);
        break;
      default:
        p = Promise.reject(new Error('Unknown data format'));
    }
    p.then((data) => {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    })
    .catch((cause) => {
      const m = cause.message || cause.s$1 || 'unknown error';
      const body = JSON.stringify({
        error: true,
        message: m
      }, null, 2);
      res.set('Content-Type', 'application/json');
      res.status(500).send(body);
      console.error(m);
    });
  }
  /**
   * Parses file data
   * @param {Object} req
   * @param {Object} res
   */
  parseFiles(req, res) {
    const file = req.files[0];
    const dataType = req.body.dataType;
    this.getFileLocation(file, dataType)
    .then((file) => {
      file = `file://${file}`;
      return this.processFile(file, dataType);
    })
    .then((data) => {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
      this.cleanTempFiles();
    })
    .catch((cause) => {
      console.error(cause);
      const body = JSON.stringify({
        error: true,
        message: cause.message
      }, null, 2);
      res.set('Content-Type', 'application/json');
      res.status(500).send(body);
      this.cleanTempFiles();
    });
  }
  /**
   * Processes locally oxternally stored file.
   *
   * @param {String} file File location
   * @param {Strnig} from `raml`, `oas` or `amf`
   * @return {Promise}
   */
  processFile(file, from) {
    let type;
    switch (from) {
      case 'raml': type = 'RAML 1.0'; break;
      case 'raml8': type = 'RAML 0.8'; break;
      case 'oas': type = 'OAS 2.0'; break;
      case 'amf': type = 'AMF Graph'; break;
    }
    console.log('Parsing API');
    const parser = amf.Core.parser(type, 'application/yaml');
    console.log('Processing', file, ', format', from);
    return parser.parseFileAsync(file)
    .then((doc) => this.generateModel(doc, from));
  }
  /**
   * Processes text content.
   *
   * @param {String} data String to parse
   * @param {Strnig} from `raml`, `oas` or `amf`
   * @return {Promise}
   */
  processData(data, from) {
    let parser;
    switch (from) {
      case 'raml': parser = ramlParser; break;
      case 'raml8': parser = ramlParser8; break;
      case 'oas': parser = openAPIParser; break;
      case 'amf': parser = apiModelParser; break;
    }
    return parser.parseStringAsync(data)
    .then((doc) => this.generateModel(doc, from));
  }
  /**
   * Generates a model.
   *
   * @param {Object} doc Parsed document
   * @param {Strnig} from `raml`, `oas` or `amf`
   * @return {Promise}
   */
  generateModel(doc, from) {
    console.log('Generating model');
    let resolver;
    switch (from) {
      case 'raml': resolver = amf.Core.resolver('RAML 1.0'); break;
      case 'raml8': resolver = amf.Core.resolver('RAML 0.8'); break;
      case 'oas': resolver = amf.Core.resolver('OAS 2.0'); break;
    }
    if (resolver) {
      doc = resolver.resolve(doc, 'editing');
    }
    const opts = amf.render.RenderOptions().withSourceMaps.withCompactUris;
    return generator.generateString(doc, opts);
  }

  /**
   * Gets file contents
   *
   * @param {Object} file
   * @param {String} dataType Expected data type.
   * @return {Promise}
   */
  getFileLocation(file, dataType) {
    this.tmpobj = tmp.dirSync();
    return new Promise((resolve, reject) => {
      if (file.mimetype === 'application/zip') {
        let stream = new Duplex();
        stream.push(file.buffer);
        stream.push(null);
        const extractor = unzip.Extract({
          path: this.tmpobj.name
        });
        extractor.on('close', () => {
          this._removeZipMainFolder(this.tmpobj.name)
          .then(() => this._findApiFile(this.tmpobj.name, dataType))
          .then((file) => resolve(path.join(this.tmpobj.name, file)))
          .catch(() => resolve(path.join(this.tmpobj.name, 'api.raml')));
        });
        extractor.on('error', (err) => {
          reject(err);
        });
        stream.pipe(extractor);
      } else {
        const fileName = this.tmpobj.name + '/api.raml';
        fs.writeFile(fileName, file.buffer, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(fileName);
          }
        });
      }
    });
  }
  /**
   * Removes temp folder.
   */
  cleanTempFiles() {
    if (this.tmpobj) {
      fs.emptyDir(this.tmpobj.name)
      .then(() => this.tmpobj.removeCallback());
    }
  }

  /**
   * The zip may have source files enclosed in a folder.
   * This will look for a folder in the root path and will copy sources from it.
   *
   * @param {String} destination A place where the zip sources has been
   * extracted.
   * @return {Promise}
   */
  _removeZipMainFolder(destination) {
    return fs.readdir(destination)
    .then((files) => {
      // Clears macos files
      files = files.filter((item) => item !== '__MACOSX');
      if (files.length > 1) {
        return Promise.resolve();
      }
      const dirPath = path.join(destination, files[0]);
      return fs.stat(dirPath)
      .then((stats) => {
        if (stats.isDirectory()) {
          return fs.copy(dirPath, destination);
        }
      });
    });
  }
  /**
   * Finds main API name.
   * If the `api.raml` is present then it always points to the file.
   * If not then, if any RAML file exists it points to first raml file.
   * If not then,it returns `api.raml`
   * @param {String} destination Path where to look for the files.
   * @param {String} dataType API data type.
   * @return {Promise<String>}
   */
  _findApiFile(destination, dataType) {
    return fs.readdir(destination)
    .then((items) => {
      const defs = [];
      const exts = [];
      if (dataType === 'raml' || dataType === 'raml8') {
        defs[defs.length] = 'api.raml';
        exts[exts.length] = '.raml';
      }
      if (dataType === 'oas') {
        defs[defs.length] = 'api.yaml';
        defs[defs.length] = 'api.json';
        exts[exts.length] = '.json';
        exts[exts.length] = '.yaml';
      }
      const _files = [];
      for (let i = 0; i < items.length; i++) {
        let lower = items[i].toLowerCase();
        if (defs.indexOf(lower) !== -1) {
          return items[i];
        }
        if (exts.indexOf(path.extname(lower)) !== -1) {
          _files.push(items[i]);
        }
      }
      if (_files.length) {
        return _files[0];
      }
      return defs[0];
    });
  }
}

module.exports.ParserService = ParserService;
