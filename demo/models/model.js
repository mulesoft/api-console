const amf = require('amf-client-js');
const fs = require('fs');

amf.plugins.document.WebApi.register();
amf.plugins.document.Vocabularies.register();
amf.plugins.features.AMFValidation.register();

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('array-body/array-body.raml', 'RAML 1.0');
files.set('appian-api/appian-api.raml', 'RAML 1.0');
files.set('nexmo-sms-api/nexmo-sms-api.raml', 'RAML 1.0');
files.set('exchange-experience-api/exchange-experience-api.raml', 'RAML 0.8');
/**
 * Generates json/ld file from parsed document.
 *
 * @param {Object} doc
 * @param {String} file
 * @return {Promise}
 */
function processFile(doc, file) {
  const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
  const r = amf.Core.resolver('RAML 1.0');
  doc = r.resolve(doc, 'editing');
  let dest = file.substr(0, file.lastIndexOf('.')) + '.json';
  if (dest.indexOf('/') !== -1) {
    dest = dest.substr(dest.lastIndexOf('/'));
  }
  return generator.generateString(doc)
  .then((data) => fs.writeFileSync('demo/models/' + dest, data, 'utf8'));
}
/**
 * Parses file and sends it to process.
 *
 * @param {String} file File name in `demo` folder
 * @param {String} type Source file type
 * @return {String}
 */
function parseFile(file, type) {
  const parser = amf.Core.parser(type, 'application/yaml');
  return parser.parseFileAsync(`file://demo/models/${file}`)
  .then((doc) => processFile(doc, file));
}

amf.Core.init().then(() => {
  const promises = [];
  for (const [file, type] of files) {
    promises.push(parseFile(file, type));
  }

  Promise.all(promises)
  .then(() => console.log('Success'))
  .catch((e) => console.error(e));
});
