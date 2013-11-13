'use strict';

(function() {
  var Client = function(parsed) {
    this.securitySchemes = parsed.securitySchemes;
  };

  Client.prototype.securityScheme = function(name) {
    var result;

    this.securitySchemes.forEach(function(scheme) {
      if (scheme[name]) {
        result = scheme[name];
      }
    });

    if (result !== undefined) {
      return result;
    } else {
      throw new Error('Undefined Security Scheme: ' + name);
    }
  };

  RAML.Client = {
    create: function(parsed) {
      return new Client(parsed);
    },

    createPathSegment: function(resourceRAML) {
      return new RAML.Client.ParameterizedString(resourceRAML.relativeUri, resourceRAML.uriParameters);
    }
  };
})();
