/**
 * This file runs the API Console builder node module to create a bundled file of sources.
 */
const {RamlJsonGenerator} = require('raml-json-enhance-node');

const RAML_SOURCE = 'api/api.raml';
const API_OUTPUT = 'api.json';

const enhancer = new RamlJsonGenerator(APIFILE, {
  output: API_OUTPUT
});

enhancer.generate()
.then(() => {
  console.log('Build complete');
})
.catch((cause) => {
  console.log('Build error', cause.message);
  process.exit(1);
});
