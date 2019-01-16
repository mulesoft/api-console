/**
 * This file builds the API console
 */
const builder = require('api-console-builder');

builder({
  verbose: true,
  destination: 'build', // Optional, default to "build"
  // note that the deploy.sh script will clone the repo to api/ folder.
  api: 'YOUR RAML FILE LOCATION OR URL',
  apiType: 'API TYPE EG RAML 1.0',
  tagName: '5.0.0', // builds the console from specific version
  embedded: false // default is false
})
.then(() => {
  console.log('Build complete');
})
.catch((cause) => console.log('Build error', cause.message));
