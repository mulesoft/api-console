(function() {
  global.toggleResource = function(index) {
    var resource = ptor.$('[role="resource"]:nth-of-type(' + index + ')');
    resource.$('.accordion-toggle').click();

    return resource;
  };

  global.openMethod = function(index, resource) {
    var method = resource.$('[role="method"]:nth-child(' + index + ')');
    method.$('.accordion-toggle').click();

    return method;
  };

  global.openDocumentationTab = function(index, method) {
    method.$('.nav-tabs li:nth-child(' + index + ') a').click();

    return method.$('.tab-pane.active');
  };
})();
