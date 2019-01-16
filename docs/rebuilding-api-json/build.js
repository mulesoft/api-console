 const amf = require('amf-client-js');
 const fs = require('fs');

 amf.plugins.document.WebApi.register();
 amf.plugins.document.Vocabularies.register();
 amf.plugins.features.AMFValidation.register();

 const RAML_SOURCE = 'api/api.raml';
 const API_OUTPUT = 'api.json';
 const API_TYPE = 'RAML 1.0';

 amf.Core.init()
 .then(() => {
   const parser = amf.Core.parser(API_TYPE, 'application/yaml');
   return parser.parseFileAsync(`file://${RAML_SOURCE}`);
 })
 .then((doc) => {
   // Validation is optional but it is nice to know if your API contains errors.
   // This will be saved to Travis logs.
   const validateProfile = amf.ProfileNames.RAML;
   // amf.ProfileNames.RAML08 for RAML 0.8
   // amf.ProfileNames.OAS for OAS
   return amf.AMF.validate(doc, validateProfile)
     .then((report) => {
       if (!report.conforms) {
         console.log(report.toString());
       }
       return doc;
     });
 })
 .then((doc) => {
   // Assuming RAML 1.0 but it can be RAM 08, OAS 2.0, or OAS 3.0
   const resolver = amf.Core.resolver(API_TYPE);
   doc = resolver.resolve(doc, 'editing');
   // the `editing` is special case of producing AMF model for API console.
   const opts = amf.render.RenderOptions().withSourceMaps.withCompactUris;
   // This options prepare a compact json-ld model and adds source maps to the
   // model.
   const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
   return generator.generateString(doc, opts);
 })
 .then((data) => {
   fs.writeFileSync(API_OUTPUT, data, 'utf8');
   console.log('Build complete');
 })
 .catch((cause) => {
   console.log('Build error', cause.message);
   process.exit(1);
 });
