# API Console events handling

## About events in the components

API Console is build with a set of API Components. These are a set of web components for building AMF powered application for API documentation.
The components exchange information using DOM events. It's efficient, scalable, and standard for DOM elements of communication.

Because the application works with different environments, which some may already have OAuth 2 or XHR mechanisms in place, the logic responsible for executing a request or obtaining OAuth 2 authorization token is not included by default into web component API Console. They are, however, included in stand-alone application version.

This separation allows developers to decide whether hosting application is to use API Console's logic elements for making a request and OAuth 2 authorization or if preferred way it to handle it by the hosting application.

### Use cases

#### Handling DOM events

You may prefer to handle events and execute the logic separately to API Console logic when CORS plays a role.
This is a common problem when OAuth 2 is used with `authorization_code` grant. In production the endpoint to exchange code with the token has usually disabled CORS control (or implicitly disables requests from browsers). In this case API Console won't be able to exchange the code for token as the browser will block the request.

Similarly API calls to endpoints that has disabled CORS control will fail blocked by the browser.

You may also want to consider not using provided components when your application that hosts the web components already support similar logic and including additional libraries would be redundant.

In this cases the hosting application should handle DOM events dispatched by the console and implement own, server side logic to make API calls possible.

#### Using API Console provided components

When CORS is not a problem and hosting application does not support OAuth 2 or API calls.

## Using API Console components

### Authorization events

For OAuth 2 and OAuth 1 authorization API Console provides two components from a single package `@advanced-rest-client/oauth-authorization`. By including the components anywhere into the DOM the console auto-magically uses them to initialize OAuth flow.

#### Usage

Install the components
```sh
npm i -S @advanced-rest-client/oauth-authorization
```

Include dependencies
```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
      import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
    </script>
  </head>
  <body>
    <oauth1-authorization></oauth1-authorization>
    <oauth2-authorization></oauth2-authorization>
  </body>
</html>
```

### Request events

Request logic is provided via `@advanced-rest-client/xhr-simple-request` package.
Put the component anywhere in the DOM to enable communication with console.

#### Usage

Install the components
```sh
npm i -S @advanced-rest-client/xhr-simple-request
```

Include dependencies
```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/xhr-simple-request/oauth1-authorization.js';
    </script>
  </head>
  <body>
    <xhr-simple-request></xhr-simple-request>
  </body>
</html>
```

The component provides few configuration options.

**appendHeaders**

Type: `String`.

The console will always add this headers to the outgoing request. If the user
define a header that is defined in the value it will be ignored.

It can be used to provide `authorization` header for demo purposes.

The value has to be valid HTTP headers string.

```html
<xhr-simple-request appendheaders="authorization: bearer 123\nx-source: api-console"></xhr-simple-request>
```

**proxy**

Type: `String`.

When set, every request made from the console are proxied by the service provided in this value.

It prefixes API request URL with the proxy value. As a result the API call to `http://domain.com/path/?query=some+value` becomes `https://proxy.com/path/http://domain.com/path/?query=some+value`.

If the proxy requires to pass the URL as a query parameter define value as: `https://proxy.com/path/?url=`. In this case be sure to set `proxyencodeurl` attribute.

```html
<xhr-simple-request proxy="/api-proxy?url="></xhr-simple-request>
```

**proxyEncodeUrl**

Type: Boolean

When `proxy` is set, it encodes request URL before appending it to the proxy URL.
As a result a `http://domain.com/path/?query=some+value` becomes `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`.

The value is ignored when `proxy` is not set.

```html
<xhr-simple-request proxy="/api-proxy?url=" proxyencodeurl></xhr-simple-request>
```

## Using events API

This section is more advanced as it requires coding experience.

### OAuth token exchange

