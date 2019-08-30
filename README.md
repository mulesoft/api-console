# The API Console

This is a preview of the next version of API Console. Feel free to try it out and to file a bug report if necessary.

This branch is in active development and most probably changes daily. Update your branch regularly when previewing the next version.

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

Try this version of API console with your API and report an issue if anything is out of ordinary. We and the rest of the community will be grateful.

### Code Mirror changes

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
