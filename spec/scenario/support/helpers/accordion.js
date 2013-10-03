(function() {
  global.openResource = function(index) {
    var selector = protractor.By.css('[role="resource"]:nth-child(' + index + ')');
    var resource = ptor.findElement(selector);
    resource.findElement(protractor.By.css('.accordion-toggle')).click();

    return resource;
  };

  global.openMethod = function(index, resource) {
    var selector = protractor.By.css('[role="method"]:nth-child(' + index + ')');
    var method = resource.findElement(selector);
    method.findElement(protractor.By.css('.accordion-toggle')).click();

    return method;
  };

  global.openDocumentationTab = function(index, method) {
    var selector = protractor.By.css('.nav-tabs li:nth-child(' + index + ') a');
    method.findElement(selector).click();

    return method.findElement(protractor.By.css(".tab-pane.active"));
  };
})();
