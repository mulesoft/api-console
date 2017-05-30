# Passing the RAML data

## Before you begin: asynchronous environment

Web components are asynchronous by nature. It means that importing the elements,
registering them in the DOM and finally initializing an element is made asynchronously. Therefore you can't expect the element to work right after loading the page (as regular HTML elements does). Consider following example:

```html
<link rel="import" href="bower_components/raml-js-parser/raml-js-parser.html">
<raml-js-parser json></raml-js-parser>
<script>
var parser = document.querySelector('raml-js-parser');
parser.loadApi(apiFileUrl);
</script>
```

Running this code on page load will throw a `TypeError` with the message: `parser.loadApi is not a function`.

It's because at the time of execution of this script block the browser knows nothing about the `raml-js-parser` element. At the time it is an instance of `HTMLUnknownElement`.

The browser has to import the source of the element first and then the Polymer library has to register custom HTML element called `raml-js-parser`.

To run the code properly you have to listen for the `WebComponentsReady` event. It's fired when the elements are ready to use.

```html
<link rel="import" href="bower_components/raml-js-parser/raml-js-parser.html">
<raml-js-parser json></raml-js-parser>
<script>
function init() {
  var parser = document.querySelector('raml-js-parser');
  parser.loadApi(apiFileUrl);
};
window.addEventListener('WebComponentsReady', init);
</script>
```

## JSON instead of RAML

The API console web component requires JavaScript object produced by the [raml-js-parser] and [raml-js-enhance] elements. Parsing and enhancing RAML is not part of the `api-console` element and must be performed separately as described below.

**Head's up!** You can use our [build tools] to generate the JSON file from the RAML in Node (using node modules) and Shell (with API Console CLI tool).

Use the [raml-js-parser] element to parse YAML data or to download RAML from remote location. __Note__: You may also use our [raml-js-parser-2] node library as it gives the same output.

Then you **must** use the [raml-js-enhance] element to produce data output that is recognizable by the `api-console`. The enhancer creates a common data structure and expands RAML types (flattens it's structure so a type doesn't have complex inheritance structure).

Elements used to build the API Console expects the JSON object to contain complete data about a method / endpoint / type / security scheme and so on. They will not look into nor have access to the data in the root of RAML definition. The enhancer replaces objects into arrays (adding a `key` property to each item) so it can be used in a templating systems. Also `example` property of the RAML is always translated to `examples` array. Finally the enhancer creates `fullUrl` property on each HTTP method so the console don't need to compute it each time you open the documentation page.

#### Example: parsing and enhancing RAML

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

1) After the elements are initialized (`WebComponentsReady` event) then it calls the `loadApi()` function on the [raml-js-parser] element.
2) The element will fire `api-parse-ready` custom event that should be handled by the application and the result of parsing (`e.detail.json.specification`) should be passed to the enhancer's `json` property.
3) When the enhancer transform the object it will fire `raml-json-enhance-ready` custom event. The result is in `e.detail.json` property.

Parsing and enhancing costs a lot depending on RAML structure and number of referenced files. It is a good idea to do it once and cache the results. Then, when the user visit the page again restore cached JSON object and pass it as the `api-console` parameter (see below).

### Setting RAML data as an HTML attribute

The basic method to tell the API console what to display is to use the `raml` attribute. It accepts the JavaScript object produced by the parser and the enhancer described above.

```html
<api-console></api-console>
<script>
function init() {
  var apiConsole = document.querySelector('api-console');
  var json = await getRamlJsObject();
  apiConsole.raml = json;
};
window.addEventListener('WebComponentsReady', init);
</script>
```

The `<api-console>` element also have a convenient `json-file` attribute that can be set to point to a file containing the parsed and enhanced JSON data.

```html
<api-console json-file="api.json"></api-console>
```

This method is the most flexible method of passing the RAML data. You can use our [build tools] to regenerate the `api.json` file in your CI process automatically as soon as you publish changes in your API.

### Using RAML aware to pass the data

The API console internally uses the [raml-aware] element.
It can be used to pass the RAML data to the console if direct access to the
element is not possible (eg. the console is encapsulated in the [shadow DOM]).

See the [raml-aware] documentation page for more details.

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

[build tools]: docs/build-tools.md
[raml-js-enhance]: https://elements.advancedrestclient.com/elements/raml-json-enhance
[raml-js-parser]: https://elements.advancedrestclient.com/elements/raml-js-parser
[raml-js-parser-2]: https://github.com/raml-org/raml-js-parser-2
[raml-aware]: https://elements.advancedrestclient.com/elements/raml-aware
[shadow DOM]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM
