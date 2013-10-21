describe('RAML.Client.AuthStrategies.anonymous', function() {
  var scheme, keychain;

  describe("authenticating", function() {
    var token;

    beforeEach(function() {
      scheme = RAML.Client.AuthStrategies.anonymous(keychain);

      token = undefined;

      scheme.authenticate().then(function(result) {
        token = result;
      });
    });

    it("immediately yields", function() {
      expect(token).toBeDefined();
    });

    it("yields a token", function() {
      expect(typeof token.sign).toBe('function');
    });
  });
});
