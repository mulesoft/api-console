# The API Console

MuleSoft's API Console is an enterprise grade API Documentation tool.
This is an open source version of the console used in Anypoint Platform.

## Usage

For best developer experience use one of our tools to use the console in your project depending on your use case:

-   As a stand-alone application use [CLI tool](https://docs.api-console.io/building/cli/), [Docker image](https://docs.api-console.io/building/docker/), or [manual build](https://docs.api-console.io/building/rollup/)
-   As a web component use [manual build](https://docs.api-console.io/building/rollup/)

## Version compatibility

As of version 6.0.0, API Console only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility use any previous version. Note that support for previous versions has been dropped and this is the only version with active development.

## Preview and development

1.  Clone the element.
```
git clone https://github.com/mulesoft/api-console.git
cd api-console
```

2.  Install dependencies.
```
npm i
```

3.  Start local server.
```
npm start
```

## Documentation

Full documentation is available at https://docs.api-console.io.

## Use cases

Two basic use cases for API Console is:

-   standalone application - enables application, full window view
-   web component - lighter version, does not offer general layout and routing support

### Stand-alone application

To use API Console as a stand-alone application use `api-console-app` element provided by `api-console-app.js` file.
The stand-alone application supports routing and layout elements (compared to API Console as an element).

In this mode the console has title bar, drawer that holds the navigation, and main element that holds main scrolling region (the body is not a scrolling region in this case).
It also enables mobile view when viewport width threshold is reached (740px). Wide view is enabled for viewport >= 1500px and includes request panel (try it) on the right hand side of currently rendered method.

Additionally the console application includes `xhr-simple-request`, `oauth1-authorization`, and `oauth2-authorization` components.

See `demo/standalone/index.html` for an example.

### Web component

A web component offers rendering documentation view as a default view, on user request the request panel (when try it button is pressed), and contains an always hidden navigation that cannot be triggered from element's UI. The application that hosts the element must provide some kind of an UI for the user to trigger the navigation. Navigation can be opened by setting the `navigationOpened` property/attribute to `true`.

Because API console as a web component has no layout element you may want to control the height of the console. It should be set as specific value to properly support navigation drawer. Specific value can also be `flex: 1` when flex layout is used.

The API Console element does not include `xhr-simple-request`, `oauth1-authorization`, or `oauth2-authorization` components. This components has to be added to the DOM separately. You can ignore this step when authorization and request events are handled by the hosting application.
See full documentation for [handling API Console events](docs/handling-events-in-component.md).

See `demo/element/index.html` for an example.

### Working with AMF model

API console does not offer parsing API file(s) to the data model. This is done by the [AMF](https://github.com/aml-org/amf) parser provided by MuleSoft.

For both stand-alone application and the web component version of API console you must set AMF generated model on `amf` property of the console. The source can be direct result of parsing API spec file by the AMF parser or a JSON+ld model stored in a file. For a performance reasons the later is preferred.

```html
<api-console></api-console>
<script>
{
  const model = await generateApiModel();
  const apic = document.querySelector('api-console');
  apic.amf = model;
  // reset selection
  apic.selectedShape = 'summary';
  apic.selectedShapeType = 'summary';
}
</script>
```

### Styling API Console

Styles can be manipulated by creating a style sheet with CSS variables definition. Each component that has been used to build the console exposes own styling API.

API components ecosystem does not provide detailed documentation for styling API. Because of that when styling the console use Chrome DevTools to read name of a
variable with default value to set in the style sheet.

See `demo/themed/anypoint-theme.css` and `demo/themed/dark-theme.css` files for an example of styled API Console.

#### Anypoint compatibility

API Console offers a `compatibility` property that enables (some) components to switch theme to Anypoint. All form controls in request panel, buttons, icon buttons,
and lists are switched to compatibility view automatically when `compatibility` is set.

Note, that not all components support this property and therefore some styling adjustment may be needed. See `demo/themed/anypoint-theme.css` for an example of such style sheet.

## Required dependencies

**Note, the request panel won't run without this dependencies.**

API Console bundler and the CLI tool bundles all dependencies into a `vendor.js` file and adds it to the final application.

Code mirror is not ES6 ready. Their build contains AMD exports which is incompatible with native modules. Therefore the dependencies cannot be imported with the element but outside of it.
The component requires the following scripts to be ready before it's initialized (especially body and headers editors):

```html
<script src="node_modules/jsonlint/lib/jsonlint.js"></script>
<script src="node_modules/codemirror/lib/codemirror.js"></script>
<script src="node_modules/codemirror/addon/mode/loadmode.js"></script>
<script src="node_modules/codemirror/mode/meta.js"></script>
<!-- Some basic syntax highlighting -->
<script src="node_modules/codemirror/mode/javascript/javascript.js"></script>
<script src="node_modules/codemirror/mode/xml/xml.js"></script>
<script src="node_modules/codemirror/mode/htmlmixed/htmlmixed.js"></script>
<script src="node_modules/codemirror/addon/lint/lint.js"></script>
<script src="node_modules/codemirror/addon/lint/json-lint.js"></script>
```

CodeMirror's modes location. May be skipped if all possible modes are already included into the app.

```html
<script>
/* global CodeMirror */
CodeMirror.modeURL = 'node_modules/codemirror/mode/%N/%N.js';
</script>
```

You may want to add this dependencies to your build configuration to include it into the bundle.

### Dependencies for OAuth1 and Digest authorization methods

For the same reasons as for CodeMirror this dependencies are required for OAuth1 and Digest authorization panels to work.

```html
<script src="node_modules/cryptojslib/components/core.js"></script>
<script src="node_modules/cryptojslib/rollups/sha1.js"></script>
<script src="node_modules/cryptojslib/components/enc-base64-min.js"></script>
<script src="node_modules/cryptojslib/rollups/md5.js"></script>
<script src="node_modules/cryptojslib/rollups/hmac-sha1.js"></script>
<script src="node_modules/jsrsasign/lib/jsrsasign-rsa-min.js"></script>
```
