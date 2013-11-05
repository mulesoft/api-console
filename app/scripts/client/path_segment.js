(function() {
  'use strict';

  var templateMatcher = /\{([^}]*)\}/g;

  function rendererFor(template) {
    return function renderer(context) {
      return template.replace(templateMatcher, function(match, parameterName) {
        return context[parameterName] || '';
      });
    };
  }

  var PathSegment = function(template, uriParameters) {
    var name = template.slice(1);

    this.name = name.replace(templateMatcher, '$1');
    this.templated = this.name !== name;
    this.parameters = uriParameters;
    this.render = rendererFor(template);
  };

  RAML.Client.PathSegment = {
    fromRAML: function(raml) {
      return new PathSegment(raml.relativeUri, raml.uriParameters);
    }
  };
})();
