import { AmfService } from './amf-service/amf-service.js';
import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';

export class ApiParser {
  async parseFile(request) {
    const buff = await this.readIncommingMessage(request);
    const data = await this.processBuffer(buff);
    return data;
  }

  get store() {
    if (!this._store) {
      this._store = new NodeCache({
        stdTTL: 300,
        checkperiod: 120,
        useClones: false
      });

      this._store.on('expired', this._cacheExpired.bind(this));
    }
    return this._store;
  }

  get service() {
    if (!this._amfService) {
      this._amfService = new AmfService();
    }
    return this._amfService;
  }

  /**
   * Parses API data to AMF model.
   * @param {Buffer} buffer Buffer created from API file.
   * @param {Object=} opts Processing options:
   * - zip {Boolean} If true the buffer represents zipped file.
   * @return {Promise<Object>} Promise resolved to the AMF json-ld model
   */
  async processBuffer(buffer, opts) {
    if (this._bufferIsZip(buffer)) {
      if (!opts) {
        opts = {};
      }
      opts.zip = true;
    }
    const service = this.service;
    service.setSource(buffer, opts);

    await service.prepare();
    const candidates = await service.resolve();
    if (candidates) {
      const key = uuidv4();
      const { workingDir, tmpobj } = service;
      this.store.set(key, [workingDir, tmpobj]);
      return {
        code: 300, // Multiple Choices
        data: {
          candidates,
          key
        }
      };
    } else {
      // TODO (pawel): The API should return 201 and the key to use
      // the retreive the data later. The API processing should be async.
      const api = await service.parse();
      return {
        code: 200, // OK, should be 202 accepted
        data: {
          api
        }
      };
    }
  }

  /**
   * Tests if the buffer has ZIP file header.
   * @param {Buffer} buffer File buffer
   * @return {Boolean} true if the buffer is compressed zip.
   */
  _bufferIsZip(buffer) {
    return buffer[0] === 0x50 && buffer[1] === 0x4b;
  }

  async readIncommingMessage(request) {
    return new Promise((resolve, reject) => {
      let message;
      request.on('data', (chunk) => {
        try {
          if (message) {
            message = Buffer.concat([message, chunk]);
          } else {
            message = chunk;
          }
        } catch (e) {
          reject(e);
          throw e;
        }
      });

      request.on('end', () => {
        resolve(message);
      });
    });
  }

  checkStatus(id) {
    console.log(id);
  }

  async parseCandidate(request) {
    const buff = await this.readIncommingMessage(request);
    let message = buff.toString();
    try {
      message = JSON.parse(message);
    } catch (e) {
      return {
        error: true,
        code: 400,
        message: 'Unable to process the message',
        detail: e.message
      };
    }
    const { key, file } = message;
    if (!key) {
      return {
        error: true,
        code: 400,
        message: 'The "key" property is missing',
        detail: 'Provide "key" property which you have got from parse API request.'
      };
    }
    const value = this.store.get(key);
    if (!value) {
      return {
        error: true,
        code: 410, // Gone
        message: 'The API files are no longer available.',
        detail: 'The cache for the API files expired and no longer available. Try all over.'
      };
    }
    this.store.del(key);
    const service = this.service;
    const [workingDir, tmpobj] = value;
    service.workingDir = workingDir;
    service.tmpobj = tmpobj;
    const api = await service.parse(file);
    return {
      code: 200, // OK, should be 202 accepted
      data: {
        api
      }
    };
  }

  async _cacheExpired(key, value) {
    const [workingDir, tmpobj] = value;
    this.service.workingDir = workingDir;
    this.service.tmpobj = tmpobj;
    await this.service._cleanTempFiles();
  }
}
