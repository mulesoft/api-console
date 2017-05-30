# API Console build tools

The API console comes with a set of tools that will help you with creating a documentation for your API very quickly.

## api-console CLI

### Installation

Preferred way is to install the CLI tool globally. If you can't then install it without `-g` and run the commands prefixing the `api-console` with `./node_modules/.bin/`.

```shell
$ sudo npm install -g api-console-cli
```

### Features

- build - Build the api console application optimized for production
- generate-json - Regenerates the JSON file that can be used as a data source in the Console

See https://github.com/mulesoft-labs/api-console-cli for full documentation.

### Examples

Build the API console from the latest released version and using `https://domain.com/api.raml` as a data source.

```shell
$ api-console build https://domain.com/api.raml
```

Build the API Console from local sources (`--source api-console-release.zip`) that is a zip file of a release (`--source-is-zip`). Note that this command will automatically assume the `--json` option to be set.

```shell
$ api-console build --source api-console-release.zip --source-is-zip api.raml
```

Build the API console and generate the `api.json` file that will be included in the build.

```shell
$ api-console build --json api.raml
```

**Note** Because of series of optimizations (among others the most computing power and time consuming JavaScript compilation) it will take few minutes to build the console. You can pass `--no-optimization` flag to make the build process faster but it should be used in development environment only.

## API Console node modules

### api-console-builder

The node module to build the API console from the api-console element either as a embeddable element or as a standalone application.

See detailed documentation in the [api-console-builder](https://www.npmjs.com/package/api-console-builder) page.

### Installation

```shell
$ npm i api-console-builder
```

### Examples

Will build a standalone application of the API Console that uses a specific release version from GitHub as the element source and API definition from the `api.raml` file. It will generate a separate `api.json` file with RAML parsing results for faster initialization.

```javascript
const builder = require('api-console-builder');

builder({
  src: 'https://github.com/mulesoft/api-console/archive/release/4.0.0.zip',
  dest: 'build',
  raml: 'api.raml',
  useJson: true,
  verbose: true
})
.then(() => console.log('Build complete'))
.catch((cause) => console.log('Build error', cause.message));
```

### raml-json-enhance-node

A RAML's JSON enhancer node package to enhance JSON output of the RAML parser. Enhanced JSON to be used as an input for ARC elements and the API Console.

It's ideal to use it in your CI process to replace the `api.json` file instead of regenerating the whole API console application.

See detailed documentation in the [raml-json-enhance-node](https://www.npmjs.com/package/raml-json-enhance-node) page.

### Installation

```shell
$ npm i raml-json-enhance-node
```

### Examples

Generating enhanced JSON from the RAML file:

```javascript
const {RamlJsonGenerator} = require('raml-json-enhance-node');

const enhancer = new RamlJsonGenerator('./api.raml');
enhancer.generate()
.then((json) => {
  console.log(json);
});
```

Like above but output will be saved to a file:

```javascript
const {RamlJsonGenerator} = require('raml-json-enhance-node');

const enhancer = new RamlJsonGenerator('./api.raml', {
  output: './api.json'
});
enhancer.generate()
.then((json) => {
  // The file is saved now.
  // And the JS object is available to use.
  console.log(json);
});
```
