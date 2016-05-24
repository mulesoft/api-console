(function() {
  'use strict';

  var templateMatcher = /\{([^}]*)\}/g;

  function tokenize(template) {
    var tokens = template.split(templateMatcher);

    return tokens.filter(function(token) {
      return token.length > 0;
    });
  }

  function rendererFor(template, uriParameters, options) {
    return function renderer(context) {
      context = context || {};

      // Enforce request without URI parameters
      // requiredParameters.forEach(function(name) {
      //   if (!context[name]) {
      //     throw new Error('Missing required uri parameter: ' + name);
      //   }
      // });

      var templated = template.replace(templateMatcher, function(match, parameterName) {
        if (context[parameterName]) {
          if (typeof context[parameterName][0] !== 'object') {
            return context[parameterName];
          }
          var tempValue = JSON.stringify(
            RAML.Inspector.Properties.cleanupPropertyValue(context[parameterName][0]));

          if (options.encodeURIComponent) {
            tempValue = encodeURIComponent(tempValue);
          }

          return tempValue;
        }
        return '';
      });

      return templated;
    };
  }

  RAML.Client.ParameterizedString = function(template, uriParameters, options) {
    options = angular.extend({ parameterValues: {} }, options);
    template = template.replace(templateMatcher, function(match, parameterName) {
      if (options.parameterValues[parameterName]) {
        return options.parameterValues[parameterName];
      }
      return '{' + parameterName + '}';
    });

    this.parameters = uriParameters;
    this.templated = Object.keys(this.parameters || {}).length > 0;
    this.tokens = tokenize(template);
    this.render = rendererFor(template, uriParameters, options);
    this.toString = function() { return template; };
  };
})();
