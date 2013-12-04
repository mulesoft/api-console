describe("RAML.Client.AuthStrategies.Oauth1.Token", function() {

  describe("createFactory", function() {
    describe("by default", function() {

      it('returns a factory that creates an HMAC token', function() {
        var token = RAML.Client.AuthStrategies.Oauth1.Token.createFactory()();

        expect(token instanceof RAML.Client.AuthStrategies.Oauth1.Token.Hmac).toBe(true);
      });
    });

    describe("with a plaintext signature method", function() {
      it('returns a factory that creates an plaintext token', function() {
        var token = RAML.Client.AuthStrategies.Oauth1.Token.createFactory({ signatureMethod: 'PLAINTEXT' })();

        expect(token instanceof RAML.Client.AuthStrategies.Oauth1.Token.Plaintext).toBe(true);
      });
    });

  });

});
