beforeEach(function() {
  this.addMatchers({
    toHaveOauthParam: function(name, value) {
      var authHeader = this.actual.toOptions().headers.Authorization;

      var params = authHeader.replace(/^OAuth /, '').split(', ')
        .reduce(function(accum, param) {
          var keyVal = param.split('=');
          accum[keyVal[0]] = keyVal[1].replace(/^"(.*)"$/, '$1');
          return accum
        }, {});

      this.message = function () {
        var str = "Expected " + authHeader + " to contain OAuth parameter '" + name + "'";
        if (value !== undefined) {
          str += " with value '" + value + "'";
        }
        return str;
      }

      return params[name] && (value === undefined || params[name] === value);
    }
  });
});
