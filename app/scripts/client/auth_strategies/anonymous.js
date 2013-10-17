(function() {
  var NO_OP_TOKEN = {
    sign: function() {}
  };

  RAML.Client.AuthStrategies.anonymous = function() {
    var strategy = {
      authenticate: function() {
        return {
          then: function(success) { success(NO_OP_TOKEN); }
        }
      }
    }

    return strategy;
  }
})();
