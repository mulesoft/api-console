const tmp = require('tmp');
const fs = require('fs-extra');
const path = require('path');
const Duplex = require('stream').Duplex;
const unzip = require('unzip');
const amf = require('amf-client-js');
const jsonld = require('jsonld');

const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
const ramlParser = amf.Core.parser('RAML 1.0', 'application/raml');
const openAPIParser = amf.Core.parser('OAS 2.0', 'application/json');
const apiModelParser = amf.Core.parser('AMF Graph', 'application/ld+json');

const ldContext = {
  'raml-http': 'http://a.ml/vocabularies/http#',
  'shacl': 'http://www.w3.org/ns/shacl#',
  'raml-shapes': 'http://a.ml/vocabularies/shapes#',
  'security': 'http://a.ml/vocabularies/security#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'data': 'http://a.ml/vocabularies/data#',
  'doc': 'http://a.ml/vocabularies/document#',
  'schema-org': 'http://schema.org/',
  'xsd': 'http://www.w3.org/2001/XMLSchema#',
  'hydra': 'http://www.w3.org/ns/hydra/core#'
};
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
    const compactModel = req.body.compactModel;
    let p;
    switch (dataFormat) {
      case 'url':
        p = this.processFile(dataValue, dataType, compactModel);
        break;
      case 'text':
        p = this.processData(dataValue, dataType, compactModel);
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
    const compactModel = req.body.compactModel;
    this.getFileLocation(file)
    .then((file) => {
      file = `file://${file}`;
      return this.processFile(file, dataType, compactModel);
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
   * @param {?Boolean} compactModel True to generate compact data model
   * @return {Promise}
   */
  processFile(file, from, compactModel) {
    let parser;
    switch (from) {
      case 'raml': parser = ramlParser; break;
      case 'oas': parser = openAPIParser; break;
      case 'amf': parser = apiModelParser; break;
    }
    return parser.parseFileAsync(file)
    .then((doc) => this.generateModel(doc, from, compactModel));
  }
  /**
   * Processes text content.
   *
   * @param {String} data String to parse
   * @param {Strnig} from `raml`, `oas` or `amf`
   * @param {?Boolean} compactModel True to generate compact data model
   * @return {Promise}
   */
  processData(data, from, compactModel) {
    let parser;
    switch (from) {
      case 'raml': parser = ramlParser; break;
      case 'oas': parser = openAPIParser; break;
      case 'amf': parser = apiModelParser; break;
    }
    return parser.parseStringAsync(data)
    .then((doc) => this.generateModel(doc, from, compactModel));
  }
  /**
   * Generates a model.
   *
   * @param {Object} doc Parsed document
   * @param {Strnig} from `raml`, `oas` or `amf`
   * @param {?Boolean} compactModel True to generate compact data model
   * @return {Promise}
   */
  generateModel(doc, from, compactModel) {
    let resolver;
    switch (from) {
      case 'raml': resolver = amf.Core.resolver('RAML 1.0'); break;
      case 'oas': resolver = amf.Core.resolver('OAS 2.0'); break;
    }
    if (resolver) {
      doc = resolver.resolve(doc, 'editing');
    }
    return generator.generateString(doc)
    .then((model) => {
      if (!compactModel) {
        return model;
      }
      return this._compact(model);
    });
  }

  _compact(model) {
    return new Promise((resolve) => {
      jsonld.compact(JSON.parse(model), ldContext, (err, compacted) => {
        if (err) {
          throw err;
        }
        resolve(JSON.stringify(compacted));
      });
    });
  }

  /**
   * Gets file contents
   *
   * @param {Object} file
   * @return {Promise}
   */
  getFileLocation(file) {
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
          .then(() => this._findApiFile(this.tmpobj.name))
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
   * @return {Promise<String>}
   */
  _findApiFile(destination) {
    return fs.readdir(destination)
    .then((items) => {
      const def = 'api.raml';
      const _files = [];
      for (let i = 0; i < items.length; i++) {
        let lower = items[i].toLowerCase();
        if (lower === def) {
          return def;
        }
        if (path.extname(lower) === '.raml') {
          _files.push(items[i]);
        }
      }
      if (_files.length) {
        return _files[0];
      }
      return def;
    });
  }
}

module.exports.ParserService = ParserService;
