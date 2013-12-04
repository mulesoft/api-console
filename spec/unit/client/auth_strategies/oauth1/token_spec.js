describe("RAML.Client.AuthStrategies.Oauth1.Token", function() {
  var tokenFactory, request, credentials, settings;

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

  describe("with a plaintext signature method", function() {
    beforeEach(function() {
      RAML.Settings.oauth1RedirectUri = 'http://client.example.com/cb?x=1'
      settings = { signatureMethod: 'PLAINTEXT' };

      credentials = {
        consumerKey: 'consumer_key!',
        consumerSecret: 'secr=t'
      };

      tokenFactory = RAML.Client.AuthStrategies.Oauth1.Token.createFactory(settings, credentials);
    });

    afterEach(function() {
      delete RAML.Settings.oauth1RedirectUri;
    });

    describe("signing a request", function() {
      describe("without a token or a token-secret", function() {
        beforeEach(function() {
          request = RAML.Client.Request.create('http://example.com', 'GET');
          tokenFactory().sign(request);
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
          temporaryCredentials = {
            token: 'token',
            verifier: 'verifier',
            tokenSecret: 'tokenSecret'
          };

          request = RAML.Client.Request.create('http://example.com', 'GET');
          tokenFactory(temporaryCredentials).sign(request);
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

  describe("with a HMAC-SHA1 signature method", function() {
    var cryptoJSStub, cryptoHash;

    beforeEach(function() {
      settings = { signatureMethod: 'HMAC-SHA1' };

      cryptoHash = jasmine.createSpyObj('hash', ['toString'])
      cryptoHash.toString.andReturn('HMAC-SHA1-result');

      cryptoJSStub = spyOn(CryptoJS, 'HmacSHA1').andReturn(cryptoHash);

      credentials = {
        consumerKey: 'consumer_key!',
        consumerSecret: 'secr=t'
      };

      tokenFactory = RAML.Client.AuthStrategies.Oauth1.Token.createFactory(settings, credentials);
    });

    describe("signing a request", function() {
      describe("by default", function() {
        beforeEach(function() {
          spyOn(Date, 'now').andReturn(1001);
          request = RAML.Client.Request.create('http://example.com', 'POST');
          tokenFactory().sign(request);
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
            'b5': '=%3D',
            'a3': 'a',
            'c@': '',
            'a2': 'r b'
          });
          request.data({
            'c2': '',
            'a3': '2 q'
          });
          request.header('Content-Type', 'application/x-www-form-urlencoded');

          credentials = {
            consumerKey: '9djdj82h48djs9d2',
            consumerSecret: 'consumerSecret'
          }
          tokenFactory = RAML.Client.AuthStrategies.Oauth1.Token.createFactory(settings, credentials);

          tokenFactory({ token: 'kkk9d7dh3k39sjv7', tokenSecret: 'tokenSecret'}).sign(request);
        });

        it('passes the appropriate string to HmacSHA1', function() {
          var data = 'POST&http%3A%2F%2Fexample.com%2Frequest&a2%3Dr%2520b%26a3%3D2%2520q%26a3%3Da%26b5%3D%253D%25253D%26c%2540%3D%26c2%3D%26oauth_consumer_key%3D9djdj82h48djs9d2%26oauth_nonce%3D7d8f3e4a%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D137131201%26oauth_token%3Dkkk9d7dh3k39sjv7%26oauth_version%3D1.0';
          expect(cryptoJSStub).toHaveBeenCalledWith(data, 'consumerSecret&tokenSecret');
        });
      })
    });

    // testing a private method, feel free to delete if they cause pain during refactor
    describe("encoding a URI", function() {
      describe("by default", function() {
        it("does not include the port", function() {
          var result = tokenFactory().encodeURI("https://example.com/")

          expect(result).toEqual('https%3A%2F%2Fexample.com%2F')
        });

        it("downcases host and scheme", function() {
          var result = tokenFactory().encodeURI("HTTPS://EXAMPLE.COM/")

          expect(result).toEqual('https%3A%2F%2Fexample.com%2F')
        });
      });

      describe("with a proxy", function() {
        beforeEach(function() {
           RAML.Settings.proxy = "http://myproxy.com/proxy/";
        });

        afterEach(function() {
          delete RAML.Settings.proxy;
        });

        it('strips the proxy when encoding the URI', function() {
          var result = tokenFactory().encodeURI(RAML.Settings.proxy + "https://example.com/")
          expect(result).toEqual('https%3A%2F%2Fexample.com%2F')

        });
      });


      describe("with a standard port", function() {
        it("does not include the non-ssl port", function() {
          var result = tokenFactory().encodeURI("http://example.com:80/")

          expect(result).toEqual('http%3A%2F%2Fexample.com%2F')
        });

        it("does not include the ssl port", function() {
          var result = tokenFactory().encodeURI("https://example.com:443/")

          expect(result).toEqual('https%3A%2F%2Fexample.com%2F')
        });
      });

      describe("with a non-standard port", function() {
        it("includes the port", function() {
          var result = tokenFactory().encodeURI("https://example.com:442/")

          expect(result).toEqual('https%3A%2F%2Fexample.com%3A442%2F')
        });
      });
    });

    // testing a private method, feel free to delete if they cause pain during refactor
    describe("encoding parameters", function() {
      var request;

      beforeEach(function() {
        request = RAML.Client.Request.create('http://example.com', 'GET');
      });

      it("encodes the name and value of each parameter", function() {
        request.queryParams({ 'aQu=ryParam': 'aV&lue' });
        var result = tokenFactory().encodeParameters(request);
        expect(result).toMatch('aQu%3DryParam=aV%26lue');
      });

      it("sorts them in ascending byte value ordering", function() {
        request.queryParams({ 'c': '3', 'e': '5', 'a': '1', 'd': '4', 'b': '2' });
        var result = tokenFactory().encodeParameters(request);
        expect(result).toMatch('a=1&b=2&c=3&d=4&e=5');
      });

      it("breaks sorting ties by parameter value", function() {
        request.header('Content-Type', 'application/x-www-form-urlencoded');
        request.queryParams({ 'c': '3', 'e': '5', 'a': '1', 'd': '4', 'b': '2', 'a b': 'percent' });
        request.data({ 'c': '03', 'e': '05', 'a': '01', 'd': '04', 'b': '02' });

        var result = tokenFactory().encodeParameters(request);
        expect(result).toMatch('a=01&a=1&a%20b=percent&b=02&b=2&c=03&c=3&d=04&d=4&e=05&e=5');
      });

      it("includes OAuth 'Authorization' parameters", function() {
        var oauthParameters = {
          oauth_whocares: 'done'
        }

        var result = tokenFactory().encodeParameters(request, oauthParameters);
        expect(result).toMatch(/^oauth_whocares=done$/);
      });

      it("includes single-part form body parameters", function() {
        request.header('Content-Type', 'application/x-www-form-urlencoded');
        request.data({ 'f%rm': 'p@ram' });

        var result = tokenFactory().encodeParameters(request);
        expect(result).toMatch('f%25rm=p%40ram');
      });

      it("does not include multipart form body parameters", function() {
        request.header('Content-Type', 'multipart/form-data');
        request.data({ 'f%rm': 'p@ram' });

        var result = tokenFactory().encodeParameters(request);
        expect(result).not.toMatch('f%25rm=p%40ram');
      });
    });

  });
});
