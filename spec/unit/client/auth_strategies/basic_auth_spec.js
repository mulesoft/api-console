describe('RAML.Client.AuthStrategies.basicAuth', function() {
  var scheme, keychain;

  describe("authenticating", function() {
    var token;

    beforeEach(function() {
      keychain = {
        username: "user",
        password: "pass"
      }
      scheme = new RAML.Client.AuthStrategies.Basic(null, keychain);

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

    describe("and signing a request", function() {
      var request;

      beforeEach(function() {
        request = jasmine.createSpyObj('request', ['header']);
        token.sign(request);
      });

      it('adds the authorization header', function() {
        expect(request.header).toHaveBeenCalledWith('Authorization', 'Basic dXNlcjpwYXNz');
      });
    });
  });
});
