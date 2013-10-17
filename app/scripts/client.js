(function() {
  var Client = function(parsed) {
    this.securitySchemes = parsed.securitySchemes;
  }

  Client.prototype.securityScheme = function(name) {
    var result = undefined;

    this.securitySchemes.forEach(function(scheme) {
      if (scheme[name]) {
        result = scheme[name];
      }
    });

    if (result !== undefined) {
      return result;
    } else {
      throw new Error("Undefined Security Scheme: " + name);
    }
  };

  RAML.Client = {
    AuthStrategies: {},
    create: function(parsed) {
      return new Client(parsed);
    }
  };
})();
