var fs = require('fs'),
  path = require('path'),
  util = require('util');

var webdriver = require('selenium-webdriver');

describe('accordion view of API', function() {
  var ptor,
    raml = [
      "#%RAML 0.2",
      "---",
      "title: Example API",
      "baseUri: #{test_api_uri}",
      "traits:",
      "  - secured:",
      "      description: Some requests require authentication",
      "resourceTypes:",
      "  - collection:",
      "      description: bunk",
      "/resource:",
      "  get: !!null",
      "  /{resourceId}:",
      "    get: !!null",
      "    post: !!null",
      "/another/resource:",
      "  type: collection",
      "  is: [secured]",
      "  get: !!null"].join('\n');


  var fixturePath = fixturizeRaml(raml);

  beforeEach(function() {
    ptor = protractor.getInstance();

    ptor.get('http://localhost:9001');
    ptor.findElement(protractor.By.css("input[type=text]")).sendKeys(fixturePath);
    ptor.findElement(protractor.By.css("input[type=submit]")).click();
  });

  var getResources = function() {
    return ptor.findElements(protractor.By.css('[role="api-console"] [role="resource"]'));
  }

  it('renders an overview of each API resource', function() {
    var body = ptor.findElement(protractor.By.css("body"));
    expect(body.getText()).toMatch(/Example API/);

    expect(getResources()).toHaveLength(3);
  });

  it('shows each method available on individual resources', function() {
    getResources().then(function(resources) {
      var methodsPromise = resources[0].findElements(protractor.By.css('[role="methods"] li'))
      expect(methodsPromise).toHaveLength(1);

      methodsPromise = resources[1].findElements(protractor.By.css('[role="methods"] li'))
      expect(methodsPromise).toHaveLength(2);
      methodsPromise.then(function(methods) {
        expect(methods[0].getText()).toMatch(/^get$/i);
        expect(methods[1].getText()).toMatch(/^post$/i);
      });

      methodsPromise = resources[2].findElements(protractor.By.css('[role="methods"] li'))
      expect(methodsPromise).toHaveLength(1);
    });
  });

  it('shows the traits that are associated with the resource', function() {
    getResources().then(function(resources) {
      var traitsPromise = resources[2].findElements(protractor.By.css('[role="traits"] li'))
      expect(traitsPromise).toHaveLength(1);
      traitsPromise.then(function(traits) {
        expect(traits[0].getText()).toEqual('secured');
      });
    });
  });

  it('shows the type that is associated with the resource', function() {
    getResources().then(function(resources) {
      var resourceTypesPromise = resources[2].findElements(protractor.By.css('[role="resourceType"]'))
      expect(resourceTypesPromise).toHaveLength(1);
      resourceTypesPromise.then(function(resourceType) {
        expect(resourceType[0].getText()).toMatch(/^type: collection$/i);
      });
    });
  });
});
