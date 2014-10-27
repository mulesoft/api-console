# RAML Console

[![Build Status](https://travis-ci.org/mulesoft/api-console.png)](https://travis-ci.org/mulesoft/api-console)

An API console for [RAML](http://raml.org) (Restful Api Modeling Language) documents. The RAML Console allows browsing of API documentation and in-browser testing of API methods.

## Using the console

There are two ways you can include the console: directly, or within an iframe. The direct method is seamless but has the potential of CSS and JS conflicts. Using an iframe avoids conflicts, but has its own quirks noted below.

### Including the console directly

1. Include the packaged CSS and JS in your document

        <head>
          …
          <link href="styles/vendor.css" rel="stylesheet" type="text/css">
          <link rel="stylesheet" href="path/to/dist/styles/light-theme.css" type="text/css" />
        </head>
        <body ng-app="ramlConsoleApp" ng-cloak>
          …
          <script src="path/to/dist/scripts/vendor.js"></script>
          <script type="text/javascript" src="scripts/api-console.js"></script>
          <script type="text/javascript">
            $.noConflict();
          </script>
        </body>

2. Include the `<raml-console>` directive, specifying your RAML as a `src` attribute.
       <raml-console src='path/to/your/api.raml'></raml-console>

3. Please ensure that the container for the console directive provides the CSS properties `overflow: auto` and `position: relative`.

#### Caveats

##### CSS Conflicts

The CSS for the console is namespaced so that it won't affect other parts of the page it's included on. However, general styles you have (such as on `h1`s) may inadvertently bleed into the console.

##### JS Conflicts

The console's javascript includes various dependencies, for example [AngularJS](http://angularjs.org/) and [jQuery](http://jquery.com/). If your document requires different versions or includes conflicting libraries, your page may break.

### Including the console via an iframe

1. Within the page that you would like to include the console into, add the following:

        <iframe src="path/to/dist/index.html?raml=path/to/your.api.raml"/>

#### Caveats

##### Sizing

You will need to specify a fixed height for the iframe that fits into the design of your page. Since iframes do not automatically resize to fit content, the user may have to scroll within the iframe.

### General considerations

1. Your RAML document needs to be hosted on the same domain as the console, or on a domain that allows [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) requests from your domain.
2. To use **Try It** functionality within the console, your API needs to enable CORS from the console's domain, or you need to use a proxy.

## Configuration

### Proxying

A proxy for Try It can be provided after loading the console JavaScript. For example:

    RAML.Settings.proxy = 'http://www.someproxy.com/somepath/'

Given the above, trying a GET to `http://www.someapi.com/resource` would get

    http://www.someproxy.com/somepath/http://www.someapi.com/resource

### OAuth 2

A redirect URI for OAuth 2 can be provided in a similar manner:

    RAML.Settings.oauth2RedirectUri = 'http://www.raml.org/console/'

Given the above, OAuth 2 requests would redirect back to that URL.

### Fullscreen Try-It

*Try It* can be started on fullscreen by default using the following setting:

    <raml-console with-try-it-on-fullscreen></raml-console>

### Theme Switcher

*Theme Switcher* can be disable if needed by adding the following setting:

    <raml-console disable-theme-switcher></raml-console>

## Development

### Prerequisites

To run the console, you'll need the following:

* [Node JS](http://nodejs.org/)
* [NPM](https://npmjs.org/)

### First Time Setup

1. Install grunt-cli globally - `npm install -g grunt-cli`
2. Install the console's NPM packages - `npm install`

### Running the server

    $ grunt server
    $ open http://localhost:9000
