(function() {
  var base64 = RAML.Client.AuthStrategies.base64;

  var BasicAuthToken = function(credentials) {
    this.encoded = base64.encode(credentials.username + ":" + credentials.password);
  }

  BasicAuthToken.prototype.sign = function(request) {
    request.header('Authorization', 'Basic ' + this.encoded);
  };

  RAML.Client.AuthStrategies.basicAuth = function(credentials) {
    var strategy = {
      authenticate: function() {
        return {
          then: function(success) { success(new BasicAuthToken(credentials)); }
        }
      }
    }

    return strategy;
  }
})();
