# RAML Console

An API console for RAML documents. The RAML Console allows browsing of API documentation and in-browser testing of API methods.

# Prerequisites

To run the console, you'll need the following:

* [Node JS](http://nodejs.org/)
* [NPM](https://npmjs.org/)
* [PhantomJS](http://phantomjs.org/) for headless testing
* Firefox installed (for in-browser scenario tests)

# First Time Setup

1. Install the console's packages - `npm install .`
2. Install grunt-cli globally - `npm install grunt-cli -g`

# Running the server

    $ grunt server
    $ open http://localhost:9000

# Testing

To run the tests, use grunt:

    $ grunt test

To run only a portion of the tests, you can use

    $ grunt spec:unit
    $ grunt spec:integration
    $ grunt scenario

The scenario tests use angular's [protractor](https://github.com/angular/protractor) framework, and run via selenium in firefox. Selenium is automatically downloaded, but you'll need firefox to be installed.

# Continuous Integration and Acceptance

Tests for the console are running on [Travis CI](https://magnum.travis-ci.com/restful-api-modeling-lang/console). 

Acceptance URLs:
* [Standalone](https://54.227.235.249/artifacts/console/master/index.acceptance.html)
* [Integrated with Editor](https://54.227.235.249/artifacts/editor/chores/remove-console-dependencies/)
