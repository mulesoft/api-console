# API Console configuration options

Configuration options differs from previous version. Because the API console is now a (custom) HTML element it's configuration is based on HTML attributes.

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

**Boolean attributes** can be set by simply adding an attribute without any value or passing empty value (`attrobute=""`) which may be required by some HTML validators. Lack of attribute means it's value equals `false`.

**Other attributes** can be configured by setting a value to the attribute as in the example above.

Note that attributes that contains dash sign are camelCased when using Javascript access to the property. In the example above the `append-headers` HTML attribute becomes `appendHeaders` JavaScript property.

Table below describes HTML attributes. If you are accessing JavaScript properties you have to [camel case] them.

| Attribute | Description | Type |
| --- | --- | ---|
| `raml` | The JavaScript object representing the RAML structure as a JavaScript object. This is a result of parsing the RAML using Mulesoft's [RAML parser] and transformed using RAML enhancer. See [Passing RAML data](passing-raml-data.md) documentation for more information. | `Object or String` |
| `json-file` | URL to a file with JSON data that should be read and contents of it should be set to the `raml` attribute. See [build tools](build-tools.md) documentation for more information. | `String` |
| `path` | Currently selected path in the view. See section [Controlling the view ](#controlling-the-view) section below for more information. | `String` |
| `aware` | If passing the RAML data with the [raml-aware] element, it is the value of the `scope` attribute used in the aware. | `String` |
| `page` | Currently selected top level view of the console. It can be either `docs` or `request`. The later is the "try it" screen. | `String` |
| `narrow` | By setting this attribute it will tell the API console to render a "narrow" view. This is a mobile like view (navigation is hidden in a drawer, some views are simplified for narrow screens) that will be presented even if the screen is wide enough to display the full console. This is helpful when inserting the element as a sidebar of your web page. Note that the `narrow` property will be set automatically on mobile devices. | `Boolean` |
| `append-headers` | Forces the console to send specific list of headers, overriding user input if needed. As the attribute value pass a HTTP headers string separating lines with the `\n` character. Example: `x-api-token: abc\nx-other-headers: header value`. | `String` |
| `proxy` | Sets the proxy URL for the HTTP requests sent from the console. If set all URLs will be altered before sending the data to a transport library by prefixing the URL with this value | `String`
| `proxy-encodeUrl` | If required by the `proxy` the URL will be URL encoded. | `Boolean` |
| `no-try-it` | Disables the "try it" button in the method documentation view. The request editor and the response viewer is still available but you must open it programmatically setting `page` property to ` request` | `Boolean` |  
| `manual-navigation` | Disables navigation in the drawer and renders the navigation full screen, when requested. This is ideal to use in the narrow layouts together with `narrow` property. You will have to set the `navigationOpened` property to `true` or `false` to open / close the navigation. | `Boolean` |
| `navigation-opened` | If set and `manual-navigation` attribute is set then it will open / close the full screen navigation. | `Boolean` |

## Controlling the view

The `<api-console>` uses the `path` and `page` properties to control the view.
While `page` is responsible for displaying top level pages (either documentation or try it screen), the `path` property controls which part of the RAML spec is currently displayed (in both of top level screens).

If required by your use case, you can control the view programmatically.

The `path` property can be set to display:
- Summary of the API spec
- Documentation included in the spec
- Type
- Resource
- Method

`path` is simply a JSON path (or x-path) to a specific value of the JavaScript object.

For example, to display documentation for a method you would set the `path` property to:

```html
<api-console path="resources.0.method.1"></api-console>
```

Example above will display second method from first resource in the resources tree. You can set attribute `display` to `request` to display a request panel for this method. By default it is set to `docs`.

Detailed description for building the path can be found in the [raml-path-selector] custom element documentation.

## Forcing the API Console to send a specific list of headers

You can force the API Console to send a specific list of headers for each request made by it. To do this set the `append-headers` attribute. It should contain a HTTP headers string.

If the user declare a header that is declared in the `append-headers` attribute then user value will be overridden. Otherwise headers will be appended to the headers string.

Use "\n" string to set a new line for the headers string.

```
<api-console append-headers="X-key: my-api-key\nother-header:value"></api-console>
```

[camel case]: https://en.wikipedia.org/wiki/Camel_case
[raml-aware]: https://elements.advancedrestclient.com/elements/raml-aware
[RAML parser]: https://github.com/raml-org/raml-js-parser-2
[raml-path-selector]: https://elements.advancedrestclient.com/elements/raml-path-selector
