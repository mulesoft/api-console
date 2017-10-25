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
var console = document.querySelector('api-console');
console.narrow = true;
console.appendHeaders = 'x-api-key: 1234';
```

**Boolean attributes** are set by simply adding an attribute without any value, or by passing empty value (`attribute=""`) as required by some HTML validators. Lack of an attribute means its value equals `false`.

**Other attributes** are configured by setting the attribute to a value as shown in the example above.

To access a property using JavaScript, omit any hypens in the attribute name and use camelCase. For example, access the `append-headers` HTML attribute as the `appendHeaders` JavaScript property.

The following table describes HTML attributes.

| Attribute | Description | Type |
| --- | --- | ---|
| `raml` | The JavaScript object representing the RAML structure as a JavaScript object. This is a result of parsing the RAML using the Mulesoft [RAML parser] and transforming the RAML using the RAML enhancer. See [Passing RAML data](passing-raml-data.md) documentation for more information. | `Object or String` |
| `json-file` | URL of a file having JSON data to be read and contents to be set to the `raml` attribute. See [build tools](build-tools.md) documentation for more information. | `String` |
| `path` | Currently selected path in the view. See section [Controlling the view ](#controlling-the-view) section below for more information. | `String` |
| `aware` | If passing the RAML data with the [raml-aware] element, this is the value of the `scope` attribute used in the aware. | `String` |
| `page` | Currently selected top level view of the console: either `docs` or `request`. The latter is the "try it" screen. | `String` |
| `narrow` | Renders the API console in the "narrow" view. This is a mobile-like view. Navigation is hidden in a drawer, and some views are simplified for narrow screens. This view is presented even if the screen is wide enough to display the full console, which facilitates inserting the element as a sidebar of your web page. The `narrow` property is set automatically on mobile devices. | `Boolean` |
| `append-headers` | Forces the console to send a specific list of headers, overriding user input if needed. The attribute value passes an HTTP headers string separating lines with the `\n` character. Example: `x-api-token: abc\nx-other-headers: header value`. | `String` |
| `proxy` | Sets the proxy URL for the HTTP requests sent from the console. To alter all URLs before sending the data to a transport library, set the attribute and prefix the URL with its value. | `String`
| `proxy-encodeUrl` | If required by the `proxy` the URL is URL-encoded. | `Boolean` |
| `no-try-it` | Disables the "try it" button in the method documentation view. The request editor and the response viewer is still available, but you must open it programmatically by setting `page` property to ` request`. | `Boolean` |  
| `manual-navigation` | Disables navigation in the drawer and renders the navigation full screen when requested. Use in the narrow layouts with the `narrow` property. Set the `navigationOpened` property to `true` or `false` to open/close the navigation. | `Boolean` |
| `navigation-opened` | If set, the `manual-navigation` attribute is set, and the full screen navigation will open/close. | `Boolean` |
| `bower-location` | If the path to the `bower_components` is different than default (in the root path) then set this attribute to point the location of the folder, including folder name. | `String` |
| `no-url-editor` | If set, the URL editor is hidden in the Try it panel. The editor is still attached to the DOM but it's invisible to the user. | `Boolean` |
| `base-uri` | Used to replace RAML's base URI. Once set it updates the request URL in the request panel (try it). The URL will always contain the same base URL until the attribute is cleared (removed, set to `null`, `undefined` or `false`) | `String`


## Controlling the view

The `<api-console>` uses the `path` and `page` properties to control the view.
The `page` property displays top level pages in either the documentation or try it screen. The `path` property controls which part of the RAML spec is currently displayed in both top level screens.

If required by your use case, you can control the view programmatically.

The `path` property can be set to display the following things:
- Summary of the API spec
- Documentation included in the spec
- Type
- Resource
- Method

`path` is simply a JSON path (or x-path) to a specific value of the JavaScript object.

For example, to display documentation for a method, set the `path` property as follows:

```html
<api-console path="resources.0.method.1"></api-console>
```

The example above displays the second method from first resource in the resources tree. You can set the attribute `display` to `request` to display a request panel for this method. By default, the attribute is set to `docs`.

For more information about building the path, see the [raml-path-selector] custom element documentation.

## Forcing the API Console to send a specific list of headers

You can force the API Console to send a specific list of headers for each request made by it. To do this set the `append-headers` attribute. It should contain a HTTP headers string.

You can force the API Console to send a specific list of headers for each request it makes. Set the `append-headers` attribute and include an HTTP headers string.

Use a "\n" string to set a new line for the headers string.

```
<api-console append-headers="X-key: my-api-key\nother-header:value"></api-console>
```

[raml-aware]: https://elements.advancedrestclient.com/elements/raml-aware
[RAML parser]: https://github.com/raml-org/raml-js-parser-2
[raml-path-selector]: https://elements.advancedrestclient.com/elements/raml-path-selector
