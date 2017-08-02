/**
 * This file builds the API console
 */
const builder = require('api-console-builder');
const fs = require('fs');

builder({
  src: 'https://github.com/mulesoft/api-console/archive/release/4.0.0.zip',
  dest: 'build',
  raml: 'YOUR RAML FILE LOCATION OR URL',
  verbose: false,
  jsCompilationLevel: 'SIMPLE',
  useJson: true // will generate api.json file
})
.then(() => {
  console.log('Build complete');
})
.catch((cause) => console.log('Build error', cause.message));
