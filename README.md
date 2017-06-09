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

Then you must use the `raml-js-enhancer` element to produce data output that is recognizable by the `api-console`. The enhancer creates a common data structure and expands RAML types (flattens it's structure so a type doesn't have complex inheritance structure). Elements used to build the API Console expects the JSON object to contain complete data about a method / endpoint / type / security scheme and so on. They will not look into nor have access to the data in the root of RAML definition. The enhancer replaces objects into arrays (adding a `key` property to each item) so it can be used in a templating systems. Also `example` property of the RAML is always translated to `examples` array. Finally the enhancer creates `fullUrl` property on each HTTP method so the console don't need to compute it each time you open the documentation page.

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
| `path` | Currently selected path in the view. See section [Controlling the view ](#controlling-the-view) for more information. | `String` |
| `aware` | If passing data by using the [raml-aware](https://elements.advancedrestclient.com/elements/raml-aware) element, it is the name as the `scope` attribute used in the aware. | `String` |
| `page` | Currently selected top level view of the console. It can be either `docs` or `request`. The later is the "try it screen". | `String` |
| `narrow` | By setting this attribute it will tell the API console to render a "narrow" view. This is a mobile like view (navigation is hidden in a drawer, some views are simplified for narrow screens) that will be presented event if the screen size is wide. This is helpful when inserting the element as a sidebar of your web page. Node that the `narrow` property will be set automatically on mobile devices | `Boolean` |
| `append-headers` | Forces the console to send specific list of headers, overriding user input if needed. | `String` |
| `proxy` | Sets the proxy URL for the HTTP requests sent from the console. If set all URLs will be altered before sending the data to a transport library bu prefixing the URL with this value | `String`
| `proxyEncodeUrl` | If required by the `proxy` the URL will be URL encoded. | `Boolean` |
| `noTryIt` | Disables the "try it" button in the method documentation view. The request editor and the response viewer is still available but you must open it programmatically setting `page` proerty to ` request` | `Boolean` |  
| `manualNavigation` | Disables navigation in the drawer and renders the navigation full screen, when requested. This is ideal to use in the narrow layouts together with `narrow` property. | `Boolean` |
| `navigationOpened` | If set and `manualNavigation` is used then it will open / close the full screen navigation. | `Boolean` |
| `bowerLocation` | If the path to the `bower_components` is different than default (in the root path) then set this attribute to point the location of the folder, including folder name. | `Boolean`

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

## Using proxy server

One of ways to deal with CORS is to tell the API console to pass the request through a proxy.
For this you can use `proxy` attribute. Once set then every request made by the console will be
passed through the proxy.

When using proxy, the request URL will be altered before sending it to a transport library (possibly
the XHR call) by prefixing the URL with proxy value.

```html
<api-console proxy="https://api.proxy.com/api/proxy/"></api-console>
```

With this configuration a request made to `http://domain.com/path/?query=some+value` endpoint will
become `https://api.proxy.com/api/proxy/http://domain.com/path/?query=some+value`.

Don't forget to add trailing '/' to the path or produced URL will be invalid.

If the proxy require to set the URL as a query parameter then `proxy` attribute should end with
parameter name and `=` sign:

```html
<api-console proxy="https://api.proxy.com/api/proxy/?url=" proxy-encode-url></api-console>
```

In this case be sure to set `proxy-encode-url` attribute which will tell the console to URL encode
the URL before appending it ti the final URL

With this configuration a request made to `http://domain.com/path/?query=some+value` endpoint will
become `https://api.proxy.com/api/proxy/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`.

The proxy URL won't be visible by the user and the user can't do anything to change the behavior
until your application don't support proxy change in the UI.

### Handling the HTTP request by the hosting website / application

When a user runs the request from the "try it" screen the API Console will send the `api-console-request` custom event. If your application can handle transport for the HTTP request (by providing proxy or other solution) you should listen for this event and cancel it by calling `event.preventDefault()`.
If the event was cancelled then the API Console will listen for the `api-console-response` custom
event that should contain response details. Otherwise the console will use build in fallback function to get the resource using Fetch API / XHR.

#### api-console-request custom event

Event's `detail` object will contain following properties

Property | Type | Description
----------------|-------------|----------
`url` | String | The request URL
`method` | String | The HTTP method
`headers` | String | HTTP headers string to send with the message
`payload` | String | Body to send

#### api-console-response

This event must be fired when the hosting app finish the request. It must contain generated Request
and Response object as defined in the [Fetch specification](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). The API console has polyfill for the Fetch API included.

Property | Type | Description
----------------|-------------|----------
`request` | Object | The request object as defined in the Fetch API spec.
`response` | Object | The response object as defined in the Fetch API spec.
`isXhr` | Boolean | Default to `true`. Indicated if the transport method doesn't support advanced timings and redirects information. See [request-panel](https://elements.advancedrestclient.com/elements/raml-request-panel) documentation for detailed description.
`error` | Error | When the request / response is errored (`request.ok` equals `false`) then the error object should be set with the human readable message that will be displayed to the user.

#### Example with handling request / response events

```javascript
// Start time of executing the request
var startTime;
// Initial request data passed by the event.
var requestData;
/**
 * Creates a Headers object based on the HTTP headers string.
 *
 * @param {String} headers HTTP headers.
 * @return {Headers} Parsed headers object.
 */
createHeaders: function(headers) {
  if (!headers) {
    return new Headers();
  }
  var result = new Headers();
  var list = headers.split('\n').map(function(line) {
    var _parts = line.split(':');
    var _name = _parts[0];
    var _value = _parts[1];
    _name = _name ? _name.trim() : null;
    _value = _value ? _value.trim() : null;
    if (!_name || !_value) {
      return null;
    }
    return {
      name: _name,
      value: _value
    };
  }).filter(function(item) {
    return !!item;
  });
  list.forEach(function(item) {
    result.append(item.name, item.value);
  });
  return result;
}
/**
 * Creates a request object from the event's request data.
 *
 * @param {Object} data Latest request data as in the `api-console-request` object event.
 * @return {Request} The Request object.
 */
function createRequest(data) {
  var init = {
    method: data.method,
    mode: 'cors'
  };
  if (data.headers) {
    init.headers = createHeaders(data.headers);
  }
  if (['GET', 'HEAD'].indexOf(data.method) !== -1) {
    data.payload = undefined;
  } else {
    if (data.payload) {
      init.body = data.payload;
    }
  }
  return new Request(data.url, init);
}
/**
 * Creates a response object from the response data.
 * If the response is invalid then returned Response object will be errored.
 *
 * @param {XMLHttpRequest} xhr The XHR object used to make a connection.
 * @return {Response} The response object.
 */
function createResponse(xhr) {
  var status = xhr.status;
  if (!status || status < 200) {
    return Response.error();
  }
  var init = {
    status: status,
    statusText: xhr.statusText
  };
  var headers = xhr.getAllResponseHeaders();
  if (headers) {
    init.headers = createHeaders(headers);
  }
  try {
    return new Response(xhr.responseText, init);
  } catch (e) {
    return Response.error();
  }
}
// General error handler.
function errorHandler(e) {
  var loadTime = performance.now() - startTime;
  var request = createRequest(requestData);
  var detail = {
    request: request,
    response: Response.error(),
    loadingTime: loadTime,
    isXhr: true,
    error:  new Error('Resource is unavailable')
  };
  var event = new CustomEvent('api-console-response', {
    cancelable: false,
    bubbles: true,
    composed: true,
    detail: detail
  });
  document.body.dispatchEvent(event);
}
// Handler for load event
function loadHandler(e) {
  var loadTime = performance.now() - startTime;
  var request = createRequest(requestData);
  var response = createResponse(e.target);
  var detail = {
    request: request,
    response: response,
    loadingTime: loadTime,
    isXhr: true
  };
  if (!response.ok) {
    detail.error = new Error('Resource is unavailable');
  }
  var event = new CustomEvent('api-console-response', {
    cancelable: false,
    bubbles: true,
    composed: true,
    detail: detail
  });
  document.body.dispatchEvent(event);
}
// Handler to the event, sends the request
function consoleRequestHandler(e) {
  requestData = e.detail;
  var xhr = new XMLHttpRequest();
  xhr.open(requestData.method, requestData.url, true);
  if (requestData.headers) {
    requestData.headers.split('\n').forEach(function(header) {
      var data = header.split(':');
      var name = data[0].trim();
      var value = '';
      if (data[1]) {
        value = data[1].trim();
      }
      try {
        xhr.setRequestHeader(name, value);
      } catch (e) {
        console.log('Can\'t set header ' + name ' in the XHR call.');
      }
    });
  }
  xhr.addEventListener('load', loadHandler);
  xhr.addEventListener('error', errorHandler);
  xhr.addEventListener('timeout', errorHandler);
  try {
    startTime = performance.now();
    xhr.send(requestData.payload);
  } catch (e) {
    errorHandler(e);
  }
}
window.addEventListener('api-console-request', consoleRequestHandler);
```

## Sizing

The `api-console` must either be explicitly sized, or contained by the explicitly
sized parent. Parent container also has to be positioned relatively
(`position: relative` CSS property). "Explicitly sized", means it either has
an explicit CSS height property set via a class or inline style, or else is
sized by other layout means (e.g. the flex layout or absolute positioning).

## Forcing the API Console to send a specific list of headers

You can force the API Console to send a specific list of headers for each request made by it. To
do this set the `append-headers` attribute. It should contain a HTTP headers string.
If the user declared a header that is declared in the `append-headers` attribute then user value
will be overridden. Otherwise headers will be appended to the headers string.

Use "\n" string to set a new line for the headers string.

```
<api-console append-headers="X-key: my-api-key\nother-header:value"></api-console>
```
