# Passing the RAML data

The default version of the **API console does not contain the RAML parser**. It is by design to minimize the size of the console and to optimize startup time.

You can use the console with the RAML parser by setting up the build / CLI tools or by adding the dependency manually. **This document describes why the parser has been removed from the core console code and how to use the parser with new console.**

## Performance of the API console

One of the challenges standing before us when we started developing version 4 of the API console was the performance. This is wide area so here we'll limit it to size of the source code and initial start time.

Before we go into detailed performance issues description read why we use the enhancer alongside the JS parser.


### RAML <> JavaScript enhancer

As you may already know the API console consists of over 150 web components. They are responsible for displaying the documentation, rendering the request and response panels in the "try it" function and to make test requests to an endpoint.

[RAML's JavaScript parser][5] has been created to give access to RAML document's [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree). It is very inconvenient to use it with HTML templating systems (like Polymer's or Angular's). The parser simply hasn't been created for this use case. Apart from offering the AST the parser produces a JavaScript object. The object can be used in many cases in JavaScript environment. However the output is not as helpful in the world of web components.

The components serves one purpose and are responsible for a single task in the API console. For example there is an element that renders annotation added to a type only. Because of that not every element need to have access to full RAML description. It only uses part of the documentation that it is going to use. Parser's JavaScript output gives literally translated YAML structure to a JavaScript object. It means that if you, for example, declare a type on a `body` declaration as a name of previously defined type on the root of the RAML document, the parser's output is this name and not the type definition. Therefore parser JavaScript output requires additional transformations before it can be used with web components architecture.

For the API Console we use our fork of the [raml2obj][11] library as a base transformer. With the [expansion library][12] we've created an web component [raml-json-enhance][3] and node module [raml-json-enhance-node][4] that transforms parser's output to a form that can be used with the components of the API console.

Output of the enhancer is then to be used as an input data of the API console. Use of the enhancer also allowed us to minimize code base of all the web components because they don't need to contain code to compute missing properties.

### Console source size

The first issue is the size of the console. When you install dependencies of the console it turns out that the whole project is about 40MB (excluding `node_modules`). That's a lot but this is a development version of the console.
We have prepared a [build tools][1] for the console, that works on top of Polymer's [build tools][1] to produce production ready version of the console. With optimization option enabled (default behavior) it produces a single file with all web components definitions concatenated to a single 2MB file. It is still quite a lot but so far we were able to reduce the code to this size.

### Console startup time

Big issue for the API console in version < 4.0.0 was startup time. Each time the console was loaded into the browser it had to download all RAML sources, parse it and then render the console based on JavaScript parser output. In many cases two first steps are simply redundant. If the API specification doesn't change very often there's no reason to parse the RAML each time the console is opened. We've replaced this part with prebuilt of the parser's output file that contains transformed RMAL data. In case of huge and complicated APIs it can significantly reduce startup time.

Separation of the data source and the API console has additional advantage. In new architecture, when source RAML changes you can just rebuild the JSON file with new data instead of rebuilding the console. This speeds up publish time of new API an can be easily automated in your [CI pipeline][10].

Our [build tools][1] gives you options to include the parser and enhancer to the final build so, depending on your use case, you can optimize startup time of the console.

## Installing parser and enhancer

You can install parser and enhancer in your project by calling [bower][9] command:

```
$ bower install --save advanced-rest-client/raml-json-enhance advanced-rest-client/raml-js-parser
```

You can use `package.json` script declaration for the same command:

```json
"scripts": {
  "install-parser": "bower install --save advanced-rest-client/raml-json-enhance advanced-rest-client/raml-js-parser"
}
```
```
$ npm run install-parser
```

Or in combination with installation of the console:

```
$ bower install --save mulesoft/api-console advanced-rest-client/raml-json-enhance advanced-rest-client/raml-js-parser
```

It installs source files in `bower_components` directory. You can then reference those files in the `import` directive. After the components are imported and registered you can use them as described in our [web components guide][2].

Also check out our usage guide of the `<api-console>` element in our [element's guide][8].

### Example use of parser and enhancer

```html
<link rel="import" href="bower_components/raml-js-parser/raml-js-parser.html">
<link rel="import" href="bower_components/raml-json-enhance/raml-json-enhance.html">
<link rel="import" href="bower_components/api-console/api-console.html">

<raml-js-parser json></raml-js-parser>
<raml-json-enhance></raml-json-enhance>
<api-console></api-console>

<script>
var MyAPiApp = {
  init: function() {
    var parser = document.querySelector('raml-js-parser');
    parser.addEventListener('api-parse-ready', MyAPiApp._ramlReady);
    parser.loadApi('https://domain.com/api.raml');
    window.addEventListener('raml-json-enhance-ready', MyAPiApp._jsonReady);
  },

  _ramlReady: function(e) {
    var enhacer = document.querySelector('raml-json-enhance');
    enhacer.json = e.detail.json.specification;
  },

  _jsonReady: function(e) {
    // The e.detail.json contains the final JavaScript object
    var apiConsole = document.querySelector('api-console');
    apiConsole.raml = e.detail.json;
  }
};
window.addEventListener('WebComponentsReady', MyAPiApp.init);
</script>
```

The `json` attribute set on `raml-js-parser` element tells the parser that the output should be a JavaScript object instead of the AST.

### Setting RAML data as a HTML attribute

The basic method for determining what API Console displays is to use the `raml` attribute. The attribute accepts the JavaScript object produced by the parser and the enhancer described above.

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

The `<api-console>` element also has a convenient `json-file` attribute that can be set to point to a file containing the parsed and enhanced JSON data.

```html
<api-console json-file="api.json"></api-console>
```

This method is the most flexible method of passing the RAML data. You can use our [build tools][1] to regenerate the `api.json` file in your CI process automatically as soon as you publish changes in your API.

### Using RAML aware to pass the data

API console internally uses the [raml-aware][6] element.
This element can be used to pass the RAML data to the console if direct access to the
element is not possible, for example, if the console is encapsulated in the [shadow DOM][7].

See the [raml-aware][6] documentation page for more information.

#### Install

```
$ bower install --save advanced-rest-client/raml-aware
```

#### Example

```html
<link rel="import" href="bower_components/raml-aware/raml-aware.html">
<link rel="import" href="bower_components/api-console/api-console.html">

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

[1]: build-tools.md
[2]: web-components.md
[3]: https://elements.advancedrestclient.com/elements/raml-json-enhance
[4]: https://elements.advancedrestclient.com/elements/raml-json-enhance-node
[5]: https://github.com/raml-org/raml-js-parser-2
[6]: https://elements.advancedrestclient.com/elements/raml-aware
[7]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM
[8]: api-console-element.html
[9]: https://bower.io
[10]: rebuilding-api-json.md
[11]: https://github.com/advanced-rest-client/raml2obj
[12]: https://github.com/raml-org/datatype-expansion/
