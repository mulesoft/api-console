(function() {
  /* jshint camelcase: false */
  'use strict';

  var generateTemporaryCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Token.generateTemporaryCredentialParameters,
      generateTokenCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Token.generateTokenCredentialParameters;

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  function rfc3986Encode(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, window.escape).replace(/\*/g, '%2A');
  }

  function uriWithoutProxy(url) {
    if (RAML.Settings.proxy) {
      url = url.replace(RAML.Settings.proxy, '');
    }
    return url;
  }

  var Hmac = {
    constructHmacText: function(request, oauthParams) {
      var options = request.toOptions();

      return [
        options.type.toUpperCase(),
        this.encodeURI(options.url),
        rfc3986Encode(this.encodeParameters(request, oauthParams))
      ].join('&');
    },

    encodeURI: function(uri) {
      var parser = document.createElement('a');
      parser.href = uriWithoutProxy(uri);

      var hostname = '';
      if (parser.protocol === 'https:' && parser.port === 443 || parser.protocol === 'http:' && parser.port === 80) {
        hostname = parser.hostname.toLowerCase();
      } else {
        hostname = parser.host.toLowerCase();
      }

      return rfc3986Encode(parser.protocol + '//' + hostname + parser.pathname);
    },

    encodeParameters: function(request, oauthParameters) {
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

      for (var oauthKey in oauthParameters) {
        result.push([rfc3986Encode(oauthKey), rfc3986Encode(oauthParameters[oauthKey])]);
      }

      result.sort(function(a, b) {
        return (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]));
      });

      return result.map(function(tuple) { return tuple.join('='); }).join('&');
    }
  };

  function generateSignature(params, request, key) {
    params.oauth_signature_method = 'HMAC-SHA1';
    params.oauth_timestamp = Math.floor(Date.now() / 1000);
    params.oauth_nonce = CryptoJS.lib.WordArray.random(16).toString();

    var data = Hmac.constructHmacText(request, params);
    var hash = CryptoJS.HmacSHA1(data, key);
    params.oauth_signature = hash.toString(CryptoJS.enc.Base64);
  }

  function setRequestHeader(params, request) {
    var header = Object.keys(params).map(function(key) {
      return key + '="' + rfc3986Encode(params[key]) + '"';
    }).join(', ');

    request.header('Authorization', 'OAuth ' + header);
  }

  Hmac.Temporary = function(consumerCredentials) {
    this.consumerCredentials = consumerCredentials;
  };

  Hmac.Temporary.prototype.sign = function(request) {
    var params = generateTemporaryCredentialParameters(this.consumerCredentials);
    var key = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&';

    generateSignature(params, request, key);
    setRequestHeader(params, request);
  };

  Hmac.Token = function(consumerCredentials, tokenCredentials) {
    this.consumerCredentials = consumerCredentials;
    this.tokenCredentials = tokenCredentials;
  };

  Hmac.Token.prototype.sign = function(request) {
    var params = generateTokenCredentialParameters(this.consumerCredentials, this.tokenCredentials);
    var key = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&' + rfc3986Encode(this.tokenCredentials.tokenSecret);

    generateSignature(params, request, key);
    setRequestHeader(params, request);
  };


  RAML.Client.AuthStrategies.Oauth1.Token.Hmac = Hmac;
})();
