/**
 * This file runs the API Console builder node module to create
 * a bundled file of sources.
 */

const builder = require('api-console-builder');

builder({
  verbose: true,
  destination: 'build', // Optional, default to "build"
  // note that the deploy.sh script will clone the repo to api/ folder.
  api: 'api/api.raml',
  apiType: 'RAML 1.0',
  tagName: '5.0.0-preview-1' // builds the console from specific version
})
.then(() => {
  console.log('Build complete');
})
.catch((cause) => console.log('Build error', cause.message));
