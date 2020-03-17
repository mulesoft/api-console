# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.1.0](https://github.com/mulesoft/api-console/compare/v4.2.3...v6.1.0) (2020-03-17)


### Features

* adding an option to set OAuth client ID / secret ([391bba1](https://github.com/mulesoft/api-console/commit/391bba1377716d4638b496b22438b562318b2e16))
* adding experimental `rearrangeEndpoints` property ([692c21f](https://github.com/mulesoft/api-console/commit/692c21f6955884194183f15516b2a213bdbde39b))


### Bug Fixes

* adding swagger match to API file search ([75208a4](https://github.com/mulesoft/api-console/commit/75208a4a51e15b00a9e0a3c9199a6f45855604ef))
* fixed scrolling in APIC app ([58610bd](https://github.com/mulesoft/api-console/commit/58610bdcf6892bf3c83303c6c8a82acba83e88aa))
* fixes APIC-291 - navigation animation when bootstraping ([c564eff](https://github.com/mulesoft/api-console/commit/c564efffdba2ce6f46da93938dc2d27f526af160))
* Fixes linking ([fe17856](https://github.com/mulesoft/api-console/commit/fe17856527330c10bc98cba90a31905ed9d1026b))
* fixing __amfChanged function by calling super class ([34fb6aa](https://github.com/mulesoft/api-console/commit/34fb6aab920dedce3477cbb73cec41ac21984867))
* fixing APIC-260 - CM editor rendered above opened nav drawer ([4876283](https://github.com/mulesoft/api-console/commit/4876283695e4a1cc8dbef3601b448d5db181606f))
* fixing click handler on the "back" button ([7ca40a7](https://github.com/mulesoft/api-console/commit/7ca40a71f5511060c3d23d28a0cd2901314e7cc2))
* fixing input width issue for multipart form ([f15b029](https://github.com/mulesoft/api-console/commit/f15b02954a7fa37b8c97f813f32f8435c68073bd))
* fixing recognizing swagger spec version ([e34740d](https://github.com/mulesoft/api-console/commit/e34740d8eccd83c87850a0ab9733672e120493fb))
* removing `this.app` from function call ([f9cdf5d](https://github.com/mulesoft/api-console/commit/f9cdf5d44131fb3186eafb95c7edd8b1c8173431))

<a name="6.0.0"></a>
# 6.0.0 (2020-01-15)

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

### chore

* chore: adding AMF v4 demo model for tests ([3dd7512](https://github.com/mulesoft/api-console/commit/3dd7512))
* chore: adding ANypoiont and dark theme demo ([3bf1592](https://github.com/mulesoft/api-console/commit/3bf1592))
* chore: adding application ready element ([8fa2822](https://github.com/mulesoft/api-console/commit/8fa2822))
* chore: adding default valuer for `allowHideOptional` in app ([aacad3a](https://github.com/mulesoft/api-console/commit/aacad3a))
* chore: adding demo build configuration ([a87e416](https://github.com/mulesoft/api-console/commit/a87e416))
* chore: adding demo server with API file upload ([bea76e1](https://github.com/mulesoft/api-console/commit/bea76e1))
* chore: adding engine version for sonar scaner to fix reported issue ([e73d381](https://github.com/mulesoft/api-console/commit/e73d381))
* chore: adding issue related API ([78acb8a](https://github.com/mulesoft/api-console/commit/78acb8a))
* chore: adding issue related API example ([daabc15](https://github.com/mulesoft/api-console/commit/daabc15))
* chore: adding path information to the hostory state ([508fe6b](https://github.com/mulesoft/api-console/commit/508fe6b))
* chore: adding SE related demo API ([7c3e926](https://github.com/mulesoft/api-console/commit/7c3e926))
* chore: adding ShadyCSS support ([186c340](https://github.com/mulesoft/api-console/commit/186c340))
* chore: adding suppoprt for ie11 in demo pages ([c711def](https://github.com/mulesoft/api-console/commit/c711def))
* chore: adding tests for the element ([cc4731c](https://github.com/mulesoft/api-console/commit/cc4731c))
* chore: adding type check when setting up navigation drawer ([09c2604](https://github.com/mulesoft/api-console/commit/09c2604))
* chore: completing separation of the app from the element ([86e6a20](https://github.com/mulesoft/api-console/commit/86e6a20))
* chore: continue splitting the app ([fe4a515](https://github.com/mulesoft/api-console/commit/fe4a515))
* chore: fixing chrome extension support ([3a700bb](https://github.com/mulesoft/api-console/commit/3a700bb))
* chore: fixing multiple issues and styling improvemenets ([a5f4bdc](https://github.com/mulesoft/api-console/commit/a5f4bdc))
* chore: increasing memory limit for AMF parser process ([88e6f06](https://github.com/mulesoft/api-console/commit/88e6f06))
* chore: removing old config files ([dadb59a](https://github.com/mulesoft/api-console/commit/dadb59a))
* chore: removing old demo files ([d82ed24](https://github.com/mulesoft/api-console/commit/d82ed24))
* chore: removing static port definition from server start ([2c1b56a](https://github.com/mulesoft/api-console/commit/2c1b56a))
* chore: removing unused argument ([3ea9c50](https://github.com/mulesoft/api-console/commit/3ea9c50))
* chore: removing unused packages ([944a10e](https://github.com/mulesoft/api-console/commit/944a10e))
* chore: removing web animations script from demo pages ([d8f8a80](https://github.com/mulesoft/api-console/commit/d8f8a80))
* chore: started building parting API ([28e0acf](https://github.com/mulesoft/api-console/commit/28e0acf))
* chore: started upgrading the console to LitElemet ([d517891](https://github.com/mulesoft/api-console/commit/d517891))
* chore: started working on separating views for the app and the element ([a2f5304](https://github.com/mulesoft/api-console/commit/a2f5304))
* chore: strting working on parsing service ([8d5d1e9](https://github.com/mulesoft/api-console/commit/8d5d1e9))
* chore: updating auth-methods, form-data-editor, multipart-payload-editor ([ecb8b81](https://github.com/mulesoft/api-console/commit/ecb8b81))
* chore: updating compatibility setting in the scripts ([f18b22c](https://github.com/mulesoft/api-console/commit/f18b22c))
* chore: updating components for annotation rendering fix ([16f6394](https://github.com/mulesoft/api-console/commit/16f6394))
* chore: updating demo build process ([4e1a69a](https://github.com/mulesoft/api-console/commit/4e1a69a))
* chore: updating min width on request section ([a791b33](https://github.com/mulesoft/api-console/commit/a791b33))
* chore: updating navigation that supports a11y ([6fa82a6](https://github.com/mulesoft/api-console/commit/6fa82a6))
* chore: upgradig dependencies ([ced4883](https://github.com/mulesoft/api-console/commit/ced4883))
* chore: upgrading component to remove global icons ([257eddb](https://github.com/mulesoft/api-console/commit/257eddb))
* chore: upgrading components and fixing compatibility issues ([2a0bafa](https://github.com/mulesoft/api-console/commit/2a0bafa))
* chore: upgrading components for security updates ([c6f3661](https://github.com/mulesoft/api-console/commit/c6f3661))
* chore: upgrading demo pages ([871e27a](https://github.com/mulesoft/api-console/commit/871e27a))
* chore: upgrading documentation ([b04d8cd](https://github.com/mulesoft/api-console/commit/b04d8cd))
* chore: upgrading npmignore file ([f1b5b92](https://github.com/mulesoft/api-console/commit/f1b5b92))

### docs

* docs: adding APIC with API editor example ([0019a94](https://github.com/mulesoft/api-console/commit/0019a94))
* docs: adding docs link to readme file ([d1ac619](https://github.com/mulesoft/api-console/commit/d1ac619))
* docs: adding error color to demo page ([b33085a](https://github.com/mulesoft/api-console/commit/b33085a))
* docs: adding navigation to the editor demo ([0399313](https://github.com/mulesoft/api-console/commit/0399313))
* docs: fixinf spelling ([f5b8f54](https://github.com/mulesoft/api-console/commit/f5b8f54))
* docs: updating documentation ([d56e49e](https://github.com/mulesoft/api-console/commit/d56e49e))
* docs: updating icons in the demo page ([f7435d0](https://github.com/mulesoft/api-console/commit/f7435d0))
* docs: updating readme file ([c53be32](https://github.com/mulesoft/api-console/commit/c53be32))
* docs: updating readme file ([dd3e292](https://github.com/mulesoft/api-console/commit/dd3e292))
* docs: updating README page ([8b92019](https://github.com/mulesoft/api-console/commit/8b92019))
* docs: updatoing readme file for the preview version ([3112cf3](https://github.com/mulesoft/api-console/commit/3112cf3))

### feat

* feat: adding an option to set OAuth client ID / secret ([391bba1](https://github.com/mulesoft/api-console/commit/391bba1))
* feat: adding experimental `rearrangeEndpoints` property ([692c21f](https://github.com/mulesoft/api-console/commit/692c21f))

### fix

* fix: adding swagger match to API file search ([75208a4](https://github.com/mulesoft/api-console/commit/75208a4))
* fix: fixed scrolling in APIC app ([58610bd](https://github.com/mulesoft/api-console/commit/58610bd))
* fix: fixes APIC-291 - navigation animation when bootstraping ([c564eff](https://github.com/mulesoft/api-console/commit/c564eff))
* fix: fixing __amfChanged function by calling super class ([34fb6aa](https://github.com/mulesoft/api-console/commit/34fb6aa))
* fix: fixing APIC-260 - CM editor rendered above opened nav drawer ([4876283](https://github.com/mulesoft/api-console/commit/4876283))
* fix: fixing click handler on the "back" button ([7ca40a7](https://github.com/mulesoft/api-console/commit/7ca40a7))
* fix: fixing input width issue for multipart form ([f15b029](https://github.com/mulesoft/api-console/commit/f15b029))
* fix: fixing recognizing swagger spec version ([e34740d](https://github.com/mulesoft/api-console/commit/e34740d))
* fix: removing `this.app` from function call ([f9cdf5d](https://github.com/mulesoft/api-console/commit/f9cdf5d))

### refactor

* refactor: removing `noExtensionBanner` and adding `allowExtensionBanner` ([dda3263](https://github.com/mulesoft/api-console/commit/dda3263))
* refactor: removing Exchange xAPI from demos. Main demo is Drive API ([bc271b4](https://github.com/mulesoft/api-console/commit/bc271b4))
* refactor: removing support for `app` attribute ([6444432](https://github.com/mulesoft/api-console/commit/6444432))
* refactor: upgrading to AMF 4 ([f4b7b4a](https://github.com/mulesoft/api-console/commit/f4b7b4a))

<a name="6.0.0-preview.1"></a>
# 6.0.0-preview.1 (2019-03-01)


* Started upgrading API console to ES6 module imports ([ba26e54](https://github.com/mulesoft/api-console/commit/ba26e54))

### Update

* Update: Started working on local build script ([0345e56](https://github.com/mulesoft/api-console/commit/0345e56))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/mulesoft/api-console/compare/v4.1.0...v4.2.0) (2017-10-25)

- Changed behavior of the `baseUri` property as described in [#535](https://github.com/mulesoft/api-console/issues/535)
- Added this changelog
- Many bug fixes in the internal web components

# [4.1.0](https://github.com/mulesoft/api-console/compare/v4.0.0...v4.1.0) (2017-08-17)

- New: Support for sending files
- New: Added demo page for adding distributed content into the console.
- New: Added demo page for selecting an API version inside the console.
- New: Added `noAttribution` option. Attribution is now part of the console instead of the builder.
- Update: redesign of the "body" editor in the request editor
- Fix: Console is not completing the path whit host and port when Base URI set relative #502
- Fix: Title of the API is not fully displayed #519
- Fix: Add ability to add custom content to the console element as a distributed child #520
- Fix: How to enter application/x-www-form-urlencoded for a post body? #374
- Fix: No feedback for file type #199
- Update: Updated demo pages of the console. See `demo` folder for more information
