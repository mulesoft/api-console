const tmp = require('tmp');
const fs = require('tmp');
const Duplex = require('stream').Duplex;
const unzip = require('unzip');
const amf = require('amf-client-js');

const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
const ramlParser = amf.Core.parser('RAML 1.0', 'application/raml');
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
    res.send('ok');
  }
  /**
   * Parses file data
   * @param {Object} req
   * @param {Object} res
   */
  parseFiles(req, res) {
    const file = req.files[0];
    const dataType = req.body.dataType;
    this.getFileLocation(file)
    .then((file) => this.processLocalFile(file, dataType))
    .then((data) => {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
      this.cleanTempFiles();
    })
    .catch((cause) => {
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
   * Processes locally stored file.
   *
   * @param {String} file File location
   * @param {Strnig} from `raml`, `oas` or `amf`
   * @return {Promise}
   */
  processLocalFile(file, from) {
    let parser;
    switch (from) {
      case 'raml': parser = ramlParser; break;
      case 'oas': parser = openAPIParser; break;
      case 'amf': parser = apiModelParser; break;
    }
    return parser.parseFileAsync(`file://${file}`)
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
    let resolver;
    switch (from) {
      case 'raml': resolver = amf.Core.resolver('RAML 1.0'); break;
      case 'oas': resolver = amf.Core.resolver('OAS 2.0'); break;
    }
    if (resolver) {
      doc = resolver.resolve(doc, 'editing');
    }
    return generator.generateString(doc);
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
          resolve(this.tmpobj.name + '/api.raml');
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
      this.tmpobj.removeCallback();
    }
  }
}

module.exports.ParserService = ParserService;
