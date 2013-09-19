var fs = require('fs'),
  path = require('path'),
  util = require('util');

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

  it('renders an overview of each API resource', function() {
    ptor = protractor.getInstance();

    ptor.get('http://localhost:9000');
    ptor.findElement(protractor.By.css("input[type=text]")).sendKeys(fixturePath);
    ptor.findElement(protractor.By.css("button")).click()

    var body = ptor.findElement(protractor.By.css("body"));
    expect(body.getText()).toMatch(/Example API/);

    var resources = ptor.findElements(protractor.By.css('[role="api-console"] [role="resource"]'));
    expect(resources).toHaveLength(3);
  });
});