The token flow is initialized from `@advanced-rest-client/auth-methods` by `auth-method-oauth2`
component. It is documented in details in [oauth-authorization](https://github.com/advanced-rest-client/oauth-authorization) component.

#### OAuth 2

When the user presses "Request token" button in the request editor it dispatches `oauth2-token-requested` custom event. The event bubble through the DOM but can be (and should) cancelled.
The hosting application should handle this event to initialize OAuth flow.

The `detail` object of the event has the following properties.

| Property | Description |
| -- | --- |
| `type` | Selected grant type. Can be one of standard: `implicit`, `authorization_code`, `client_credentials`, `password` grants or any custom grant. |
| `clientId` | User provided client ID |
| `accessToken` | Current access token, if any |
| `tokenType` | By default `Bearer`. API Console has no configuration option to change this value. |
| `scopes` | A list of user entered scopes. It may be `undefined`. |
| `deliveryMethod` | By default `header`. API Console has no configuration option to change this value. |
| `deliveryName` | By default `authorization`. API Console has no configuration option to change this value. |
| `state` | State parameter to be included into request. This value must be reported back with token response or the response is ignored. |

Depending on the `type` other properties vary.

| Property | Grant type | Description |
| -- | --- | -- |
| `authorizationUri` | `implicit`, `authorization_code`, and custom | The authorization URI to redirect the user to log in. |
| `redirectUri` | `implicit`, `authorization_code`, and custom | Registered in the OAuth provider redirect URI |
| `clientSecret`  | `authorization_code` and custom | Client secret generated when registering the OAuth application |
| `accessTokenUri` | `authorization_code`, `client_credentials`, `password`, and custom | Token request URI |
| `username` | `password` and custom | User's user name |
| `password` | `password` and custom | User's password |

##### Custom properties

As per [RFC6749, section 8](https://tools.ietf.org/html/rfc6749#section-8) OAuth 2.0 protocol can be extended by custom `grant_type`, custom query parameters and custom headers.

This is not yet supported in RAML. However, working together with RAML spec creators, an official RAML annotation to extend OAuth 2.0 settings has been created.

The annotation source can be found in the [RAML organization repository](https://github.com/raml-org/raml-annotations/blob/master/annotations/security-schemes/oauth-2-custom-settings.raml).

When the annotation is applied to the `ramlSettings` property, the authorization element renders additional form inputs to support custom schemes.

This produces additional property in the token authorization request: `customData`.
The object contains user input from custom properties.

##### `customData` model

```javascript
customData: {
  auth: {
    parameters: Array|undefined
  },
  token: {
    parameters: Array|undefined,
    headers: Array|undefined,
    body: Array|undefined
  }
}
```
`auth` contains properties to be applied to the authorization request.

Only query parameters are (and can be) supported.

`token` property contains properties to be applied when making token request.
It can include `parameters` as a query parameters, `headers` as a list of headers to apply, and `body` as a list of properties to send with the body.

Note: `body` content type is always `application/x-www-form-urlencoded`. `customData.token.body` parameters must not be url encoded. Processors handing token request should handle values encoding.

#### Propagating the token response

When token response is ready the application must dispatch `oauth2-token-response` custom
event. The console listens on `window` node for this event to update UI state.

The `detail` object must contain both `accessToken` and `state` properties.
The `state` property must be the same as the one included into `oauth2-token-requested` event.

When error occurred during the authorization flow dispatch `oauth2-error` event instead.
It must contain `state` property and should include `message` that is rendered to the user.

#### Full example

```html
<body>
  <api-console></api-console>
  <script>
  function dispatchEvent(type, detail) {
    const e = new CustomEvent(type, {
      bubbles: true,
      detail
    });
    document.body.dispatchEvent(e);
  }

  async function initOauthFlow(e) {
    const { state } = e.detail;
    try {
      const accessToken = await runOauthSomehow(e.detail);
      dispatchEvent('oauth2-token-response', {
        accessToken,
        state
      });
    } catch (e) {
      dispatchEvent('oauth2-error', {
        message: e.message,
        state
      });
    }
  }
  document.body.addEventListener('oauth2-token-requested', initOauthFlow);
  </script>
</body>
```

### Request events

API Console handles `api-request` and `api-response` events. `api-request` is dispatched by the console with request details, and `api-response` is dispatched by the hosting application to inform the console about the result.

The `detail` object of the `api-request` event has the following properties.

| Property | Type | Description |
| -- | -- | -- |
| `url` | `String` | The request URL |
| `method` | `String` | The request method |
| `headers` | `String` or `undefined` | Valid HTTP headers string |
| `payload` | `String`, `FormData`, `File`, `ArrayBuffer` or `undefined` | Optional. Request body. HEAD and GET requests do not carry body. |
| `id` | `String` | Auto generated ID of request. This must be reported back with `api-response` event |

When the response is ready the `api-response` event must be dispatched in order to update the view. The detail object must include the following properties.

| Property | Type | Description |
| -- | -- | -- |
| id | `String` | Request ID |
| request | `Object` | Optional, the original request object |
| loadingTime | `Number` | Request loading time. It accepts high precise timing used by the performance API. It is presented as milliseconds. |
| isError | `Boolean` | A flag set when the response is an error. When `isError` is set the `response` is optional. |
| error | `Error` | Optional. Error object. |
| response | `Object` | Response details |
| response.status | `Number` | Response status code |
| response.statusText | `String` | Response status text. Can be empty string. |
| response.payload | `String`, `Document`, `ArrayBuffer`, `Blob`, `undefined` | Response body |
| response.headers | `String` or `undefined` | Response headers |

#### Full example

```html
<body>
  <api-console></api-console>
  <script>
  function dispatchEvent(type, detail) {
    const e = new CustomEvent(type, {
      bubbles: true,
      detail
    });
    document.body.dispatchEvent(e);
  }

  async function initRequest(e) {
    const request = e.detail;
    const { id } = request;
    try {
      const response = await runRequestSomehow(e.detail);
      response.id = id;
      response.request = request;
      dispatchEvent('api-response', response);
    } catch (e) {
      dispatchEvent('api-response', {
        error: e,
        isError: true,
        id
      });
    }
  }
  document.body.addEventListener('api-request', initRequest);
  </script>
</body>
```
