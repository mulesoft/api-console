(function() {
  var generateDefaultUriProperties = function(name) {
    return {
      type: "string",
      required: true,
      displayName: name
    };
  };

  var verifyParameter = function(parameter, properties) {
    if (!parameter) { return false; }
    properties = properties || {};

    var satisfied = true;
    for (var property in properties) {
      if (parameter[property] !== properties[property]) {
        satisfied = false;
      }
    }

    return satisfied;
  };

  window.verifyUriParameter = function(name, parameter, expectedProperties) {
    var properties = extend({}, generateDefaultUriProperties(name), expectedProperties);
    return verifyParameter(parameter, properties);
  }
})();
