'use strict';

(function() {
  var base64 = RAML.Client.AuthStrategies.base64;

  var Basic = function(scheme, credentials) {
    this.token = new Basic.Token(credentials);
  };

  Basic.prototype.authenticate = function() {
    var token = this.token;

    return {
      then: function(success) { success(token); }
    };
  };

  Basic.Token = function(credentials) {
    this.encoded = base64.encode(credentials.username + ':' + credentials.password);
  };

  Basic.Token.prototype.sign = function(request) {
    request.header('Authorization', 'Basic ' + this.encoded);
  };

  RAML.Client.AuthStrategies.Basic = Basic;
  RAML.Client.AuthStrategies.basicAuth = function(credentials) {
    return new Basic(null, credentials);
  };
})();
