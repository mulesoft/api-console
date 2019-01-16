# API Console build tools

API console comes with a set of tools to help you create documentation for your API quickly.

**Learn more**

Check out our examples of how to use our build tools in CI pipeline with Travis:
-   [Building API Console for GitHub pages on Travis](gh-pages.md)
-   [Rebuilding the api.json file in the CI process](rebuilding-api-json.md)

## CLI

### Installation

Install the CLI tool globally using `-g` if possible.

```shell
$ sudo npm install -g api-console-cli
```

Note, `sudo` is not required on Windows.

If you can't perform the global installation for some reason, then omit `-g` and run the command prefixing `api-console-cli` with `./node_modules/.bin/`.

### Features

-   build - Builds the api console application optimized for production.
-   generate-json - Regenerates the JSON file that can be used as a data source in the console.

For more information, see [api-console-cli](https://github.com/mulesoft-labs/api-console-cli) page.

### Examples

Build API Console from the latest released version and use `path/to/api.raml` file as the data source. The API is a RAML 1.0 spec file.

```shell
$ api-console -t "RAML 1.0" -a path/to/api.raml
```

Build API Console from local sources (`--local api-console-release.zip`) which is a zip file of a release.

```shell
$ api-console build -t "RAML 1.0" --local api-console-release.zip -a path/to/api.raml
```

Full documentation: [github.com/mulesoft-labs/api-console-cli/blob/master/docs/api-console-build.md](https://github.com/mulesoft-labs/api-console-cli/blob/master/docs/api-console-build.md)

## Node

### api-console-builder

This is the node module that builds API console from the api-console element either as a embeddable element or as a standalone application.

#### Installation

```shell
$ npm i --save-dev @api-components/api-console-builder
```

#### Example

This example builds a standalone application of API Console that uses a specific release version from GitHub as the element source and an API definition from the `api.raml` file.

```javascript
const builder = require('api-console-builder');

builder({
  api: 'path/to/api.raml',
  apiType: 'RAML 1.0',
  tagName: '5.0.0-preview-1',
  destination: './api-console-bundles'
})
.then(() => console.log('Build complete <3'))
.catch((cause) => console.log('Build error <\\3', cause.message));
```

For more information, see the [api-console-builder](https://www.npmjs.com/package/api-console-builder) docs page.
