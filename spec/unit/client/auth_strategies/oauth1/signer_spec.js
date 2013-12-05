describe("RAML.Client.AuthStrategies.Oauth1.Signer", function() {
  var createFactory = RAML.Client.AuthStrategies.Oauth1.Signer.createFactory;
  var Signer = RAML.Client.AuthStrategies.Oauth1.Signer;

  describe("createFactory", function() {
    describe('with no token credentials', function() {
      describe("by default", function() {
        it('returns a factory that creates an HMAC token', function() {
          var token = createFactory()();

          expect(token instanceof Signer.Hmac.Temporary).toBe(true);
        });
      });

      describe("with a plaintext signature method", function() {
        it('returns a factory that creates an plaintext token', function() {
          var token = createFactory({ signatureMethod: 'PLAINTEXT' })();

          expect(token instanceof Signer.Plaintext.Temporary).toBe(true);
        });
      });
    });

    describe('with token credentials', function() {
      describe("by default", function() {
        it('returns a factory that creates an HMAC token', function() {
          var token = createFactory()({ token: 'foo' });

          expect(token instanceof Signer.Hmac.Token).toBe(true);
        });
      });

      describe("with a plaintext signature method", function() {
        it('returns a factory that creates an plaintext token', function() {
          var token = createFactory({ signatureMethod: 'PLAINTEXT' })({ token: 'foo' });

          expect(token instanceof Signer.Plaintext.Token).toBe(true);
        });
      });
    });
  });
});
