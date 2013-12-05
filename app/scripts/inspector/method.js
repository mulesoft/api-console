(function() {
  'use strict';

  function securitySchemesExtractor(securitySchemes) {
    securitySchemes = securitySchemes || [];

    return function() {
      var securedBy = this.securedBy || [],
          selectedSchemes = {};

      securedBy = securedBy.filter(function(name) {
        return name !== null && typeof name !== 'object';
      });

      securitySchemes.forEach(function(scheme) {
        securedBy.forEach(function(name) {
          if (scheme[name]) {
            selectedSchemes[name] = scheme[name];
          }
        });
      });

      return selectedSchemes;
    };
  }

  function allowsAnonymousAccess() {
    /*jshint validthis: true */
    var securedBy = this.securedBy || [null];
    return securedBy.some(function(name) { return name === null; });
  }

  var PLACEHOLDER = /\{\*\}/;
  function filterHeadersWithPlaceholders(headers) {
    var filtered = {};
    Object.keys(headers || {}).forEach(function(key) {
      if (!key.match(PLACEHOLDER)) {
        filtered[key] = headers[key];
      }
    });

    return filtered;
  }

  RAML.Inspector.Method = {
    create: function(raml, securitySchemes) {
      var method = RAML.Utils.clone(raml);

      method.securitySchemes = securitySchemesExtractor(securitySchemes);
      method.allowsAnonymousAccess = allowsAnonymousAccess;
      method.headers = filterHeadersWithPlaceholders(method.headers);
      return method;
    }
  };
})();
