# The API Console

This is a preview of the next version of API Console. Feel free to try it out and to file a bug report if necessary.

This branch is in active development and most probably changes daily. Update your branch regularly when previewing the next version.

## Version compatibility

As of version 6.0.0-preview.16, API Console only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility use any previous version. Note that support for previous versions has been dropped
and this is only version with active development.

## Preview and development

1.  Clone the element.
```
git clone https://github.com/mulesoft/api-console.git
cd api-console
git checkout 6.0.0-preview
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

Learn more about using the console at https://docs.api-console.io.

## Changelog (so far)

-   Upgrade to final web components specification: replacing HTML imports with JavaScript modules
-   Replacing Polymer with super lightweight, almost native, `LitElement`. This triggers a series of changes:
    -   All dash-case attributes are now "no-dash", lowercase, web style attributes. For example old `redirect-uri` is now `redirecturi`. This is true for all properties used as HTML attribute. Properties names are the same.
    -   New templating engine. API Console now uses `lit-html` which is performant HTML templating system.
    -   Build process will be completely different. It is not yet ready, stay tuned.
-   Redesigned base input controls. API console now uses own, material design based, basic UI input controls. It comes with 3 predefined styles:
    -   **Default** - Material design filled style
    -   **Outlined** - Material design outlined state controlled by `outlined` style
    -   **Anypoint** - Compatibility layer with the Anypoint platform. Controlled by `compatibility` attribute
-   The request panel (aka try it) now only renders editors that corresponds to the API data model. This means that, for example, if headers are not defined for given operation then headers panel is not rendered.
-   Dropped support for tabs view for the editors in the request panel and they are stacked now.
-   Code mirror dependency requires some additional libraries that won't work inside JavaScript module. This means that those libraries have to be included into the web application before initializing the element. See `Code Mirror changes` section below
-   API Console is now WCAG compliant. All components used to build the console passed [axe-core](https://github.com/dequelabs/axe-core) tests and therefore are fully accessible.
-   The application and the component are now split into separate components. Use `api-console` for embedding the console inside existing web application and `api-console-app` for creating stand alone application.
-   New demo pages. Preview the console with `npm start` command (run inside cloned repository) to see API console with various scenarios and configuration options.
-   Removed any reference to CSS mixins (the `@apply` function). All styling options are now defined via CSS variables. Any styles defined for previous version of API console won't work.
-   Minimised use of icons in favour of regular buttons with labels.
-   This release contains tones of bug fixes and improvements reported by the community and our customers ❤
-   The Chrome proxy extension banner is not rendered by default. Set `allowExtensionBanner` property to initialize the console with the extension support.
-   Added configuration option to set a static OAuth 2 client ID and secret for the application. This way it is easier to demo an API by providing demo client id.
-   Added markdown sanitization
-   Now XML schemas and examples are propertly rendered.
-   Huge XML schemas are now not syntax highlighted (above 10K characters) as it causes the browser to hang.
-   XML examples are now properly formatted and RAML type name is properly resolved (instead of `<model>` element)

Try this version of API console with your API and report an issue if anything is out of ordinary. We and the rest of the community will be grateful.

## Known issues

-   OAS' API Key authorization is not supported.
-   RAML's queryString property is not supported in documentation and try it.
-   XML serialization sometimes includes unexpected elements (amf_inline_type_*)
-   Sometimes types are duplicated in navigation
-   When endpoints in the API spec are out of order the navigation renders them incorrectly
-   Complext annotations (multiple properties with values) are not correctly rendered
-   RAML's regexp propertires of a type are not supported
-   The console is unable to generate examples other that JSON/XML

## Code Mirror changes

**Note, the request panel won't run without this dependencies.**

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

## Dependencies for OAuth1 and Digest authorization methods

For the same reasons as for CodeMirror this dependencies are required for OAuth1 and Digest authorization panels to work.

```html
<script src="node_modules/cryptojslib/components/core.js"></script>
<script src="node_modules/cryptojslib/rollups/sha1.js"></script>
<script src="node_modules/cryptojslib/components/enc-base64-min.js"></script>
<script src="node_modules/cryptojslib/rollups/md5.js"></script>
<script src="node_modules/cryptojslib/rollups/hmac-sha1.js"></script>
<script src="node_modules/jsrsasign/lib/jsrsasign-rsa-min.js"></script>
```

## Usage

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
