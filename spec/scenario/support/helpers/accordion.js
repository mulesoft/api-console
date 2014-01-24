(function() {
  global.toggleResource = function(index) {
    var resource;
    if (index === 1) {
      resource = ptor.$('[role="resource"]');
    } else {
      resource = ptor.$('[collapsible-content] [role="resource"]:nth-of-type(' + (index-1) + ')');
    }
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
