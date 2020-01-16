const generator = require('@api-components/api-model-generator');
generator('demo/apis.json', {
  dest: 'demo/models/'
})
.then(() => console.log('Models created'))
.catch((cause) => console.error(cause));
