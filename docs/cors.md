# CORS

## API Console Chrome extension

There's no easy way to deal with CORS. In the API Console ecosystem, an extension for Chrome (and soon, for Firefox) acts as a proxy for the request without CORS limitations. In a supported browser, the install extension banner appears in the request editor. After you install the
extension, all traffic from the console is redirected to the extension to perform the request (without CORS limitations) and to get the response.

#### TL;DR: Extension technical background

The console listens for the `api-console-extension-installed` event that is fired by the extension. After initialization, the console sends an event to the extension when the user makes the HTTP request. The element responsible for the communication with the extension is [api-console-ext-comm](https://elements.advancedrestclient.com/elements/api-console-ext-comm).

Other ways to deal with CORS are coming soon. File an issue report in this repository if you can help with this issue.

## Proxy server

To deal with CORS, you can use a `proxy attribute` of the element to tell the API console to pass the request through a proxy. After setting the attribute, every request made by the console is passed through the proxy.

Before sending the request to a transport library (possibly the XHR call), the request URL is altered by prefixing the URL with proxy value.

```html
<api-console proxy="https://api.proxy.com/api/proxy/"></api-console>
```

This configuration changes the request endpoint from `http://domain.com/path/?query=some+value` to `https://api.proxy.com/api/proxy/http://domain.com/path/?query=some+value`.

Don't forget to add trailing '/' to the path or the produced URL will be invalid.

If the proxy requires the URL as a query parameter, then the `proxy` attribute should end with
parameter name and `=` sign:

```html
<api-console proxy="https://api.proxy.com/api/proxy/?url=" proxy-encode-url></api-console>
```

In this case, be sure to set the `proxy-encode-url` attribute, so the console URL-encodes the URL before appending it to the final URL.

This configuration changes the request endpoint from `http://domain.com/path/?query=some+value` to `https://api.proxy.com/api/proxy/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`.

The proxy URL won't be visible by the user. The user can't do anything to change this behavior unless your application includes a custom UI that supports such a change.

## Handling HTTP request by the hosting application

When the user runs the request from the "try it" screen, API Console fires the `api-request` [custom event](https://developer.mozilla.org/en/docs/Web/API/CustomEvent). If your application can handle the transport (by providing a proxy, for example), listen for this event, and cancel it by calling `event.preventDefault()`. If the event is cancelled, API Console listens for the `api-response` custom
event that should contain response details. Otherwise, the console uses the build in fallback function to get the resource using Fetch API / XHR.

See [github.com/advanced-rest-client/api-components-api/blob/master/docs/api-request-and-response.md](https://github.com/advanced-rest-client/api-components-api/blob/master/docs/api-request-and-response.md) for detailed documentation of the request events.
