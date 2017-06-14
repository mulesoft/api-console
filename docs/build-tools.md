# API Console build tools

The API console comes with a set of tools to help you create documentation for your API quickly.

**Learn more**
Check out our examples of how to use our build tools in the CI process based on Travis:
- [Building API Console for GitHub pages on Travis](gh-pages.md)
- [Rebuilding the api.json file in the CI process](rebuilding-api-json.md)

## CLI

### Installation

Install the CLI tool globally using `-g` if possible. 

```shell
$ sudo npm install -g api-console-cli
```

If you can't perform the global installation for some reason, then omit `-g` and run the command prefixing `api-console-cli` with `./node_modules/.bin/`.

### Features

- build - Builds the api console application optimized for production.
- generate-json - Regenerates the JSON file that can be used as a data source in the console.

For more information, see https://github.com/mulesoft-labs/api-console-cli.

### Examples

Build API Console from the latest released version and use `https://domain.com/api.raml` as a data source.

```shell
$ api-console build https://domain.com/api.raml
```

Build API Console from local sources (`--source api-console-release.zip`) that is a zip file of a release (`--source-is-zip`). This command will automatically assume the `--json` option is set.

```shell
$ api-console build --source api-console-release.zip --source-is-zip api.raml
```

Build API console and generate the `api.json` file that will be included in the build.

```shell
$ api-console build --json api.raml
```

**Note** The build includes a series of optimizations, such as a power and time intensive JavaScript compilation, that take a few minutes. You can pass  the `--no-optimization` flag to make the build process faster, but do so only in a development environment.

## Node

### api-console-builder

This is the node module that builds API console from the api-console element either as a embeddable element or as a standalone application.

For more information, see the [api-console-builder](https://www.npmjs.com/package/api-console-builder) page.

#### Installation

```shell
$ npm i api-console-builder
```

#### Examples

This example builds a standalone application of API Console that uses a specific release version from GitHub as the element source and an API definition from the `api.raml` file. The build generates a separate `api.json` file with RAML parsing results for faster initialization.

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

This is the node package that enhances JSON output of the RAML parser. Enhanced JSON is used as an input for ARC elements and API Console.

Use this package in your CI process to replace the `api.json` file instead of regenerating the whole API console application.

For more information, see the [raml-json-enhance-node](https://www.npmjs.com/package/raml-json-enhance-node) page.

#### Installation

```shell
$ npm i raml-json-enhance-node
```

#### Examples

Generate enhanced JSON from the RAML file:

```javascript
const {RamlJsonGenerator} = require('raml-json-enhance-node');

const enhancer = new RamlJsonGenerator('./api.raml');
enhancer.generate()
.then((json) => {
  console.log(json);
});
```

Generate enhanced JSON from the RAML file, but save output to a file:

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
