# Using API components

This documentation is for advanced use

API console is a shell application that puts web components together in a
single application. Three main UI regions of the API console are:

-   Navigation (api-navigation)
-   Documentation (api-documentation)
-   Request panel (api-request-panel)
-   Model propagation helper (raml-aware) as an optional dependency.

In some cases you may need to use the components separately to customize the
experience with your environment. This document describes how to use
API components to work together as in the API console.

## Installation

The fastest way is to use regular installation and build process as described in
[api-console-element.md](api-console-element.md) and [build-tools.md](build-tools.md)
documents.

The base installation can be handled with the following command:

```
$ bower i --save advanced-rest-client/api-navigation advanced-rest-client/api-documentation advanced-rest-client/api-request-panel advanced-rest-client/raml-aware
```

## Usage

You will use the components the same way regardless the environment. However in
development environment we advice to import the components directly as it's
easier to debug and style the console.

### Development environment

Include sources into your application:

```html
<!-- Very small library that imports polyfills if needed -->
<script src="bower_components/webcomponentsjs/webcomponents-loader.js"></script>
<!-- Sources of the console -->
<link rel="import" href="bower_components/api-navigation/api-navigation.html">
<link rel="import" href="bower_components/api-documentation/api-documentation.html">
<link rel="import" href="bower_components/api-request-panel/api-request-panel.html">
<link rel="import" href="bower_components/raml-aware/raml-aware.html">
```

Use the console in the application:

```html
<body>
  <header>My API portal</header>
  <nav>
    ...
    <api-navigation aware="apiModel" summary></api-navigation>
  </nav>
  <main role="main">
    <h1>My super API</h1>
    <api-documentation handle-navigation-events></api-documentation>
  </main>
  <aside hidden>
    <api-request-panel aware="model" handle-navigation-events redirect-uri="https://my.domain.com/bower_components/oauth-authorization/oauth-popup.html"></api-request-panel>
  </aside>
  <raml-aware scope="apiModel"></raml-aware>
</body>
```

And finally, enable the console by providing AMF data model

```html
<script>
function loadApiModel(modelFile) {
  fetch('./' + modelFile)
  .then((response) => response.json())
  .then((data) => {
    document.getElementById('apiModel').raml = data;
  });
}
window.addEventListener('WebComponentsReady', () => app.loadApiModel('api-model.json'));
</script>
```

### Code walkthrough

In first code block main dependencies of the API console has been loaded into the
application using HTML imports.
You may skip any of the components if you are not planning to use it.

Second block is how you would use the components in your web application. Web components
are regular HTML elements. Use them as any other element in the web platform.
What makes it different is that the component can expose it's own API that can be used by hosting application.
Access this API using standard HTML attributes.

Last code block loads generated AMF data model into the console. In this example
the model is loaded into `raml-aware` element that uses [monostate pattern](http://wiki.c2.com/?MonostatePattern)
to propagate the data to other components. This is why other components use `aware` property with the same value
as `scope` attribute on the aware element. When the model is set on the aware element it is automatically
propagated to other elements.

Alternative approach is to assign the model separately on each element:

```javascript
fetch('./' + modelFile)
.then((response) => response.json())
.then((data) => {
  document.body.querySelector('api-navigation').apiModel = data;
  document.body.querySelector('api-documentation').apiModel = data;
  document.body.querySelector('api-request-panel').apiModel = data;
});
```

As you may noticed the `aside` element is hidden from the view. It's because at the time of loading the console there's no appropriate context to render this element. By default the documentation component renders "Try it" button next to HTTP method documentation. When the user request to try the endpoint the component dispatches `tryit-requested` custom event. This is the right time to render the panel:

```html
<script>
...
document.body.querySelector('api-documentation').addEventListener('tryit-requested', () => {
  document.body.querySelector('aside').removeAttribute('hidden');
});
</script>
```

Both `api-documentation` and `api-request-panel` support the same API property: `handle-navigation-events`.
It enables elements to listen for navigation events dispatched by `api-navigation` and update
the view automatically. If for any reason you would like to do it manually observe the
`api-navigation-selection-changed` event and update the state of the components:


```html
<script>
...
window.addEventListener('api-navigation-selection-changed', (e) => {
  const selected = e.detail.selected;
  const selectedType = e.detail.type;
  const docs = document.body.querySelector('api-documentation');
  const request = document.body.querySelector('api-request-panel');
  docs.selected = selected;
  docs.selectedType = selectedType;
  request.selected = selected;
});
</script>
```

## Optional but useful dependencies

Parts of the logic is optional for API console. Things like OAuth 1 and 2 authorization, handling the request, or support for cryptography is not included by default.
If you application already support similar logic it's better to use your application's logic and reduce size of the final build.
This optional dependencies are:

-   advanced-rest-client/xhr-simple-request - Uses XHR object to make a request
-   advanced-rest-client/oauth-authorization - Support for OAuth authorization
-   advanced-rest-client/cryptojs-lib - Crypto library that is used by authorization logic
-   advanced-rest-client/web-animations-js - At the time of writing this article Web Animations API is not implemented in any browser and the app uses this API for dropdowns.

If you having CORS problems or you already support logic for transporting the request handle `api-request` and `api-response` custom events as described in [api-request-editor](https://github.com/advanced-rest-client/api-request-editor/blob/stage/api-request-editor.html#L228) docs.

To manually handle OAuth 2 authorization listen for `oauth2-token-requested` event as described in  [oauth2-authorization](https://github.com/advanced-rest-client/oauth-authorization/blob/stage/oauth2-authorization.html#L32).


To include optional dependencies first install them with bower:

```
$ bower i --save advanced-rest-client/xhr-simple-request advanced-rest-client/oauth-authorization advanced-rest-client/cryptojs-lib advanced-rest-client/web-animations-js
```

and use with your web application:

```html
<link rel="import" href="bower_components/xhr-simple-request/xhr-simple-request.html">
<link rel="import" href="bower_components/oauth-authorization/oauth-authorization.html">
<link rel="import" href="bower_components/cryptojs-lib/cryptojs-lib.html">
<link rel="import" href="bower_components/web-animations-js/web-animations-js.html">
...

<xhr-simple-request></xhr-simple-request>
<oauth1-authorization></oauth1-authorization>
<oauth2-authorization></oauth2-authorization>
```

Crypto JS and Web Animations polyfills do not have custom element and just need to be included into the app.

## Production environment

API console build tools only allows to create standalone and embeddable builds with predefined configuration.
Try [Polymer build npm module](https://github.com/Polymer/tools/tree/master/packages/build) to generate own bundle.
API console builder uses polymer build under the hood with predefined build process. See [builder.js](https://github.com/mulesoft-labs/api-console-builder/blob/master/lib/builder.js) file for implementation details.
You can also contact us using issue tracker to get help.
