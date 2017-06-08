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

## Handling HTTP request by the hosting website / application

When the user runs the request from the "try it" screen, API Console fires the `api-console-request` [custom event](https://developer.mozilla.org/en/docs/Web/API/CustomEvent). If your application can handle the transport (by providing a proxy, for example), listen for this event, and cancel it by calling `event.preventDefault()`. If the event is cancelled, API Console listens for the `api-console-response` custom
event that should contain response details. Otherwise, the console uses the build in fallback function to get the resource using Fetch API / XHR.

#### api-console-request custom event

The Event `detail` object contains following properties:

Property | Type | Description
----------------|-------------|----------
`url` | `String` | The request URL. If proxy is set, it will be the final URL with the proxy value.
`method` | `String` | The HTTP method
`headers` | `String` | HTTP headers string to send with the message
`payload` | `String` | Body to send

#### api-console-response

This event must be fired when the hosting app finishes the request. It must contain a generated Request
and Response object as defined in the [Fetch specification](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). API Console includes a polyfill for the Fetch API.

Property | Type | Description
----------------|-------------|----------
`request` | `Request` | The request object as defined in the Fetch API spec. See [Request docs](https://developer.mozilla.org/en-US/docs/Web/API/Request) for more information.
`response` | `Response` | The response object as defined in the Fetch API spec. See [Response docs](https://developer.mozilla.org/en-US/docs/Web/API/Response) for more information.
`isXhr` | `Boolean` | Default is `true`. Indicates that the transport method doesn't support advanced timings and redirects information. See [request-panel](https://elements.advancedrestclient.com/elements/raml-request-panel) documentation for more information.
`error` | `Error` | When the request / response encounters an error (`request.ok` equals `false`), the error object is set with the human readable message for the user.

#### Example with handling request / response events

```javascript
// Start time of executing the request
var startTime;
// Initial request data passed by the event.
var requestData;
/**
 * Creates a Headers object based on the HTTP headers string.
 *
 * @param {String} headers HTTP headers.
 * @return {Headers} Parsed headers object.
 */
function createHeaders(headers) {
  if (!headers) {
    return new Headers();
  }
  var result = new Headers();
  var list = headers.split('\n').map(function(line) {
    var _parts = line.split(':');
    var _name = _parts[0];
    var _value = _parts[1];
    _name = _name ? _name.trim() : null;
    _value = _value ? _value.trim() : null;
    if (!_name || !_value) {
      return null;
    }
    return {
      name: _name,
      value: _value
    };
  }).filter(function(item) {
    return !!item;
  });
  list.forEach(function(item) {
    result.append(item.name, item.value);
  });
  return result;
}
/**
 * Creates a request object from the event's request data.
 *
 * @param {Object} data Latest request data as in the `api-console-request` object event.
 * @return {Request} The Request object.
 */
function createRequest(data) {
  var init = {
    method: data.method,
    mode: 'cors'
  };
  if (data.headers) {
    init.headers = createHeaders(data.headers);
  }
  if (['GET', 'HEAD'].indexOf(data.method) !== -1) {
    data.payload = undefined;
  } else {
    if (data.payload) {
      init.body = data.payload;
    }
  }
  return new Request(data.url, init);
}
/**
 * Creates a response object from the response data.
 * If the response is invalid then returned Response object will be errored.
 *
 * @param {XMLHttpRequest} xhr The XHR object used to make a connection.
 * @return {Response} The response object.
 */
function createResponse(xhr) {
  var status = xhr.status;
  if (!status || status < 200) {
    return Response.error();
  }
  var init = {
    status: status,
    statusText: xhr.statusText
  };
  var headers = xhr.getAllResponseHeaders();
  if (headers) {
    init.headers = createHeaders(headers);
  }
  try {
    return new Response(xhr.responseText, init);
  } catch (e) {
    return Response.error();
  }
}
// General error handler.
function errorHandler(e) {
  var loadTime = performance.now() - startTime;
  var request = createRequest(requestData);
  var detail = {
    request: request,
    response: Response.error(),
    loadingTime: loadTime,
    isXhr: true,
    error:  new Error('Resource is unavailable')
  };
  var event = new CustomEvent('api-console-response', {
    cancelable: false,
    bubbles: true,
    composed: true,
    detail: detail
  });
  document.body.dispatchEvent(event);
}
// Handler for load event
function loadHandler(e) {
  var loadTime = performance.now() - startTime;
  var request = createRequest(requestData);
  var response = createResponse(e.target);
  var detail = {
    request: request,
    response: response,
    loadingTime: loadTime,
    isXhr: true
  };
  if (!response.ok) {
    detail.error = new Error('Resource is unavailable');
  }
  var event = new CustomEvent('api-console-response', {
    cancelable: false,
    bubbles: true,
    composed: true,
    detail: detail
  });
  document.body.dispatchEvent(event);
}
// Handler to the event, sends the request
function consoleRequestHandler(e) {
  requestData = e.detail;
  var xhr = new XMLHttpRequest();
  xhr.open(requestData.method, requestData.url, true);
  if (requestData.headers) {
    requestData.headers.split('\n').forEach(function(header) {
      var data = header.split(':');
      var name = data[0].trim();
      var value = '';
      if (data[1]) {
        value = data[1].trim();
      }
      try {
        xhr.setRequestHeader(name, value);
      } catch (e) {
        console.log('Can\'t set header ' + name ' in the XHR call.');
      }
    });
  }
  xhr.addEventListener('load', loadHandler);
  xhr.addEventListener('error', errorHandler);
  xhr.addEventListener('timeout', errorHandler);
  try {
    startTime = performance.now();
    xhr.send(requestData.payload);
  } catch (e) {
    errorHandler(e);
  }
}
window.addEventListener('api-console-request', consoleRequestHandler);
```
