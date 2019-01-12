# API Console configuration options

Configuration options differs from previous version. Because the API console is now a (custom) HTML element, its configuration is based on HTML attributes.

## Configuring API console

You can pass a configuration option as HTML attributes:

```html
<api-console append-headers="x-api-key: 1234" narrow></api-console>
```

which is equivalent of setting properties on the custom element:

```javascript
// Configuring the API Console using JavaScript properties.
const console = document.querySelector('api-console');
console.narrow = true;
console.appendHeaders = 'x-api-key: 1234';
```

**Boolean attributes** are set by simply adding an attribute without any value, or by passing empty value (`attribute=""`) as required by some HTML validators. Lack of an attribute means its value equals `false`.

**Other attributes** are configured by setting the attribute to a value as shown in the example above.

To access a property using JavaScript, omit any hypens in the attribute name and use camelCase. For example, access the `append-headers` HTML attribute as the `appendHeaders` JavaScript property.

### Data control attributes

#### amfModel

Type: **Object**

Generated AMF json/ld model form the API spec. See [Passing RAML data](passing-raml-data.md) documentation for more information.

```javascript
const model = await downloadModel();
const apic = document.querySelector('api-console');
apic.amfModel = model;
```

#### aware

Type: **string**

Uses [raml-aware][] element, with `scope` attribute set to the value of this attribute. See [Passing RAML data](passing-raml-data.md) documentation for more information.

```html
<raml-aware scope="my-api"></raml-aware>
<api-console aware="my-api"></api-console>
```

```javascript
const model = await downloadModel();
const aware = document.querySelector('raml-aware');
aware.raml = model;
```

#### selected-shape

Type: **String**

