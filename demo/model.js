/* eslint-disable no-console */
// eslint-disable-next-line no-undef
const generator = require('@api-components/api-model-generator');
generator('demo/apis.json', {
  dest: 'demo/models/'
}).
then(() => console.log('Models created')).
catch((cause) => console.error(cause));

generator('demo/flattened-apis.json', {
  dest: 'demo/models/flattened/'
}).
then(() => console.log('Models created')).
catch((cause) => console.error(cause));
