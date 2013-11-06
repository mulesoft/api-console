(function() {
  'use strict';

  var templateMatcher = /\{([^}]*)\}/g;

  function tokenize(template) {
    var tokens = template.slice(1).split(templateMatcher);

    return tokens.filter(function(token) {
      return token.length > 0;
    });
  }

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
    this.tokens = tokenize(template);
    this.render = rendererFor(template, uriParameters);
    this.toString = function() { return template; };
  };

  RAML.Client.PathSegment = {
    fromRAML: function(raml) {
      return new PathSegment(raml.relativeUri, raml.uriParameters);
    }
  };
})();
