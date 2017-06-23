/**
 * This file runs the API Console builder node module to create a bundled file of sources.
 */
const builder = require('api-console-builder');
const fs = require('fs');

builder({
  src: 'https://github.com/mulesoft/api-console/archive/release/4.0.0.zip',
  dest: 'build',
  raml: 'api/api.raml', // note that the deploy.sh script will clone the repo to api/ folder.
  useJson: true,
  verbose: true
})
.then(() => {
  console.log('Build complete');
})
.catch((cause) => console.log('Build error', cause.message));
