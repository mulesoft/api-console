(function() {
  global.toggleResource = function(index) {
    var resource = ptor.$('[role="resource-placeholder"]:nth-of-type(' + index + ') [role="resource"]');

    resource.$('.accordion-toggle').click();

    return resource;
  };

  global.openMethod = function(index, resource) {
    var methodName = resource.$('[role="methods"] li:nth-child(' + index + ')');
    methodName.click();

    return resource.$('[role="method"]');
  };

  global.openDocumentationTab = function(index, method) {
    method.$('.nav-tabs li:nth-child(' + index + ') a').click();

    return method.$('.tab-pane.active');
  };
})();