Currently selected object. See section [Controlling the view](#controlling-the-view) section below for more information.

```javascript
const apic = document.querySelector('api-console');
apic.selectedShape = 'summary';
```

#### selected-shape-type

Type: **string**

Currently selected object type.

It can be one of:

-   `summary` - API summary view
-   `documentation` - RAML's documentation node
-   `type` - Model documentation (type, schema)
-   `security` - Security scheme documentation
-   `endpoint` - Endpoint documentation
-   `method` - Method documentation

See section [Controlling the view](#controlling-the-view) section below for more information.

```javascript
const apic = document.querySelector('api-console');
apic.selectedShapeType = 'summary';
```

#### model-location

Type: **String**

Location of the file with generated AMF model to automatically download when this value change.
This can be used to optimise start up time by not producing AMF model from your API spec each time the console is opened.

The [build tools][] allows you to generate this file for you when building production ready console.

```html
<api-console model-location="static/api/api-model.json"></api-console>
```

#### append-headers

Type: **String**

Forces the console to send a specific list of headers, overriding user input if needed.
The attribute value passes an HTTP headers string separating lines with the `\n` character.

```html
<api-console append-headers="x-api-token: abc\nx-other-headers: header value"></api-console>
```

#### proxy

Type: **String**

Sets the proxy URL for the HTTP requests sent from the console.
When set each request is sent to the proxy service instead of the final request URL.
The request URL is added to the end of the proxy string. Use with combination with
`proxy-encode-url` to encode URL value.

```html
<api-console proxy="https://api.service.proxy/?u="></api-console>
```

This sends the request to the proxy service that would look like this:

`https://api.service.proxy/?u=https://api.domain.com/endpoint`

#### proxy-encode-url

Type: **String**

To be used when `proxy` is set. The value appended to the proxy URL is url encoded.

```html
<api-console proxy="https://api.service.proxy/?u=" proxy-encode-url></api-console>
```

This sends the request to the proxy service that would look like this:

`https://api.service.proxy/?u=https%3A%2F%2Fapi.domain.com%2Fendpoint`

#### manual-navigation

Type: **Boolean**

Disables navigation support in the UI. When set the navigation has to be supported programmatically.
Use in the narrow layouts with the `narrow` attribute. Set `navigation-opened` property to `true` or `false` to control the navigation.

```html
<api-console manual-navigation narrow></api-console>
```
```javascript
const apic = document.querySelector('api-console');
apic.navigationOpened = true;
```

#### scroll-target

Type: **Element**

Some documentation components (like endpoint documentation) uses this property to control the scroll position.
By default it uses `window` object. When API console is used inside a scroll area use the area element.

```html
<div style="overflow: auto; height: 600px; width: 800px" id="scroller">
  <api-console scroll-target="scroller"></api-console>
</div>
```

Note: API console won't recognize string value as an ID of a parent element. You have to
pass this value programmatically.

#### bower-location

Type: **String**

If the path to `bower_components` folder is different than default (in the root path)
then set this attribute to point the location of the folder, including folder name.
This is used to compute location of OAuth2 authorization popup dialog.
You can also set `redirect-uri` attribute to point OAuth dialog directly.

```html
<api-console bower-location="static/api-console/bower_components/"></api-console>
```

#### redirect-uri

Type: **String**

OAuth2 redirect URI.
By default the app uses `bower-location` to compute redirect location URI.
Set this value to a popup URL where the redirect should occur.

See documentation for `advanced-rest-client/oauth-authorization` for API details.

```html
<api-console redirect-uri="https://my.api.domain/oauth/popup.html"></api-console>
```

#### base-uri

Type: **String**

Used to replace RAML's or OAS' base URI. Once set it updates the request URL in the request panel (try it).
The URL will always contain the same base URL until the attribute is cleared (removed, set to `null`, `undefined` or `false`).

The request URL is a combination of base uri and endpoint's path.

```html
<api-console base-uri="https://proxy.api.com/endpoint"></api-console>
```

### Layout control attributes

#### page

Type: **String**

Currently selected top level view of the console. Can be either `docs` or `request`. The latter is the "try it" screen. This property changes at runtime when the user navigates through the application.

This can be usefull when changing API model dynamically to reset the console to the default state.

```javascript
const apic = document.querySelector('api-console');
apic.page = 'docs';
apic.selectedShape = 'summary';
apic.selectedShapeType = 'summary';
```

#### app

Type: **Boolean**

When set it renders API console as a standalone application.
Setting this option adds automation like handling media queries and sets mobile friendly styles.
This attribute is set automatically when using our [build tools][].

```html
<api-console app></api-console>
```

#### narrow

Type: **Boolean**

Renders the API console in the mobile friendly view.
Navigation is hidden and some views are simplified for narrow screens. This view is presented even if the screen is wide enough to display the full console, which facilitates inserting the element as a sidebar of your web page. The `narrow` property is set automatically on mobile devices when `app` property is set.

```html
<api-console narrow></api-console>
```

#### wide-layout

Type: **Boolean**

When set it places try it panel next to the documentation panel. It is set automatically via media queries when `app` attribute is set.

```html
<api-console wide-layout></api-console>
```

#### no-try-it

Type: **Boolean**

Disables the "try it" button in the method documentation view.
The request editor and the response viewer is still available, but it must be opened programmatically by setting `page` property to ` request`.
When `app` is set and `wide-layout` is computed to be true then it is automatically set to true as the request panel is rendered next to the documentation.

```html
<api-console no-try-it></api-console>
```

#### navigation-opened

Type: **Boolean**

Works when `manual-navigation` attribute is set. Toggles navigation state.

```javascript
const button = document.querySelector('.nav-toggle-button');
button.addEventListener('click', () => {
  const apic = document.querySelector('api-console');
  apic.navigationOpened = !apic.navigationOpened;
});
```

#### no-url-editor

Type: **Boolean**

If set, the URL editor is hidden in the try it panel.
The editor is still attached to the DOM but it is not invisible to the user.

```html
<api-console no-url-editor></api-console>
```

#### drawer-align

Type: **String**

Alignment of the navigation drawer. Possible values are: `start` and `end`.

```html
<api-console drawer-align="end"></api-console>
```

#### no-toolbars

Type: **Boolean**

Hides application toolbars on top of the console.

```html
<api-console no-toolbars></api-console>
```

#### inline-methods

Type: **Boolean**

Experimental feature. Always renders the try it panel alongside method documentation. Methods for an endpoint are rendered in a single page instead of separated pages

```html
<api-console inline-methods></api-console>
```

#### allow-disable-params

Type: **Boolean**

Option passed to the try it panel. When set it allows to disable parameters in an editor (headers, query parameters). Disabled parameter won't be used with a test call but won't be removed from the UI.

```html
<api-console allow-disable-params></api-console>
```

#### allow-custom

Type: **Boolean**

Option passed to the try it panel. When set, editors renders "add custom" button that allows to define custom parameters next to API spec defined.

```html
<api-console allow-custom></api-console>
```

#### allow-hide-optional

Type: **Boolean**

Option passed to the try it panel. Enables auto hiding of optional properties (like query parameters or headers) and renders a checkbox to render optional items in the editor view.

```html
<api-console allow-hide-optional></api-console>
```

#### no-docs

Type: **Boolean**

Prohibits rendering documentation (the icon and the description) in request editors.

```html
<api-console no-docs></api-console>
```

#### no-extension-banner

Stops the CORS extension banner message to render in the request panel.

```html
<api-console no-extension-banner></api-console>
```

#### events-target

Type: **Element**

A HTML element used to listen for events on.
If you use one than more API console elements on single page at the same time wrap the console is a HTML element (eg div) and set this value to the container so the request panel only listen to events dispatched inside the container. Otherwise events dispatched by the request panel will be handled by other instances of the console.

```html
<div id="target1">
  <api-console events-target="target1"></api-console>
</div>
<div id="target2">
  <api-console events-target="target2"></api-console>
</div>
```
Note: API console won't recognize string value as an ID of a parent element. You have to
pass this value programatically.

## Controlling the view

The `<api-console>` uses `selectedShape`, `selectedShapeType`, and `page` properties to control the view.
The `page` property displays top level pages as documentation or try it screen. The `selectedShape` informs the components which AMF node to use to render the view. It is the `@id` property of the JSON=ld data model. Finally `selectedShapeType` tells the documentation element which view to render.

The `selectedShape` property can have the following values:

-   `summary` - Summary of the API spec
-   `docs` - Documentation included in the spec
-   `type` - Type
-   `resource` - Endpoint documentation
-   `method` - Method
-   `security` - Security scheme documentation

Normally API console passes `selectedShape` and `selectedShapeType` values from `api-navigation` to `api-documentation` and `api-request-panel` when navigation occurred. However it can be set programmatically to control the view.

[raml-aware]: https://elements.advancedrestclient.com/elements/raml-aware
[build tools]: build-tools.md
