describe("RAML.Client.AuthStrategies.Oauth1.Signer.Hmac", function() {
  var token, request, credentials;

  beforeEach(function() {
    credentials = {
      consumerKey: 'consumer_key!',
      consumerSecret: 'secr=t'
    };
  });

  describe("signing a request", function() {
    var cryptoJSStub;

    beforeEach(function() {
      var cryptoHash = jasmine.createSpyObj('hash', ['toString'])
      cryptoHash.toString.andReturn('HMAC-SHA1-result');
      cryptoJSStub = spyOn(CryptoJS, 'HmacSHA1').andReturn(cryptoHash);
    });

    describe("by default", function() {
      beforeEach(function() {
        spyOn(Date, 'now').andReturn(1001);
        request = RAML.Client.Request.create('http://example.com', 'POST');

        token = new RAML.Client.AuthStrategies.Oauth1.Signer.Hmac.Temporary(credentials);
        token.sign(request);
      });

      it('appends the HMAC-SHA1 signature to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_signature', 'HMAC-SHA1-result');
      });

      it('appends the oauth_nonce to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_nonce');
      });

      it('appends the oauth_timestamp to the oauth header', function() {
        expect(request).toHaveOauthParam('oauth_timestamp', '1');
      });
    });

    describe("using the example from RFC5849", function() {
      // http://tools.ietf.org/html/rfc5849#section-3.4.1.1

      beforeEach(function() {
        spyOn(Date, 'now').andReturn(137131201000);

        var wordArray = jasmine.createSpyObj('wordArray', ['toString']);
        wordArray.toString.andReturn('7d8f3e4a');
        spyOn(CryptoJS.lib.WordArray, 'random').andReturn(wordArray);

        request = RAML.Client.Request.create('http://example.com/request', 'POST');

        request.queryParams({
          'b5': ['=%3D'],
          'a3': ['a'],
          'c@': [''],
          'a2': ['r b']
        });
        request.data({
          'c2': [''],
          'a3': ['2 q']
        });
        request.header('Content-Type', 'application/x-www-form-urlencoded');

        credentials = {
          consumerKey: '9djdj82h48djs9d2',
          consumerSecret: 'consumerSecret'
        }
        tokenCredentials = {
          token: 'kkk9d7dh3k39sjv7',
          tokenSecret: 'tokenSecret'
        }
        token = new RAML.Client.AuthStrategies.Oauth1.Signer.Hmac.Token(credentials, tokenCredentials);
        token.sign(request);
      });

      it('passes the appropriate string to HmacSHA1', function() {
        var data = 'POST&http%3A%2F%2Fexample.com%2Frequest&a2%3Dr%2520b%26a3%3D2%2520q%26a3%3Da%26b5%3D%253D%25253D%26c%2540%3D%26c2%3D%26oauth_consumer_key%3D9djdj82h48djs9d2%26oauth_nonce%3D7d8f3e4a%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D137131201%26oauth_token%3Dkkk9d7dh3k39sjv7%26oauth_version%3D1.0';
        expect(cryptoJSStub).toHaveBeenCalledWith(data, 'consumerSecret&tokenSecret');
      });
    })
  });

  // testing a private method, feel free to delete if they cause pain during refactor
  describe("encoding a URI", function() {
    var encodeURI;

    beforeEach(function() {
      encodeURI = RAML.Client.AuthStrategies.Oauth1.Signer.Hmac.encodeURI;
    });

    describe("by default", function() {
      it("does not include the port", function() {
        var result = encodeURI("https://example.com/")

        expect(result).toEqual('https%3A%2F%2Fexample.com%2F')
      });

      it("downcases host and scheme", function() {
        var result = encodeURI("HTTPS://EXAMPLE.COM/")

        expect(result).toEqual('https%3A%2F%2Fexample.com%2F')
      });
    });

    describe("with a standard port", function() {
      it("does not include the non-ssl port", function() {
        var result = encodeURI("http://example.com:80/")

        expect(result).toEqual('http%3A%2F%2Fexample.com%2F')
      });

      it("does not include the ssl port", function() {
        var result = encodeURI("https://example.com:443/")

        expect(result).toEqual('https%3A%2F%2Fexample.com%2F')
      });
    });

    describe("with a non-standard port", function() {
      it("includes the port", function() {
        var result = encodeURI("https://example.com:442/")

        expect(result).toEqual('https%3A%2F%2Fexample.com%3A442%2F')
      });
    });
  });

  // testing a private method, feel free to delete if they cause pain during refactor
  describe("encoding parameters", function() {
    var request, encodeParameters;

    beforeEach(function() {
      encodeParameters = RAML.Client.AuthStrategies.Oauth1.Signer.Hmac.encodeParameters;
      request = RAML.Client.Request.create('http://example.com', 'GET');
    });

    it("encodes the name and value of each parameter", function() {
      request.queryParams({ 'aQu=ryParam': 'aV&lue' });
      var result = encodeParameters(request);
      expect(result).toMatch('aQu%3DryParam=aV%26lue');
    });

    it("sorts them in ascending byte value ordering", function() {
      request.queryParams({ 'c': ['3'], 'e': ['5'], 'a': ['1'], 'd': ['4'], 'b': ['2'] });
      var result = encodeParameters(request);
      expect(result).toMatch('a=1&b=2&c=3&d=4&e=5');
    });

    it("breaks sorting ties by parameter value", function() {
      request.header('Content-Type', 'application/x-www-form-urlencoded');
      request.queryParams({ 'c': ['3'], 'e': ['5'], 'a': ['1'], 'd': ['4'], 'b': ['2'], 'a b': ['percent'] });
      request.data({ 'c': ['03'], 'e': ['05'], 'a': ['01'], 'd': ['04'], 'b': ['02'] });

      var result = encodeParameters(request);
      expect(result).toMatch('a=01&a=1&a%20b=percent&b=02&b=2&c=03&c=3&d=04&d=4&e=05&e=5');
    });

    it("includes OAuth 'Authorization' parameters", function() {
      var oauthParameters = {
        oauth_whocares: 'done'
      }

      var result = encodeParameters(request, oauthParameters);
      expect(result).toMatch(/^oauth_whocares=done$/);
    });

    it("includes single-part form body parameters", function() {
      request.header('Content-Type', 'application/x-www-form-urlencoded');
      request.data({ 'f%rm': ['p@ram'] });

      var result = encodeParameters(request);
      expect(result).toMatch('f%25rm=p%40ram');
    });

    it("does not include multipart form body parameters", function() {
      request.header('Content-Type', 'multipart/form-data');
      request.data({ 'f%rm': ['p@ram'] });

      var result = encodeParameters(request);
      expect(result).not.toMatch('f%25rm=p%40ram');
    });
  });
});
