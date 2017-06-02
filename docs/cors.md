# CORS

## API Console Chrome extension

There's no easy way to deal with CORS. In the API Console ecosystem there is an extension for Chrome (and soon will be for Firefox) which will proxy the request without CORS limitations. The user (when using supported browser) will see the install extension banner in the request editor. After installing the
extension all traffic from the console will be redirected to the extension to perform the request (without CORS limitations) and to get the response.

#### TL;DR: Extension technical background

The console listens for the `api-console-extension-installed` event that is fired by the extension. Once initialized the console will send an event to the extension when the user make the HTTP request. The element responsible for the communication with the extension is [api-console-ext-comm](https://elements.advancedrestclient.com/elements/api-console-ext-comm).

Other ways to deal with CORS are coming soon. File an issue report in this repository if you can help with this issue.

## Proxy server

One of the ways to deal with CORS is to tell the API console to pass the request through a proxy.
For this you can use `proxy` attribute of the element. Once set then every request made by the console will be passed through the proxy.

When using proxy, the request URL will be altered before sending it to a transport library (possibly the XHR call) by prefixing the URL with proxy value.

```html
<api-console proxy="https://api.proxy.com/api/proxy/"></api-console>
```

With this configuration a request made to `http://domain.com/path/?query=some+value` endpoint will
become `https://api.proxy.com/api/proxy/http://domain.com/path/?query=some+value`.

Don't forget to add trailing '/' to the path or produced URL will be invalid.

If the proxy require to set the URL as a query parameter then `proxy` attribute should end with
parameter name and `=` sign:

```html
<api-console proxy="https://api.proxy.com/api/proxy/?url=" proxy-encode-url></api-console>
```

In this case be sure to set `proxy-encode-url` attribute which will tell the console to URL encode the URL before appending it to the final URL.

With this configuration a request made to `http://domain.com/path/?query=some+value` endpoint will
become `https://api.proxy.com/api/proxy/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`.

The proxy URL won't be visible by the user and the user can't do anything to change this behavior (until your application doesn't support proxy change in some custom UI).

## Handling HTTP request by the hosting website / application

When the user runs the request from the "try it" screen the API Console will fire the `api-console-request` [custom event](https://developer.mozilla.org/en/docs/Web/API/CustomEvent). If your application can handle the transport (by providing a proxy or other solution) you should listen for this event and cancel it by calling `event.preventDefault()`. If the event was cancelled then the API Console will listen for the `api-console-response` custom
event that should contain response details. Otherwise the console will use build in fallback function to get the resource using Fetch API / XHR.

#### api-console-request custom event

Event's `detail` object will contain following properties

Property | Type | Description
----------------|-------------|----------
`url` | `String` | The request URL. If proxy is set it will be final URL with the proxy value.
`method` | `String` | The HTTP method
`headers` | `String` | HTTP headers string to send with the message
`payload` | `String` | Body to send

#### api-console-response

This event must be fired when the hosting app finish the request. It must contain generated Request
and Response object as defined in the [Fetch specification](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). The API console has a polyfill for the Fetch API already included.

Property | Type | Description
----------------|-------------|----------
`request` | `Request` | The request object as defined in the Fetch API spec. See [Request docs](https://developer.mozilla.org/en-US/docs/Web/API/Request) for more details.
`response` | `Response` | The response object as defined in the Fetch API spec. See [Response docs](https://developer.mozilla.org/en-US/docs/Web/API/Response) for more details.
`isXhr` | `Boolean` | Default to `true`. Indicates that the transport method doesn't support advanced timings and redirects information. See [request-panel](https://elements.advancedrestclient.com/elements/raml-request-panel) documentation for detailed description.
`error` | `Error` | When the request / response is errored (`request.ok` equals `false`) then the error object should be set with the human readable message that will be displayed to the user.

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
