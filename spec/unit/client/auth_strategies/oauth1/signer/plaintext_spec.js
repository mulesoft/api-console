describe("RAML.Client.AuthStrategies.Oauth1.Signer.Plaintext", function() {
  var token, request, credentials;

  beforeEach(function() {
    credentials = {
      consumerKey: 'consumer_key!',
      consumerSecret: 'secr=t'
    };
  });

  describe("signing a request", function() {
    describe("without a token or a token-secret", function() {
      beforeEach(function() {
        RAML.Settings.oauth1RedirectUri = 'http://client.example.com/cb?x=1';

        request = RAML.Client.Request.create('http://example.com', 'GET');

        token = new RAML.Client.AuthStrategies.Oauth1.Signer.Plaintext.Temporary(credentials);
        token.sign(request);
      });

      afterEach(function() {
        delete RAML.Settings.oauth1RedirectUri;
      });

      it('appends the consumer key to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_consumer_key', 'consumer_key%21');
      });

      it('appends the signature method to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_signature_method', 'PLAINTEXT');
      });

      it('appends the signature to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_signature', 'secr%253Dt%26');
      });

      it('appends the callback to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_callback', 'http%3A%2F%2Fclient.example.com%2Fcb%3Fx%3D1');
      });
    });

    describe("with a token, token-secret, and verifier", function() {
      beforeEach(function() {
        tokenCredentials = {
          token: 'token',
          verifier: 'verifier',
          tokenSecret: 'tokenSecret'
        };

        request = RAML.Client.Request.create('http://example.com', 'GET');
        token = new RAML.Client.AuthStrategies.Oauth1.Signer.Plaintext.Token(credentials, tokenCredentials);
        token.sign(request);
      });

      it('appends the consumer key to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_consumer_key', 'consumer_key%21');
      });

      it('appends the signature method to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_signature_method', 'PLAINTEXT');
      });

      it('appends the signature to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_signature', 'secr%253Dt%26tokenSecret');
      });

      it('appends the oauth token to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_token', 'token');
      });

      it('appends the oauth verifier to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_verifier', 'verifier');
      });
    });
  });
});
