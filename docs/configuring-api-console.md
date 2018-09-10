# API Console configuration options

Configuration options differs from previous version. Because the API console is now a (custom) HTML element, its configuration is based on HTML attributes.

You can pass a configuration option as follows:

```html
<!-- Pure HTML -->
<api-console append-headers="x-api-key: 1234" narrow></api-console>
```

which is equivalent of:

```javascript
// Configuring the API Console using JavaScript properties.
const console = document.querySelector('api-console');
console.narrow = true;
console.appendHeaders = 'x-api-key: 1234';
```

**Boolean attributes** are set by simply adding an attribute without any value, or by passing empty value (`attribute=""`) as required by some HTML validators. Lack of an attribute means its value equals `false`.

**Other attributes** are configured by setting the attribute to a value as shown in the example above.

To access a property using JavaScript, omit any hypens in the attribute name and use camelCase. For example, access the `append-headers` HTML attribute as the `appendHeaders` JavaScript property.

The following table describes HTML attributes.

### Data control attributes

| Attribute | Description | Type |
| --- | --- | ---|
| `amfModel` | Generated AMF json/ld model form the API spec. See [Passing RAML data](passing-raml-data.md) documentation for more information. | `Object` |
| `aware` | Uses [raml-aware] element, with `scope` attribute set to the value of this attribute. See [Passing RAML data](passing-raml-data.md) documentation for more information. | `String` |
| `selectedShape` | Currently selected object. See section [Controlling the view ](#controlling-the-view) section below for more information. | `String` |
| `selectedShapeType` | Currently selected object type. See section [Controlling the view ](#controlling-the-view) section below for more information. | `String` |
| `model-location` | URL of a file with the data model of the API. See [build tools](build-tools.md) documentation for more information. | `String` |
| `page` | Currently selected top level view of the console. Can be either `docs` or `request`. The latter is the "try it" screen. This property changes at runtime when the user navigates through the application. | `String` |
| `append-headers` | Forces the console to send a specific list of headers, overriding user input if needed. The attribute value passes an HTTP headers string separating lines with the `\n` character. Example: `x-api-token: abc\nx-other-headers: header value`. | `String` |
| `proxy` | Sets the proxy URL for the HTTP requests sent from the console. To alter all URLs before sending the data to a transport library, set the attribute and prefix the URL with its value. | `String`
| `proxy-encodeUrl` | If required by the `proxy` the URL is URL-encoded. | `Boolean` |
| `manual-navigation` | Disables navigation in the drawer and renders the navigation full screen when requested. Use in the narrow layouts with the `narrow` property. Set the `navigationOpened` property to `true` or `false` to open/close the navigation. | `Boolean` |
| `scrollTarget` | Use it when API console is embedded inside an element that is a scroll region (has `overflow` attribute set). This allows documentation panel to properly handle scroll position. | `Element` |

### Layout control attributes

| Attribute | Description | Type |
| --- | --- | ---|
| `app` | When set it renders API console as a standalone application. Setting this option addd automation like handling media queries and sets mobile friendly styles | `Boolean` |
| `narrow` | Renders the API console in the "narrow" view. This is a mobile-like view. Navigation is hidden in a drawer, and some views are simplified for narrow screens. This view is presented even if the screen is wide enough to display the full console, which facilitates inserting the element as a sidebar of your web page. The `narrow` property is set automatically on mobile devices when `app` property is set. | `Boolean` |
| `wide-layout` | When true it places try it panel next to the documentation panel. It is set automatically via media queries. It is computed automatically only when `app` attribute is set | `Boolean` |
| `no-try-it` | Disables the "try it" button in the method documentation view. The request editor and the response viewer is still available, but you must open it programmatically by setting `page` property to ` request`. | `Boolean` |  
| `navigation-opened` | If set, the `manual-navigation` attribute is set, and the full screen navigation will open/close. | `Boolean` |
| `bower-location` | If the path to the `bower_components` is different than default (in the root path) then set this attribute to point the location of the folder, including folder name. | `String` |
| `no-url-editor` | If set, the URL editor is hidden in the Try it panel. The editor is still attached to the DOM but it's invisible to the user. | `Boolean` |
| `base-uri` | Used to replace RAML's base URI. Once set it updates the request URL in the request panel (try it). The URL will always contain the same base URL until the attribute is cleared (removed, set to `null`, `undefined` or `false`) | `String`
| `drawer-align` | Align of the layout drawer. Possible values are: `start` and `end` | `String` |
| `noToolbars` | When set it hides layout toolbars | `Boolean` |
| `inlineMethods` | Experimental feature. Always renders the try it panel alongside method documentation. Methods for an endpoint are rendered in a single page instead of separated pages | `Boolean` |


## Controlling the view

The `<api-console>` uses `selectedShape`, `selectedShapeType`, and `page` properties to control the view.
The `page` property displays top level pages as documentation or try it screen. The `selectedShape` informs the components which AMF node to use to render the view. It is the `@id` property of the JSON=ld data model. Finally `selectedShapeType` tells the documentation element which view to render.

The `selectedShape` property can have the following values:

- `summary` - Summary of the API spec
- `docs` - Documentation included in the spec
- `type` - Type
- `resource` - Endpoint documentation
- `method` - Method
- `security` - Security scheme documentation

Normally API console passes `selectedShape` and `selectedShapeType` values from `api-navigation` to `api-documentation` and `api-request-panel` when navigation occurred. However it can be set programmatically to control the view.

## Forcing the API Console to send a specific list of headers

You can force API Console to send a specific list of headers for each request made by it. To do this set the `append-headers` attribute. It should contain a HTTP headers string.

Use a "\n" string to set a new line for the headers string.

```
<api-console append-headers="X-key: my-api-key\nother-header:value"></api-console>
```

[raml-aware]: https://elements.advancedrestclient.com/elements/raml-aware
