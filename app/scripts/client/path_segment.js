(function() {
  'use strict';

  var templateMatcher = /\{([^}]*)\}/g;

  function rendererFor(template, uriParameters) {
    var requiredParameters = Object.keys(uriParameters || {}).filter(function(name) {
      return uriParameters[name].required;
    });

    return function renderer(context) {
      context = context || {};

      requiredParameters.forEach(function(name) {
        console.log(name);
        if (!context[name]) {
          throw new Error('Missing required uri parameter: ' + name);
        }
      });

      var templated = template.replace(templateMatcher, function(match, parameterName) {
        return context[parameterName] || '';
      });

      return templated;
    };
  }

  var PathSegment = function(template, uriParameters) {
    var name = template.slice(1);

    this.name = name.replace(templateMatcher, '$1');
    this.templated = this.name !== name;
    this.parameters = uriParameters;
    this.render = rendererFor(template, uriParameters);
  };

  RAML.Client.PathSegment = {
    fromRAML: function(raml) {
      return new PathSegment(raml.relativeUri, raml.uriParameters);
    }
  };
})();
