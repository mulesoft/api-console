# RAML Console

[![Build Status](https://travis-ci.org/mulesoft/api-console.png)](https://travis-ci.org/mulesoft/api-console)

An API console for [RAML](http://raml.org) (Restful Api Modeling Language) documents. The RAML Console allows browsing of API documentation and in-browser testing of API methods.

## Configuration

A proxy for Try It can be provided after loading the console JavaScript. For example:

    RAML.Settings.proxy = 'http://www.someproxy.com/somepath/'

Given the above, trying a GET to `http://www.someapi.com/resource` would get

    http://www.someproxy.com/somepath/http://www.someapi.com/resource

A redirect URI for OAuth 2 can be provided in a similar manner:

    RAML.Settings.oauth2RedirectUri = 'http://www.raml.org/console/'

Given the above, OAuth 2 requests would redirect back to that URL.

## Development

### Prerequisites

To run the console, you'll need the following:

* [Node JS](http://nodejs.org/)
* [NPM](https://npmjs.org/)
* [PhantomJS](http://phantomjs.org/) for headless testing
* Firefox installed (for in-browser scenario tests)

### First Time Setup

1. Install the console's packages - `npm install .`
2. Install grunt-cli globally - `npm install grunt-cli -g`

### Running the server

    $ grunt server
    $ open http://localhost:9000

### Testing

To run the tests, use grunt:

    $ grunt test

To run only a portion of the tests, you can use

    $ grunt spec:unit
    $ grunt spec:integration
    $ grunt scenario

The scenario tests use angular's [protractor](https://github.com/angular/protractor) framework, and run via selenium in firefox. Selenium is automatically downloaded, but you'll need firefox to be installed.

