# The API Console

An API console for RAML (Restful Api Modeling Language) documents. The RAML Console allows browsing of API documentation and in-browser testing of API methods.

## Introduction

The API console is a single HTML element build on top of the [Web Components specifications](https://www.webcomponents.org/introduction) and powered by the [Polymer library](https://www.polymer-project.org/). Knowledge about how polymer works won't be necessary for using the console.

The element can be used to display documentation for the API defined in RAML. Basic usage of the element is as simple as using any other HTML element:

```html
<api-console></api-console>
```

See full usage documentaiton [below](#usage).

## Preview and development

1. Clone the element:
```
git clone https://github.com/mulesoft/api-console.git
cd api-console
```

2. Checkout develop version
```
git checkout develop
```

3. Install [polymer-cli](https://www.polymer-project.org/1.0/docs/tools/polymer-cli) and Bower
```
sudo npm install -g bower polymer-cli
```

4. Install dependencies
```
bower install
```

5. Serve the element
```
polymer serve --open -p 8080
```

Default page is the element documentation. Switch to demo to see working example.

You can also append the `/demo/` to the URL to switch to demo page permanently.

## Usage

### Install

Install the console as a dependency of your project. We use [bower](https://bower.io/) for this.

```
bower install --save mulesoft/api-console#4.0.0
```

Bower will also install dependencies of the console.

### Import to the web page

For the element to be recognized by the browser as a new HTML element you have to include it in the page source.

```html
<link rel="import" href="bower_components/api-console/api-console.html">
```

### Use the HTML tag

```html
<body>
  <api-console raml="{...}"></api-console>
</body>
```

How to pass RAML data to the element is described below in the [Passing the RAML data](#passing-the-raml-data) section.

A full list of available configurations for the `api-console` element can be found inside section [Element configuration (attributes)](#element-configuration-attributes).

### Setup polyfills

This step is not required if you targeting modern browsers only!

Web components are based on four new specifications (Custom elements, shadow DOM, HTML imports and HTML template) that are not fully supported in legacy browsers (like IE). Also, browser vendors still discussing the HTML imports specification so it's not implemented in Edge and Firefox yet.

If you planning to target these browsers you must include a polyfill for Web Components. The polyfill library is already included into your project (giving you have installed the element using `bower`).

Example use of the polyfill library:

```html
<head>
  ...
  <script>
  (function() {
    'use strict';
    var onload = function() {
      // For native Imports, manually fire WebComponentsReady so user code
      // can use the same code path for native and polyfill'd imports.
      if (!window.HTMLImports) {
        document.dispatchEvent(
          new CustomEvent('WebComponentsReady', {bubbles: true})
        );
      }
    };
    var webComponentsSupported = (
      'registerElement' in document &&
      'import' in document.createElement('link') &&
      'content' in document.createElement('template')
    );
    if (!webComponentsSupported) {
      var script = document.createElement('script');
      script.async = true;
      script.src = '/bower_components/webcomponentsjs/webcomponents-lite.min.js';
      script.onload = onload;
      document.head.appendChild(script);
    } else {
      onload();
    }
  })();
  </script>
</head>
...
```

### Full example

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
    <script>
      window.Polymer = {
        dom: 'shadow' // this is optional
      };
      // Load webcomponentsjs polyfill if browser does not support native Web Components
      (function() {
        'use strict';
        var onload = function() {
          // For native Imports, manually fire WebComponentsReady so user code
          // can use the same code path for native and polyfill'd imports.
          if (!window.HTMLImports) {
            document.dispatchEvent(
              new CustomEvent('WebComponentsReady', {bubbles: true})
            );
          }
        };

        var webComponentsSupported = (
          'registerElement' in document &&
          'import' in document.createElement('link') &&
          'content' in document.createElement('template')
        );

        if (!webComponentsSupported) {
          var script = document.createElement('script');
          script.async = true;
          script.src = '/bower_components/webcomponentsjs/webcomponents-lite.min.js';
          script.onload = onload;
          document.head.appendChild(script);
        } else {
          onload();
        }
      })();
    </script>
    <link rel="import" href="bower_components/api-console/api-console.html">
  </head>
<body>
  <api-console raml="{...}"></api-console>
</body>
</html>
```

## Passing the RAML data

### Before you begin: asynchronous environment

Web components are asynchronous by nature. It means that elements import,
registering them in the DOM and finally initializing the element is made asynchronously. Therefore you can't expect the element to work right after loading the page (as regular HTML elements does). Consider following example:

```html
<raml-js-parser json></raml-js-parser>
<script>
var parser = document.querySelector('raml-js-parser');
parser.loadApi(apiFileUrl);
</script>
```

Running this code on page load will throw a `TypeError` with the message: `parser.loadApi is not a function`.

It's because at the time of execution of the script block the browser knows nothing about the `raml-js-parser` element. At the time it is an instance of `HTMLUnknownElement`.

The browser hast to execute the import first and then the Polymer library has to register the HTML element called `raml-js-parser`.

To run the code properly you have to listen for the `WebComponentsReady` event. It's fired when the elements are ready to use.

```html
<raml-js-parser json></raml-js-parser>
<script>
function init() {
  var parser = document.querySelector('raml-js-parser');
  parser.loadApi(apiFileUrl);
};
window.addEventListener('WebComponentsReady', init);
</script>
```

### JSON instead of RAML

The API console web component requires JavaScript object produced by the [raml-js-parser](https://elements.advancedrestclient.com/elements/raml-js-parser) and [raml-js-enhancer](https://elements.advancedrestclient.com/elements/raml-json-enhance) elements. Parsing and enhancing RAML is not part of the `api-console` element and must be performed separately as described below.

Use the `raml-js-parser` element to parse YAML data or to download RAML from remote location. __Note__: You may also use our [raml-js-parser-2](https://github.com/raml-org/raml-js-parser-2) node library as it gives the same output.

Then you must use the `raml-js-enhancer` element to produce data output that is recognizable by the `api-console`.

#### Example: parsing and enhancing RAML as an input for the console

```html
<raml-js-parser json></raml-js-parser>
<raml-json-enhance></raml-json-enhance>
<script>
var parser = document.querySelector('raml-js-parser');
parser.addEventListener('api-parse-ready', function(e) {
  var enhacer = document.querySelector('raml-json-enhance');
  enhacer.json = e.detail.json.specification;
});
window.addEventListener('raml-json-enhance-ready', function(e) {
  // The e.detail.json contains the final JavaScript object
  console.log(e.detail.json);
});
function init() {
  parser.loadApi(apiFileUrl);
};
window.addEventListener('WebComponentsReady', init);
</script>
```

The parsing and enhancing costs a lot depending on RAML structure and number of files included. Therefore it is a good idea to do it once and cache the results. Then, when the user visit the page again restore cached JSON object and pass it as the `api-console` parameter (see below).

### Setting RAML data as an HTML attribute

The basic method to tell the API console what to display is to use the `raml` attribute. It accepts the JavaScript object produced by the parser and the enhancer described above.

```html
<api-console></api-console>
<script>
function init() {
  var apiConsole = document.querySelector('api-console');
  var json = getRamlJsObject();
  apiConsole.json = json;
};
window.addEventListener('WebComponentsReady', init);
</script>
```

The `<api-console>` element also have a convenient `json-file` attribute that you can set to point to a file containing the parsed and enhanced JSON data.

```html
<api-console json-file="/path/to/api.json"></api-console>
```

### Using RAML aware to pass the data

The API console uses the [raml-aware](https://elements.advancedrestclient.com/elements/raml-aware) element internally.
It can be used to pass the RAML data to the console if direct access to the
element is not possible. This way the RAML data can be set for the element even
if the elements don't have direct access to each others (e.g. in shadow DOM).

See the [raml-aware documentation](https://elements.advancedrestclient.com/elements/raml-aware) page for more details.

#### Example

```html
<raml-aware scope="main-raml"></raml-aware>
<api-console aware="main-raml"></api-console>
```

```javascript
window.addEventListener('raml-json-enhance-ready', function(e) {
  var aware = document.querySelector('raml-aware');
  aware.raml = e.detail.json;
});
parser.loadApi(urlToApi);
```

## Full web app example

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
    <title>My API documentation</title>
    <script>
      window.Polymer = {
        dom: 'shadow'
      };
      // Load webcomponentsjs polyfill if browser does not support native Web Components
      (function() {
        'use strict';
        var onload = function() {
          // For native Imports, manually fire WebComponentsReady so user code
          // can use the same code path for native and polyfill'd imports.
          if (!window.HTMLImports) {
            document.dispatchEvent(
              new CustomEvent('WebComponentsReady', {bubbles: true})
            );
          }
        };

        var webComponentsSupported = (
          'registerElement' in document &&
          'import' in document.createElement('link') &&
          'content' in document.createElement('template')
        );

        if (!webComponentsSupported) {
          var script = document.createElement('script');
          script.async = true;
          script.src = '/bower_components/webcomponentsjs/webcomponents-lite.min.js';
          script.onload = onload;
          document.head.appendChild(script);
        } else {
          onload();
        }
      })();
    </script>
    <link rel="import" href="bower_components/api-console/api-console.html">
    <!-- Below polyfills are in the api console dependencies. -->
    <link rel="import" href="bower_components/fetch-polyfill/fetch-polyfill.html">
    <link rel="import" href="bower_components/promise-polyfill/promise-polyfill.html">
  </head>
<body>
  <api-console></api-console>
  <script>
  function fetchApiData() {
    // api.json contains cached results of parsing the RAML spec.
    return fetch('./api.json')
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
    });
  }
  function notifyInitError(message) {
    alert('No API for you this time. ' + message);
  }
  function init() {
    fetchApiData()
    .then(function(json) {
      if (json) {
        var apiConsole = document.querySelector('api-console');
        apiConsole.json = json;
      } else {
        notifyInitError('Data not available.');
      }
    })
    .catch(function(cause) {
      notifyInitError(cause.message);
    })
  };
  window.addEventListener('WebComponentsReady', init);
  </script>
</body>
</html>
```

## Element configuration (attributes)

| Attribute | Description | Type |
| --- | --- | ---|
| `raml` | The JavaScript object or equivalent JSON object representing the RAML structure as a JavaScript object.  | `Object or String` |
| `json-file` | Path to a file with JSON data that should be read and contents of it should be set to the `raml` attribute | `String` |
| `path` | Currently selected path in the view. See section [Controlling the view ](#controlling-the-view) for more information. | `String`
| `aware` | If passing data by using the [raml-aware](https://elements.advancedrestclient.com/elements/raml-aware) element, it is the name as the `scope` attribute used in the aware. | `String`
| `page` | Currently selected top level view of the console. It can be either `docs` or `request`. The later is the "try it screen". | `String`


## Styling

The main stylesheet for the element is the `api-console-styles.html` file that resists in this repo.
The stylesheet contains CSS variables and mixins definitions that are used by the inner elements.
Styles documentation for any element used in the console can be find in it's documentation page in the
[elements catalog](https://elements.advancedrestclient.com/).

Theming is currently not supported.

## Controlling the view

The `<api-console>` element includes the UI for the user and can be controlled from within the
element. However it exposes few properties that can be used to control element's behavior programmatically.

For example `path` property can be used to control to navigate through the RAML structure.
So, to display a request form for a particular endpoint of the API you can set a `path` property to:
```html
<api-console path="resources.0.method.1"></api-console>
```
Example above will display second method from first resource in the resources tree.
You can set attribute `display` to `request` to display a request panel for this method. By default
it is set to `docs`.

## CORS

There's no easy way to deal with CORS. In the API Console ecosystem there is an extension for Chrome
(and soon for Firefox) which will proxy the request without CORS limitations. The user, when using
selected browsers) will see the install extension banner in the request editor. After installing the
extension all traffic from the console will be redirected to the extension to get the endpoint
response.
The console listens for the `api-console-extension-installed` event that is fired from the
extension's content script. Once received the console will send an event to the extension
when the user make the HTTP request. The element responsible for the communication with the extension
is [api-console-ext-comm](https://elements.advancedrestclient.com/elements/api-console-ext-comm).

Other ways to deal with CORS are coming. File an issue report in the repo if you can help with
this issue.

## Sizing

The `api-console` must either be explicitly sized, or contained by the explicitly
sized parent. Parent container also has to be positioned relatively
(`position: relative` CSS property). "Explicitly sized", means it either has
an explicit CSS height property set via a class or inline style, or else is
sized by other layout means (e.g. the flex layout or absolute positioning).
