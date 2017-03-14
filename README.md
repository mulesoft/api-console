# RAML Console

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/mulesoft/api-console?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/mulesoft/api-console.png)](https://travis-ci.org/mulesoft/api-console) [![Dependency Status](https://david-dm.org/mulesoft/api-console.png)](https://david-dm.org/mulesoft/api-console#info=dependencies)
[![DevDependency Status](https://david-dm.org/mulesoft/api-console/dev-status.png)](https://david-dm.org/mulesoft/api-console#info=devDependencies) [![npm version](https://badge.fury.io/js/api-console.svg)](https://badge.fury.io/js/api-console) [![Bower version](https://badge.fury.io/bo/api-console.svg)](https://badge.fury.io/bo/api-console)

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

2. Include the `<raml-console-loader>` directive, specifying your RAML as a `src` attribute.
       <raml-console-loader src='path/to/your/api.raml'></raml-console-loader>

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

### Markdown line breaks

Add the following in a similar manner as proxying or OAuth 2.0 to ignore markdown line breaks as they are:

    RAML.Settings.marked.breaks = false

### Single View Mode

In *Single View* mode you will be able to see only documentation or try-it.

    <raml-console-loader src="path-to-raml" options="{ singleView: true }"></raml-console-loader>

### Theme Switcher

*Theme Switcher* can be disable if needed by adding the following setting:

    <raml-console-loader src="path-to-raml" options="{ disableThemeSwitcher: true }"></raml-console-loader>

### Disabling Client Generator

*Raml client generator* can be disable if needed by adding the following setting:

    <raml-console-loader src="path-to-raml" options="{ disableRamlClientGenerator: true }"></raml-console-loader>

### Resources collapsed

*Resources* can be collapsed if needed by adding the following setting:

    <raml-console-loader src="path-to-raml" options="{ resourcesCollapsed: true }"></raml-console-loader>

### Documentation collapsed

*Documentation* can be collapsed if needed by adding the following setting:

    <raml-console-loader src="path-to-raml" options="{ documentationCollapsed: true }"></raml-console-loader>

### Allowing Unsafe Markdown

*Unsafe Markdown* will be disable by default, if you want to allow unsafe content check the following example:

    <raml-console-loader src="path-to-raml" options="{ allowUnsafeMarkdown: true }"></raml-console-loader>    

### Disabling Try-it

*Try-it* will be enable by default, if you want to disable Try-it you can do that by adding the following setting:

    <raml-console-loader src="path-to-raml" options="{ disableTryIt: true }"></raml-console-loader>    

### Multiple Options

Multiple of the options above can be provided. The options need to be expressed in camelcase format:

    <raml-console-loader src="path-to-raml" options="{ disableRamlClientGenerator: true, disableTryIt: true }"></raml-console-loader> 

## Development

### Prerequisites

To run the console, you'll need the following:

* [Node JS](http://nodejs.org/)
* [NPM](https://npmjs.org/)
* [Ruby](https://www.ruby-lang.org)

### First Time Setup

1. Install Sass - `gem install sass`
1. Install grunt-cli globally - `npm install -g grunt-cli`
1. Install bower globally - `npm install -g bower`
1. Install the console's NPM packages - `npm install`
1. Install the console's Bower packages - `bower install`

### Running the server

    $ grunt
    $ open http://localhost:9000

## Testing

### Prerequisites

To run tests, you'll need the following:

* [Node JS](http://nodejs.org/)
* [NPM](https://npmjs.org/)
* [Protractor](http://angular.github.io/protractor)
* [Ruby](https://www.ruby-lang.org)

### First Time Setup

1. Install Sass - `gem install sass`
1. Install grunt-cli globally - `npm install -g grunt-cli`
1. Install protractor globally - `npm install -g protractor`
1. Install the console's NPM packages - `npm install`
1. Run  `node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update`

### Running Tests

    $ grunt regression

## Contributor's Agreement

To contribute source code to this repository, please read our [contributor's agreement](http://www.mulesoft.org/legal/contributor-agreement.html), and then execute it by running this notebook and following the instructions: https://api-notebook.anypoint.mulesoft.com/notebooks/#380297ed0e474010ff43
