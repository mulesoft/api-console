(function() {
  /* jshint camelcase: false */
  'use strict';

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  function rfc3986Encode(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, window.escape).replace(/\*/g, '%2A');
  }

  var Token = function(settings, consumerCredentials, tokenCredentials) {
    this.signatureMethod = settings.signatureMethod || 'HMAC-SHA1';
    this.oauthParameters = this.calculateParameters(consumerCredentials, tokenCredentials);
    this.signature = rfc3986Encode(consumerCredentials.consumerSecret) + '&';
    if (tokenCredentials) {
      this.signature += rfc3986Encode(tokenCredentials.tokenSecret);
    }
  };

  Token.prototype.constructHmacText = function(request) {
    var options = request.toOptions();

    return [
      options.type.toUpperCase(),
      this.encodeURI(options.url),
      rfc3986Encode(this.encodeParameters(request))
    ].join('&');
  };

  function uriWithoutProxy(url) {
    if (RAML.Settings.proxy) {
      url = url.replace(RAML.Settings.proxy, '');
    }

    return url;
  }

  Token.prototype.encodeURI = function(uri) {
    var parser = document.createElement('a');
    parser.href = uriWithoutProxy(uri);

    var hostname = '';
    if (parser.protocol === 'https:' && parser.port === 443 || parser.protocol === 'http:' && parser.port === 80) {
      hostname = parser.hostname.toLowerCase();
    } else {
      hostname = parser.host.toLowerCase();
    }

    return rfc3986Encode(parser.protocol + '//' + hostname + parser.pathname);
  };

  Token.prototype.encodeParameters = function(request) {
    var result = [];
    var params = request.queryParams();
    var formParams = {};
    if (request.toOptions().contentType === 'application/x-www-form-urlencoded') {
      formParams = request.data();
    }

    for (var key in params) {
      result.push([rfc3986Encode(key), rfc3986Encode(params[key])]);
    }

    for (var formKey in formParams) {
      result.push([rfc3986Encode(formKey), rfc3986Encode(formParams[formKey])]);
    }

    for (var oauthKey in this.oauthParameters) {
      result.push([rfc3986Encode(oauthKey), rfc3986Encode(this.oauthParameters[oauthKey])]);
    }

    result.sort(function(a, b) {
      return (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]));
    });

    return result.map(function(tuple) { return tuple.join('='); }).join('&');
  };

  Token.prototype.calculateParameters = function(consumerCredentials, tokenCredentials) {
    var result = {
      oauth_signature_method: this.signatureMethod,
      oauth_consumer_key: consumerCredentials.consumerKey,
      oauth_version: '1.0'
    };

    if (tokenCredentials) {
      result.oauth_token = tokenCredentials.token;
      if (tokenCredentials.verifier) {
        result.oauth_verifier = tokenCredentials.verifier;
      }
    } else {
      if (RAML.Settings.oauth1RedirectUri) {
        result.oauth_callback = RAML.Settings.oauth1RedirectUri;
      }
    }

    if (this.signatureMethod === 'HMAC-SHA1') {
      result.oauth_timestamp = Math.floor(Date.now() / 1000);
      result.oauth_nonce = CryptoJS.lib.WordArray.random(16).toString();
    }

    return result;
  };

  Token.prototype.sign = function(request) {
    var params = this.oauthParameters;

    if (this.signatureMethod === 'HMAC-SHA1') {
      var data = this.constructHmacText(request);
      var hash = CryptoJS.HmacSHA1(data, this.signature);
      params.oauth_signature = hash.toString(CryptoJS.enc.Base64);
    } else {
      params.oauth_signature = this.signature;
    }

    var oauthParameterList = [
      'oauth_consumer_key',
      'oauth_signature_method',
      'oauth_signature',
      'oauth_token',
      'oauth_verifier',
      'oauth_callback',
      'oauth_timestamp',
      'oauth_nonce',
      'oauth_version'
    ].filter(function(parameter) {
      return params[parameter];
    }).map(function(parameter) {
      return parameter + '="' + rfc3986Encode(params[parameter]) + '"';
    });

    request.header('Authorization', 'OAuth ' + oauthParameterList.join(', '));
  };

  RAML.Client.AuthStrategies.Oauth1.Token = {
    createFactory: function(settings, consumerCredentials) {
      return function createToken(tokenCredentials) {
        return new Token(settings, consumerCredentials, tokenCredentials);
      };
    }
  };
})();
