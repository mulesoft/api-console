# Using the API Console HTML element

1) Install the console as a dependency of your project. We use [bower] for this. Bower also installs dependencies of the console.

```
bower install --save mulesoft/api-console#release/4.0.0
```

2) Import the console to your page. For the element to be recognized by the browser as a new HTML element, you have to include it in the page source.

```html
<link rel="import" href="bower_components/api-console/api-console.html">
```

3) Use the HTML tag.

```html
<body>
  <api-console raml="{...}"></api-console>
</body>
```

To pass RAML data to the element, see the [Passing the RAML data](passing-raml-data.md) section.

For a complete list of available configuration options for the `api-console` element, see the [configuring the API Console](configuring-api-console.md) document.

## Setup polyfills

Web components are based on four new specifications (Custom elements, shadow DOM, HTML imports, and HTML template) that are not fully supported in old browsers, such as IE. Also, browser vendors are still discussing the HTML imports specification, so it's [not yet implemented](http://caniuse.com/#feat=imports) in Edge and Firefox.

If you plan to target these browsers you should include a polyfill for Web Components. The following polyfill library is already included into your project, assuming you have installed the element using `bower`:

`bower_components/webcomponentsjs/webcomponents-lite.min.js`

## Full web app example

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
    <title>My API documentation</title>
    <script>
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
    <link rel="import" href="/bower_components/api-console/api-console.html">
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
  init();
  </script>
</body>
</html>
```
[bower]: https://bower.io/
