RAML.Inspector = (function() {
  'use strict';

  var exports = {};

  var METHOD_ORDERING = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];

  function extractResources(basePathSegments, api, securitySchemes) {
    var resources = [], apiResources = api.resources || [];

    apiResources.forEach(function(resource) {
      var resourcePathSegments = basePathSegments.concat(RAML.Client.createPathSegment(resource));
      var overview = exports.resourceOverviewSource(resourcePathSegments, resource);

      overview.methods = overview.methods.map(function(method) {
        return RAML.Inspector.Method.create(method, securitySchemes);
      });


      resources.push(overview);

      if (resource.resources) {
        var extracted = extractResources(resourcePathSegments, resource, securitySchemes);
        extracted.forEach(function(resource) {
          resources.push(resource);
        });
      }
    });

    return resources;
  }

  function groupResources(resources) {
    var currentPrefix, resourceGroups = [];

    (resources || []).forEach(function(resource) {
      if (resource.pathSegments[0].toString().indexOf(currentPrefix) !== 0) {
        currentPrefix = resource.pathSegments[0].toString();
        resourceGroups.push([]);
      }
      resourceGroups[resourceGroups.length-1].push(resource);
    });

    return resourceGroups;
  }

  exports.resourceOverviewSource = function(pathSegments, resource) {
    var clone = RAML.Utils.clone(resource);

    clone.traits = resource.is;
    clone.resourceType = resource.type;
    clone.type = clone.is = undefined;
    clone.pathSegments = pathSegments;

    clone.methods = (resource.methods || []);

    clone.methods.sort(function(a, b) {
      var aOrder = METHOD_ORDERING.indexOf(a.method.toUpperCase());
      var bOrder = METHOD_ORDERING.indexOf(b.method.toUpperCase());

      return aOrder > bOrder ? 1 : -1;
    });

    clone.uriParametersForDocumentation = pathSegments
      .map(function(segment) { return segment.parameters; })
      .filter(function(params) { return !!params; })
      .reduce(function(accum, parameters) {
        for (var key in parameters) {
          var parameter = parameters[key];
          if (parameter) {
            parameter = (parameter instanceof Array) ? parameter : [ parameter ];
          }
          accum[key] = parameter;
        }
        return accum;
      }, {});

    clone.toString = function() {
      return this.pathSegments.map(function(segment) { return segment.toString(); }).join('');
    };

    return clone;
  };

  exports.create = function(api) {
    if (api.baseUri) {
      api.baseUri = RAML.Client.createBaseUri(api);
    }

    api.resources = extractResources([], api, api.securitySchemes);
    api.resourceGroups = groupResources(api.resources);

    return api;
  };

  return exports;
})();

(function() {
  'use strict';

  var PARAMETER = /\{\*\}/;

  function ensureArray(value) {
    if (value === undefined || value === null) {
      return;
    }

    return (value instanceof Array) ? value : [ value ];
  }

  function normalizeNamedParameters(parameters) {
    Object.keys(parameters || {}).forEach(function(key) {
      parameters[key] = ensureArray(parameters[key]);
    });
  }

  function wrapWithParameterizedHeader(name, definitions) {
    return definitions.map(function(definition) {
      return RAML.Inspector.ParameterizedHeader.fromRAML(name, definition);
    });
  }

  function filterHeaders(headers) {
    var filtered = {
      plain: {},
      parameterized: {}
    };

    Object.keys(headers || {}).forEach(function(key) {
      if (key.match(PARAMETER)) {
        filtered.parameterized[key] = wrapWithParameterizedHeader(key, headers[key]);
      } else {
        filtered.plain[key] = headers[key];
      }
    });

    return filtered;
  }

  function processBody(body) {
    var content = body['application/x-www-form-urlencoded'];
    if (content) {
      normalizeNamedParameters(content.formParameters);
    }

    content = body['multipart/form-data'];
    if (content) {
      normalizeNamedParameters(content.formParameters);
    }
  }

  function processResponses(responses) {
    Object.keys(responses).forEach(function(status) {
      var response = responses[status];
      if (response) {
        normalizeNamedParameters(response.headers);
      }
    });
  }

  function securitySchemesExtractor(securitySchemes) {
    securitySchemes = securitySchemes || [];

    return function() {
      var securedBy = this.securedBy || [],
          selectedSchemes = {};

      securedBy = securedBy.filter(function(name) {
        return name !== null && typeof name !== 'object';
      });

      securitySchemes.forEach(function(scheme) {
        securedBy.forEach(function(name) {
          if (scheme[name]) {
            selectedSchemes[name] = scheme[name];
          }
        });
      });

      return selectedSchemes;
    };
  }

  function allowsAnonymousAccess() {
    /*jshint validthis: true */
    var securedBy = this.securedBy || [null];
    return securedBy.some(function(name) { return name === null; });
  }

  RAML.Inspector.Method = {
    create: function(raml, securitySchemes) {
      var method = RAML.Utils.clone(raml);

      method.securitySchemes = securitySchemesExtractor(securitySchemes);
      method.allowsAnonymousAccess = allowsAnonymousAccess;
      normalizeNamedParameters(method.headers);
      normalizeNamedParameters(method.queryParameters);

      method.headers = filterHeaders(method.headers);
      processBody(method.body || {});
      processResponses(method.responses || {});

      return method;
    }
  };
})();

(function () {
  'use strict';

  function validate(value) {
    value = value ? value.trim() : '';

    if (value === '') {
      throw new Error();
    }

    return value;
  }

  function fromRAML(name, definition) {
    var parameterizedString = new RAML.Client.ParameterizedString(name, definition);

    return {
      create: function(value) {
        value = validate(value);

        var header = RAML.Utils.clone(definition);
        header.displayName = parameterizedString.render({'*': value});

        return header;
      },
      definition: function() {
        return definition;
      }
    };
  }

  RAML.Inspector.ParameterizedHeader = {
    fromRAML: fromRAML
  };
})();

'use strict';

(function() {
  var Client = function(configuration) {
    this.baseUri = configuration.getBaseUri();
  };

  function createConfiguration(parsed) {
    var config = {
      baseUriParameters: {}
    };

    return {
      baseUriParameters: function(baseUriParameters) {
        config.baseUriParameters = baseUriParameters || {};
      },

      getBaseUri: function() {
        var template = RAML.Client.createBaseUri(parsed);
        config.baseUriParameters.version = parsed.version;

        return template.render(config.baseUriParameters);
      }
    };
  }

  RAML.Client = {
    create: function(parsed, configure) {
      var configuration = createConfiguration(parsed);

      if (configure) {
        configure(configuration);
      }

      return new Client(configuration);
    },

    createBaseUri: function(rootRAML) {
      var baseUri = rootRAML.baseUri.toString();
      return new RAML.Client.ParameterizedString(baseUri, rootRAML.baseUriParameters, { parameterValues: {version: rootRAML.version} });
    },

    createPathSegment: function(resourceRAML) {
      return new RAML.Client.ParameterizedString(resourceRAML.relativeUri, resourceRAML.uriParameters);
    }
  };
})();

(function() {
  'use strict';

  RAML.Client.AuthStrategies = {
    for: function(scheme, credentials) {
      if (!scheme) {
        return RAML.Client.AuthStrategies.anonymous();
      }

      switch(scheme.type) {
      case 'Basic Authentication':
        return new RAML.Client.AuthStrategies.Basic(scheme, credentials);
      case 'OAuth 2.0':
        return new RAML.Client.AuthStrategies.Oauth2(scheme, credentials);
      case 'OAuth 1.0':
        return new RAML.Client.AuthStrategies.Oauth1(scheme, credentials);
      default:
        throw new Error('Unknown authentication strategy: ' + scheme.type);
      }
    }
  };
})();

'use strict';

(function() {
  var NO_OP_TOKEN = {
    sign: function() {}
  };

  var Anonymous = function() {};

  Anonymous.prototype.authenticate = function() {
    return {
      then: function(success) { success(NO_OP_TOKEN); }
    };
  };

  var anonymous = new Anonymous();

  RAML.Client.AuthStrategies.Anonymous = Anonymous;
  RAML.Client.AuthStrategies.anonymous = function() {
    return anonymous;
  };
})();

'use strict';

(function() {
  var Basic = function(scheme, credentials) {
    this.token = new Basic.Token(credentials);
  };

  Basic.prototype.authenticate = function() {
    var token = this.token;

    return {
      then: function(success) { success(token); }
    };
  };

  Basic.Token = function(credentials) {
    var words = CryptoJS.enc.Utf8.parse(credentials.username + ':' + credentials.password);
    this.encoded = CryptoJS.enc.Base64.stringify(words);
  };

  Basic.Token.prototype.sign = function(request) {
    request.header('Authorization', 'Basic ' + this.encoded);
  };

  RAML.Client.AuthStrategies.Basic = Basic;
})();

(function() {
  'use strict';

  var Oauth1 = function(scheme, credentials) {
    var signerFactory = RAML.Client.AuthStrategies.Oauth1.Signer.createFactory(scheme.settings, credentials);
    this.requestTemporaryCredentials = RAML.Client.AuthStrategies.Oauth1.requestTemporaryCredentials(scheme.settings, signerFactory);
    this.requestAuthorization = RAML.Client.AuthStrategies.Oauth1.requestAuthorization(scheme.settings);
    this.requestTokenCredentials = RAML.Client.AuthStrategies.Oauth1.requestTokenCredentials(scheme.settings, signerFactory);
  };

  Oauth1.proxyRequest = function(url) {
    if (RAML.Settings.proxy) {
      url = RAML.Settings.proxy + url;
    }

    return url;
  };

  Oauth1.parseUrlEncodedData = function(data) {
    var result = {};

    data.split('&').forEach(function(param) {
      var keyAndValue = param.split('=');
      result[keyAndValue[0]] = keyAndValue[1];
    });

    return result;
  };

  Oauth1.prototype.authenticate = function() {
    return this.requestTemporaryCredentials().then(this.requestAuthorization).then(this.requestTokenCredentials);
  };

  RAML.Client.AuthStrategies.Oauth1 = Oauth1;
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  var WINDOW_NAME = 'raml-console-oauth1';

  RAML.Client.AuthStrategies.Oauth1.requestAuthorization = function(settings) {
    return function requestAuthorization(temporaryCredentials) {
      var authorizationUrl = settings.authorizationUri + '?oauth_token=' + temporaryCredentials.token,
      deferred = $.Deferred();

      window.RAML.authorizationSuccess = function(authResult) {
        temporaryCredentials.verifier = authResult.verifier;
        deferred.resolve(temporaryCredentials);
      };
      window.open(authorizationUrl, WINDOW_NAME);
      return deferred.promise();
    };
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth1.requestTemporaryCredentials = function(settings, signerFactory) {
    return function requestTemporaryCredentials() {
      var url = RAML.Client.AuthStrategies.Oauth1.proxyRequest(settings.requestTokenUri);
      var request = RAML.Client.Request.create(url, 'post');

      signerFactory().sign(request);

      return $.ajax(request.toOptions()).then(function(rawFormData) {
        var data = RAML.Client.AuthStrategies.Oauth1.parseUrlEncodedData(rawFormData);

        return {
          token: data.oauth_token,
          tokenSecret: data.oauth_token_secret
        };
      });
    };
  };

})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth1.requestTokenCredentials = function(settings, signerFactory) {
    return function requestTokenCredentials(temporaryCredentials) {
      var url = RAML.Client.AuthStrategies.Oauth1.proxyRequest(settings.tokenCredentialsUri);
      var request = RAML.Client.Request.create(url, 'post');

      signerFactory(temporaryCredentials).sign(request);

      return $.ajax(request.toOptions()).then(function(rawFormData) {
        var credentials = RAML.Client.AuthStrategies.Oauth1.parseUrlEncodedData(rawFormData);

        return signerFactory({
          token: credentials.oauth_token,
          tokenSecret: credentials.oauth_token_secret
        });
      });
    };
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  var Signer = RAML.Client.AuthStrategies.Oauth1.Signer = {};

  Signer.createFactory = function(settings, consumerCredentials) {
    settings = settings || {};

    return function createSigner(tokenCredentials) {
      var type = settings.signatureMethod === 'PLAINTEXT' ? 'Plaintext' : 'Hmac';
      var mode = tokenCredentials === undefined ? 'Temporary' : 'Token';

      return new Signer[type][mode](consumerCredentials, tokenCredentials);
    };
  };

  function baseParameters(consumerCredentials) {
    return {
      oauth_consumer_key: consumerCredentials.consumerKey,
      oauth_version: '1.0'
    };
  }

  Signer.generateTemporaryCredentialParameters = function(consumerCredentials) {
    var result = baseParameters(consumerCredentials);
    result.oauth_callback = RAML.Settings.oauth1RedirectUri;

    return result;
  };

  Signer.generateTokenCredentialParameters = function(consumerCredentials, tokenCredentials) {
    var result = baseParameters(consumerCredentials);

    result.oauth_token = tokenCredentials.token;
    if (tokenCredentials.verifier) {
      result.oauth_verifier = tokenCredentials.verifier;
    }

    return result;
  };

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  Signer.rfc3986Encode = function(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, window.escape).replace(/\*/g, '%2A');
  };

  Signer.setRequestHeader = function(params, request) {
    var header = Object.keys(params).map(function(key) {
      return key + '="' + Signer.rfc3986Encode(params[key]) + '"';
    }).join(', ');

    request.header('Authorization', 'OAuth ' + header);
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  var generateTemporaryCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Signer.generateTemporaryCredentialParameters,
      generateTokenCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Signer.generateTokenCredentialParameters,
      rfc3986Encode = RAML.Client.AuthStrategies.Oauth1.Signer.rfc3986Encode,
      setRequestHeader = RAML.Client.AuthStrategies.Oauth1.Signer.setRequestHeader;

  function uriWithoutProxy(url) {
    if (RAML.Settings.proxy) {
      url = url.replace(RAML.Settings.proxy, '');
    }
    return url;
  }

  function generateSignature(params, request, key) {
    params.oauth_signature_method = 'HMAC-SHA1';
    params.oauth_timestamp = Math.floor(Date.now() / 1000);
    params.oauth_nonce = CryptoJS.lib.WordArray.random(16).toString();

    var data = Hmac.constructHmacText(request, params);
    var hash = CryptoJS.HmacSHA1(data, key);
    params.oauth_signature = hash.toString(CryptoJS.enc.Base64);
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
      var params = request.queryParams();
      var formParams = {};
      if (request.toOptions().contentType === 'application/x-www-form-urlencoded') {
        formParams = request.data();
      }

      var result = [];
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

  RAML.Client.AuthStrategies.Oauth1.Signer.Hmac = Hmac;
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  var generateTemporaryCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Signer.generateTemporaryCredentialParameters,
      generateTokenCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Signer.generateTokenCredentialParameters,
      rfc3986Encode = RAML.Client.AuthStrategies.Oauth1.Signer.rfc3986Encode,
      setRequestHeader = RAML.Client.AuthStrategies.Oauth1.Signer.setRequestHeader;

  var Plaintext = {};

  Plaintext.Temporary = function(consumerCredentials) {
    this.consumerCredentials = consumerCredentials;
  };

  Plaintext.Temporary.prototype.sign = function(request) {
    var params = generateTemporaryCredentialParameters(this.consumerCredentials);
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&';
    params.oauth_signature_method = 'PLAINTEXT';

    setRequestHeader(params, request);
  };

  Plaintext.Token = function(consumerCredentials, tokenCredentials) {
    this.consumerCredentials = consumerCredentials;
    this.tokenCredentials = tokenCredentials;
  };

  Plaintext.Token.prototype.sign = function(request) {
    var params = generateTokenCredentialParameters(this.consumerCredentials, this.tokenCredentials);
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&' + rfc3986Encode(this.tokenCredentials.tokenSecret);
    params.oauth_signature_method = 'PLAINTEXT';

    setRequestHeader(params, request);
  };

  RAML.Client.AuthStrategies.Oauth1.Signer.Plaintext = Plaintext;
})();

(function() {
  'use strict';

  var Oauth2 = function(scheme, credentials) {
    this.grant = RAML.Client.AuthStrategies.Oauth2.Grant.create(scheme.settings, credentials);
    this.tokenFactory = RAML.Client.AuthStrategies.Oauth2.Token.createFactory(scheme);
  };

  Oauth2.prototype.authenticate = function() {
    return this.grant.request().then(Oauth2.createToken(this.tokenFactory));
  };

  RAML.Client.AuthStrategies.Oauth2 = Oauth2;
})();

(function() {
  'use strict';

  RAML.Client.AuthStrategies.Oauth2.createToken = function(tokenFactory) {
    return function(token) {
      return tokenFactory(token);
    };
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth2.credentialsManager = function(credentials, responseType) {
    return {
      authorizationUrl : function(baseUrl) {
        return baseUrl +
          '?client_id=' + credentials.clientId +
          '&response_type=' + responseType +
          '&redirect_uri=' + RAML.Settings.oauth2RedirectUri;
      },

      accessTokenParameters: function(code) {
        return {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: RAML.Settings.oauth2RedirectUri
        };
      }
    };
  };
})();

(function() {
  'use strict';

  var GRANTS = [ 'code', 'token' ], IMPLICIT_GRANT = 'token';
  var Oauth2 = RAML.Client.AuthStrategies.Oauth2;

  function grantTypeFrom(settings) {
    var authorizationGrants = settings.authorizationGrants || [];
    var filtered = authorizationGrants.filter(function(grant) { return grant === IMPLICIT_GRANT; });
    var specifiedGrant = filtered[0] || authorizationGrants[0];

    if (!GRANTS.some(function(grant) { return grant === specifiedGrant; })) {
      throw new Error('Unknown grant type: ' + specifiedGrant);
    }

    return specifiedGrant;
  }

  var Grant = {
    create: function(settings, credentials) {
      var type = grantTypeFrom(settings);
      var credentialsManager = Oauth2.credentialsManager(credentials, type);

      var className = type.charAt(0).toUpperCase() + type.slice(1);
      return new this[className](settings, credentialsManager);
    }
  };

  Grant.Code = function(settings, credentialsManager) {
    this.settings = settings;
    this.credentialsManager = credentialsManager;
  };

  Grant.Code.prototype.request = function() {
    var requestAuthorization = Oauth2.requestAuthorization(this.settings, this.credentialsManager);
    var requestAccessToken = Oauth2.requestAccessToken(this.settings, this.credentialsManager);

    return requestAuthorization.then(requestAccessToken);
  };

  Grant.Token = function(settings, credentialsManager) {
    this.settings = settings;
    this.credentialsManager = credentialsManager;
  };

  Grant.Token.prototype.request = function() {
    return Oauth2.requestAuthorization(this.settings, this.credentialsManager);
  };

  Oauth2.Grant = Grant;
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  function proxyRequest(url) {
    if (RAML.Settings.proxy) {
      url = RAML.Settings.proxy + url;
    }

    return url;
  }

  function accessTokenFromObject(data) {
    return data.access_token;
  }

  function accessTokenFromString(data) {
    var vars = data.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === 'access_token') {
        return decodeURIComponent(pair[1]);
      }
    }

    return undefined;
  }

  RAML.Client.AuthStrategies.Oauth2.requestAccessToken = function(settings, credentialsManager) {
    return function(code) {
      var url = proxyRequest(settings.accessTokenUri);

      var requestOptions = {
        url: url,
        type: 'post',
        data: credentialsManager.accessTokenParameters(code)
      };

      return $.ajax(requestOptions).then(function(data) {
        var extract = accessTokenFromString;
        if (typeof data === 'object') {
          extract = accessTokenFromObject;
        }

        return extract(data);
      });
    };
  };
})();

(function() {
  'use strict';

  var WINDOW_NAME = 'raml-console-oauth2';

  RAML.Client.AuthStrategies.Oauth2.requestAuthorization = function(settings, credentialsManager) {
    var authorizationUrl = credentialsManager.authorizationUrl(settings.authorizationUri),
        deferred = $.Deferred();

    window.RAML.authorizationSuccess = function(code) { deferred.resolve(code); };
    window.open(authorizationUrl, WINDOW_NAME);
    return deferred.promise();
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  function tokenConstructorFor(scheme) {
    var describedBy = scheme.describedBy || {},
        headers = describedBy.headers || {},
        queryParameters = describedBy.queryParameters || {};

    if (headers.Authorization) {
      return Header;
    }

    if (queryParameters.access_token) {
      return QueryParameter;
    }

    return Header;
  }

  var Header = function(accessToken) {
    this.accessToken = accessToken;
  };

  Header.prototype.sign = function(request) {
    request.header('Authorization', 'Bearer ' + this.accessToken);
  };

  var QueryParameter = function(accessToken) {
    this.accessToken = accessToken;
  };

  QueryParameter.prototype.sign = function(request) {
    request.queryParam('access_token', this.accessToken);
  };

  RAML.Client.AuthStrategies.Oauth2.Token = {
    createFactory: function(scheme) {
      var TokenConstructor = tokenConstructorFor(scheme);

      return function createToken(value) {
        return new TokenConstructor(value);
      };
    }
  };
})();

(function() {
  'use strict';

  var templateMatcher = /\{([^}]*)\}/g;

  function tokenize(template) {
    var tokens = template.split(templateMatcher);

    return tokens.filter(function(token) {
      return token.length > 0;
    });
  }

  function rendererFor(template, uriParameters) {
    var requiredParameters = Object.keys(uriParameters || {}).filter(function(name) {
      return uriParameters[name].required;
    });

    return function renderer(context) {
      context = context || {};

      requiredParameters.forEach(function(name) {
        if (!context[name]) {
          throw new Error('Missing required uri parameter: ' + name);
        }
      });

      var templated = template.replace(templateMatcher, function(match, parameterName) {
        return context[parameterName] || '';
      });

      return templated;
    };
  }

  RAML.Client.ParameterizedString = function(template, uriParameters, options) {
    options = options || {parameterValues: {} };
    template = template.replace(templateMatcher, function(match, parameterName) {
      if (options.parameterValues[parameterName]) {
        return options.parameterValues[parameterName];
      }
      return '{' + parameterName + '}';
    });

    this.parameters = uriParameters;
    this.templated = Object.keys(this.parameters || {}).length > 0;
    this.tokens = tokenize(template);
    this.render = rendererFor(template, uriParameters);
    this.toString = function() { return template; };
  };
})();

(function() {
  'use strict';

  RAML.Client.PathBuilder = {
    create: function(pathSegments) {
      return function pathBuilder(contexts) {
        contexts = contexts || [];

        return pathSegments.map(function(pathSegment, index) {
          return pathSegment.render(contexts[index]);
        }).join('');
      };
    }
  };
})();

(function() {
  'use strict';

  var CONTENT_TYPE = 'content-type';
  var FORM_DATA = 'multipart/form-data';

  var RequestDsl = function(options) {
    var rawData;
    var queryParams;
    var isMultipartRequest;

    this.data = function(data) {
      if (data === undefined) {
        return RAML.Utils.clone(rawData);
      } else {
        rawData = data;
      }
    };

    this.queryParams = function(parameters) {
      if (parameters === undefined) {
        return RAML.Utils.clone(queryParams);
      } else {
        queryParams = parameters;
      }
    };

    this.queryParam = function(name, value) {
      queryParams = queryParams || {};
      queryParams[name] = value;
    };

    this.header = function(name, value) {
      options.headers = options.headers || {};

      if (name.toLowerCase() === CONTENT_TYPE) {
        if (value === FORM_DATA) {
          isMultipartRequest = true;
          return;
        } else {
          isMultipartRequest = false;
          options.contentType = value;
        }
      }

      options.headers[name] = value;
    };

    this.headers = function(headers) {
      options.headers = {};
      isMultipartRequest = false;
      options.contentType = false;

      for (var name in headers) {
        this.header(name, headers[name]);
      }
    };

    this.toOptions = function() {
      var o = RAML.Utils.clone(options);
      o.traditional = true;
      if (rawData) {
        if (isMultipartRequest) {
          var data = new FormData();

          var appendValueForKey = function(key) {
            return function(value) {
              data.append(key, value);
            };
          };

          for (var key in rawData) {
            rawData[key].forEach(appendValueForKey(key));
          }

          o.processData = false;
          o.data = data;
        } else {
          o.processData = true;
          o.data = rawData;
        }
      }
      if (!RAML.Utils.isEmpty(queryParams)) {
        var separator = (options.url.match('\\?') ? '&' : '?');
        o.url = options.url + separator + $.param(queryParams, true);
      }

      return o;
    };
  };

  RAML.Client.Request = {
    create: function(url, method) {
      var request = {};
      RequestDsl.call(request, { url: url, type: method, contentType: false });

      return request;
    }
  };
})();

(function() {
  'use strict';

  // number regular expressions from http://yaml.org/spec/1.2/spec.html#id2804092

  var RFC1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;

  function isEmpty(value) {
    return value === null || value === undefined || value === '';
  }

  var VALIDATIONS = {
    required: function(value) { return !isEmpty(value); },
    boolean: function(value) { return isEmpty(value) || value === 'true' || value === 'false'; },
    enum: function(enumeration) {
      return function(value) {
        return isEmpty(value) || enumeration.some(function(item) { return item === value; });
      };
    },
    integer: function(value) { return isEmpty(value) || !!/^-?(0|[1-9][0-9]*)$/.exec(value); },
    number: function(value) { return isEmpty(value) || !!/^-?(0|[1-9][0-9]*)(\.[0-9]*)?([eE][-+]?[0-9]+)?$/.exec(value); },
    minimum: function(minimum) {
      return function(value) {
        return isEmpty(value) || value >= minimum;
      };
    },
    maximum: function(maximum) {
      return function(value) {
        return isEmpty(value) || value <= maximum;
      };
    },
    minLength: function(minimum) {
      return function(value) {
        return isEmpty(value) || value.length >= minimum;
      };
    },
    maxLength: function(maximum) {
      return function(value) {
        return isEmpty(value) || value.length <= maximum;
      };
    },
    pattern: function(pattern) {
      var regex = new RegExp(pattern);

      return function(value) {
        return isEmpty(value) || !!regex.exec(value);
      };
    },
    date: function(value) { return isEmpty(value) || !!RFC1123.exec(value); }
  };

  function baseValidations(definition) {
    var validations = {};

    if (definition.required) {
      validations.required = VALIDATIONS.required;
    }

    return validations;
  }

  function numberValidations(validations, definition) {
    if (definition.minimum) {
      validations.minimum = VALIDATIONS.minimum(definition.minimum);
    }

    if (definition.maximum) {
      validations.maximum = VALIDATIONS.maximum(definition.maximum);
    }
  }

  // function copyValidations(validations, types) {
  //   Object.keys(types).forEach(function(type) {
  //     validations[type] = VALIDATIONS[type](types[type]);
  //   });
  // }

  var VALIDATIONS_FOR_TYPE = {
    string: function(definition) {
      var validations = baseValidations(definition);
      if (definition.enum) {
        validations.enum = VALIDATIONS.enum(definition.enum);
      }
      if (definition.minLength) {
        validations.minLength = VALIDATIONS.minLength(definition.minLength);
      }
      if (definition.maxLength) {
        validations.maxLength = VALIDATIONS.maxLength(definition.maxLength);
      }
      if (definition.pattern) {
        validations.pattern = VALIDATIONS.pattern(definition.pattern);
      }
      return validations;
    },

    integer: function(definition) {
      var validations = baseValidations(definition);
      validations.integer = VALIDATIONS.integer;
      numberValidations(validations, definition);
      return validations;
    },

    number: function(definition) {
      var validations = baseValidations(definition);
      validations.number = VALIDATIONS.number;
      numberValidations(validations, definition);
      return validations;
    },

    boolean: function(definition) {
      var validations = baseValidations(definition);
      validations.boolean = VALIDATIONS.boolean;
      return validations;
    },

    date: function(definition) {
      var validations = baseValidations(definition);
      validations.date = VALIDATIONS.date;
      return validations;
    }
  };

  function Validator(validations) {
    this.validations = validations;
  }

  Validator.prototype.validate = function(value) {
    var errors;

    for (var validation in this.validations) {
      if (!this.validations[validation](value)) {
        errors = errors || [];
        errors.push(validation);
      }
    }

    return errors;
  };

  Validator.from = function(definition) {
    if (!definition) {
      throw new Error('definition is required!');
    }

    var validations;

    if (VALIDATIONS_FOR_TYPE[definition.type]) {
      validations = VALIDATIONS_FOR_TYPE[definition.type](definition);
    } else {
      validations = {};
    }

    return new Validator(validations);
  };

  RAML.Client.Validator = Validator;
})();

'use strict';

(function() {
  RAML.Controllers = {};
})();

(function() {
  'use strict';

  var FORM_MIME_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data'];

  function hasFormParameters(method) {
    return FORM_MIME_TYPES.some(function(type) {
      return method.body && method.body[type] && !RAML.Utils.isEmpty(method.body[type].formParameters);
    });
  }

  var controller = function($scope) {
    $scope.documentation = this;

    this.resource = $scope.resource;
    this.method = $scope.method;
  };

  controller.prototype.hasUriParameters = function() {
    return this.resource.pathSegments.some(function(segment) {
      return segment.templated;
    });
  };

  controller.prototype.hasParameters = function() {
    return !!(this.hasUriParameters() || this.method.queryParameters ||
      !RAML.Utils.isEmpty(this.method.headers.plain) || hasFormParameters(this.method));
  };

  controller.prototype.hasRequestDocumentation = function() {
    return this.hasParameters() || !RAML.Utils.isEmpty(this.method.body);
  };

  controller.prototype.hasResponseDocumentation = function() {
    return !RAML.Utils.isEmpty(this.method.responses);
  };

  controller.prototype.traits = function() {
    return (this.method.is || []);
  };

  RAML.Controllers.Documentation = controller;
})();

(function() {
  'use strict';

  var controller = function($scope, DataStore) {
    $scope.methodView = this;
    this.resource = $scope.resource;
    this.method = $scope.method;
    this.DataStore = DataStore;
    this.expanded = this.DataStore.get(this.methodKey(), true);
  };

  controller.prototype.toggleExpansion = function(evt) {
    evt.preventDefault();

    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  };

  controller.prototype.expand = function() {
    this.expanded = true;
    this.DataStore.set(this.methodKey(), this.expanded);
  };

  controller.prototype.collapse = function() {
    this.expanded = false;
    this.DataStore.set(this.methodKey(), this.expanded);
  };

  controller.prototype.methodKey = function() {
    return this.resource.toString() + ':' + this.method.method;
  };

  controller.prototype.cssClass = function() {
    if (this.expanded) {
      return 'expanded ' + this.method.method;
    } else {
      return 'collapsed ' + this.method.method;
    }
  };

  RAML.Controllers.Method = controller;
})();

'use strict';

(function() {
  var controller = function($scope) {
    $scope.namedParametersDocumentation = this;
  };

  controller.prototype.isEmpty = function(params) {
    return RAML.Utils.isEmpty(params);
  };

  controller.prototype.constraints = function(parameter) {
    var result = '';

    if (parameter.required) {
      result += 'required, ';
    }

    if (parameter.enum) {
      result += 'one of (' + parameter.enum.join(', ') + ')';
    } else {
      result += parameter.type;
    }

    if (parameter.pattern) {
      result += ' matching ' + parameter.pattern;
    }

    if (parameter.minLength && parameter.maxLength) {
      result += ', ' + parameter.minLength + '-' + parameter.maxLength + ' characters';
    } else if (parameter.minLength && !parameter.maxLength) {
      result += ', at least ' + parameter.minLength + ' characters';
    } else if (parameter.maxLength && !parameter.minLength) {
      result += ', at most ' + parameter.maxLength + ' characters';
    }


    if (parameter.minimum && parameter.maximum) {
      result += ' between ' + parameter.minimum + '-' + parameter.maximum;
    } else if (parameter.minimum && !parameter.maximum) {
      result += ' ≥ ' + parameter.minimum;
    } else if (parameter.maximum && !parameter.minimum) {
      result += ' ≤ ' + parameter.maximum;
    }

    if (parameter.repeat) {
      result += ', repeatable';
    }

    if (parameter.default) {
      result += ', default: ' + parameter.default;
    }

    return result;
  };

  RAML.Controllers.NamedParametersDocumentation = controller;
})();

(function() {
  'use strict';

  var controller = function($scope, $attrs, ramlParserWrapper) {
    $scope.ramlConsole = this;

    if ($attrs.hasOwnProperty('withRootDocumentation')) {
      this.withRootDocumentation = true;
    }

    if ($scope.src) {
      ramlParserWrapper.load($scope.src);
    }

    this.keychain = {};
  };

  controller.prototype.gotoView = function(view) {
    this.view = view;
  };

  controller.prototype.tryItEnabled = function() {
    return !!(this.api && this.api.baseUri);
  };

  controller.prototype.showRootDocumentation = function() {
    return this.withRootDocumentation && this.api && this.api.documentation && this.api.documentation.length > 0;
  };

  RAML.Controllers.RAMLConsole = controller;
})();

(function() {
  'use strict';

  var controller = function($scope, DataStore) {
    $scope.resourceView = this;
    this.resource = $scope.resource;
    this.DataStore = DataStore;
    this.expanded = this.DataStore.get(this.resourceKey(), true);
  };

  controller.prototype.resourceKey = function() {
    return this.resource.toString();
  };

  controller.prototype.expandInitially = function(method) {
    if (method.method === this.methodToExpand) {
      delete this.methodToExpand;
      return true;
    }
    return false;
  };

  controller.prototype.expandMethod = function(method) {
    this.methodToExpand = method.method;
  };

  controller.prototype.toggleExpansion = function() {
    this.expanded = !this.expanded;
    this.DataStore.set(this.resourceKey(), this.expanded);
  };

  RAML.Controllers.Resource = controller;

})();

'use strict';

(function() {
  var controller = function($scope, DataStore) {
    this.tabs = $scope.tabs = [];
    $scope.tabset = this;
    this.DataStore = DataStore;
    this.key = $scope.keyBase + ':tabset';
  };

  controller.prototype.select = function(tab, dontPersist) {
    if (tab.disabled) {
      return;
    }

    this.tabs.forEach(function(tab) {
      tab.active = false;
    });

    tab.active = true;
    if (!dontPersist) {
      this.DataStore.set(this.key, tab.heading);
    }
  };

  controller.prototype.addTab = function(tab) {
    var previouslyEnabled = this.DataStore.get(this.key, true) === tab.heading,
        allOthersDisabled = this.tabs.every(function(tab) { return tab.disabled; });

    if (allOthersDisabled || previouslyEnabled) {
      this.select(tab, true);
    }

    this.tabs.push(tab);
  };


  RAML.Controllers.tabset = controller;

})();

'use strict';

(function() {
  function parseHeaders(headers) {
    var parsed = {}, key, val, i;

    if (!headers) {
      return parsed;
    }

    headers.split('\n').forEach(function(line) {
      i = line.indexOf(':');
      key = line.substr(0, i).trim().toLowerCase();
      val = line.substr(i + 1).trim();

      if (key) {
        if (parsed[key]) {
          parsed[key] += ', ' + val;
        } else {
          parsed[key] = val;
        }
      }
    });

    return parsed;
  }

  var apply;

  var TryIt = function($scope) {
    this.context = $scope.context = {};
    this.context.headers = new RAML.Controllers.TryIt.NamedParameters($scope.method.headers.plain, $scope.method.headers.parameterized);
    this.context.queryParameters = new RAML.Controllers.TryIt.NamedParameters($scope.method.queryParameters);
    if ($scope.method.body) {
      this.context.bodyContent = new RAML.Controllers.TryIt.BodyContent($scope.method.body);
    }

    this.getPathBuilder = function() {
      return $scope.pathBuilder;
    };

    this.method = $scope.method;
    this.httpMethod = $scope.method.method;

    $scope.apiClient = this;
    this.parsed = $scope.api;
    this.securitySchemes = $scope.method.securitySchemes();
    this.keychain = $scope.ramlConsole.keychain;

    apply = function() {
      $scope.$apply.apply($scope, arguments);
    };
  };

  TryIt.prototype.inProgress = function() {
    return (this.response && !this.response.status && !this.missingUriParameters);
  };

  TryIt.prototype.execute = function() {
    this.missingUriParameters = false;
    this.disallowedAnonymousRequest = false;

    var response = this.response = {};

    function handleResponse(jqXhr) {
      response.body = jqXhr.responseText,
      response.status = jqXhr.status,
      response.headers = parseHeaders(jqXhr.getAllResponseHeaders());

      if (response.headers['content-type']) {
        response.contentType = response.headers['content-type'].split(';')[0];
      }
      apply();
    }

    try {
      var pathBuilder = this.getPathBuilder();
      var client = RAML.Client.create(this.parsed, function(client) {
        client.baseUriParameters(pathBuilder.baseUriContext);
      });
      var url = this.response.requestUrl = client.baseUri + pathBuilder(pathBuilder.segmentContexts);
      if (RAML.Settings.proxy) {
        url = RAML.Settings.proxy + url;
      }
      var request = RAML.Client.Request.create(url, this.httpMethod);

      if (!RAML.Utils.isEmpty(this.context.queryParameters.data())) {
        request.queryParams(this.context.queryParameters.data());
      }

      if (!RAML.Utils.isEmpty(this.context.headers.data())) {
        request.headers(this.context.headers.data());
      }

      if (this.context.bodyContent) {
        request.header('Content-Type', this.context.bodyContent.selected);
        request.data(this.context.bodyContent.data());
      }

      var authStrategy;

      try {
        if (this.keychain.selectedScheme === 'anonymous' && !this.method.allowsAnonymousAccess()) {
          this.disallowedAnonymousRequest = true;
        }

        var scheme = this.securitySchemes && this.securitySchemes[this.keychain.selectedScheme];
        var credentials = this.keychain[this.keychain.selectedScheme];
        authStrategy = RAML.Client.AuthStrategies.for(scheme, credentials);
      } catch (e) {
        // custom strategies aren't supported yet.
      }

      authStrategy.authenticate().then(function(token) {
        token.sign(request);
        $.ajax(request.toOptions()).then(
          function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
          function(jqXhr) { handleResponse(jqXhr); }
        );
      });
    } catch (e) {
      this.response = undefined;
      this.missingUriParameters = true;
    }
  };

  RAML.Controllers.TryIt = TryIt;
})();

(function() {
  'use strict';

  var FORM_URLENCODED = 'application/x-www-form-urlencoded';
  var FORM_DATA = 'multipart/form-data';

  var BodyContent = function(contentTypes) {
    this.contentTypes = Object.keys(contentTypes);
    this.selected = this.contentTypes[0];

    var definitions = this.definitions = {};
    this.contentTypes.forEach(function(contentType) {
      switch (contentType) {
      case FORM_URLENCODED:
      case FORM_DATA:
        definitions[contentType] = new RAML.Controllers.TryIt.NamedParameters(contentTypes[contentType].formParameters);
        break;
      default:
        definitions[contentType] = new RAML.Controllers.TryIt.BodyType(contentTypes[contentType]);
      }
    });
  };

  BodyContent.prototype.isForm = function(contentType) {
    return contentType === FORM_URLENCODED || contentType === FORM_DATA;
  };

  BodyContent.prototype.isSelected = function(contentType) {
    return contentType === this.selected;
  };

  BodyContent.prototype.fillWithExample = function($event) {
    $event.preventDefault();
    this.definitions[this.selected].fillWithExample();
  };

  BodyContent.prototype.hasExample = function(contentType) {
    return this.definitions[contentType].hasExample();
  };

  BodyContent.prototype.data = function() {
    if (this.selected) {
      return this.definitions[this.selected].data();
    }
  };

  RAML.Controllers.TryIt.BodyContent = BodyContent;
})();

(function() {
  'use strict';

  var BodyType = function(contentType) {
    this.contentType = contentType || {};
    this.value = undefined;
  };

  BodyType.prototype.fillWithExample = function() {
    this.value = this.contentType.example;
  };

  BodyType.prototype.hasExample = function() {
    return !!this.contentType.example;
  };

  BodyType.prototype.data = function() {
    return this.value;
  };

  RAML.Controllers.TryIt.BodyType = BodyType;
})();

(function() {
  'use strict';

  var NamedParameter = function(definitions) {
    this.definitions = definitions;
    this.selected = definitions[0].type;
  };

  NamedParameter.prototype.hasMultipleTypes = function() {
    return this.definitions.length > 1;
  };

  NamedParameter.prototype.isSelected = function(definition) {
    return this.selected === definition.type;
  };

  RAML.Controllers.TryIt.NamedParameter = NamedParameter;
})();

(function() {
  'use strict';

  function copy(object) {
    var shallow = {};
    Object.keys(object || {}).forEach(function(key) {
      shallow[key] = new RAML.Controllers.TryIt.NamedParameter(object[key]);
    });

    return shallow;
  }

  function filterEmpty(object) {
    var copy = {};

    Object.keys(object).forEach(function(key) {
      var values = object[key].filter(function(value) {
        return value !== undefined && value !== null && (typeof value !== 'string' || value.trim().length > 0);
      });

      if (values.length > 0) {
        copy[key] = values;
      }
    });

    return copy;
  }

  var NamedParameters = function(plain, parameterized) {
    this.plain = copy(plain);
    this.parameterized = parameterized;
    this.values = {};
    Object.keys(this.plain).forEach(function(key) {
      this.values[key] = [undefined];
    }.bind(this));
  };

  NamedParameters.prototype.create = function(name, value) {
    var parameters = this.parameterized[name];

    var definition = Object.keys(parameters).map(function(key) {
      return parameters[key].create(value);
    });

    this.plain[definition[0].displayName] = new RAML.Controllers.TryIt.NamedParameter(definition);
    this.values[definition[0].displayName] = [value];
  };

  NamedParameters.prototype.remove = function(name) {
    delete this.plain[name];
    delete this.values[name];
    return;
  };

  NamedParameters.prototype.data = function() {
    return filterEmpty(this.values);
  };

  RAML.Controllers.TryIt.NamedParameters = NamedParameters;
})();

'use strict';

(function() {
  RAML.Directives = {};
})();

(function() {
  'use strict';

  RAML.Directives.apiResources = function() {

    return {
      restrict: 'E',
      templateUrl: 'views/api_resources.tmpl.html',
      replace: true
    };
  };
})();

'use strict';

(function() {
  RAML.Directives.basicAuth = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/basic_auth.tmpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.bodyContent = function() {

    return {
      restrict: 'E',
      templateUrl: 'views/body_content.tmpl.html',
      replace: true,
      scope: {
        body: '='
      }
    };
  };
})();

(function() {
  'use strict';

  var formatters = {
    'application/json' : function(code) {
      return vkbeautify.json(code);
    },
    'text/xml' : function(code) {
      return vkbeautify.xml(code);
    },
    'default' : function(code) {
      return code;
    }
  };

  function sanitize(options) {
    var code = options.code || '',
        formatter = formatters[options.mode] || formatters.default;

    try {
      options.code = formatter(code);
    } catch(e) {}
  }

  var Controller = function($scope, $element) {
    sanitize($scope);

    this.editor = new CodeMirror($element[0], {
      mode: $scope.mode,
      readOnly: true,
      value: $scope.code,
      lineNumbers: true,
      indentUnit: 4
    });

    this.editor.setSize('100%', '100%');
  };

  Controller.prototype.refresh = function(options) {
    sanitize(options);
    this.editor.setOption('mode', options.mode);
    this.editor.setValue(options.code);

    this.editor.refresh();
  };

  var link = function(scope, element, attrs, editor) {
    var watchCode = function() {
      return scope.visible && scope.code;
    };

    scope.$watch(watchCode, function(visible) {
      if (visible) { editor.refresh(scope); }
    });
  };

  RAML.Directives.codeMirror = function() {
    return {
      link: link,
      restrict: 'A',
      replace: true,
      controller: Controller,
      scope: {
        code: '=codeMirror',
        visible: '=',
        mode: '@?'
      }
    };
  };

  RAML.Directives.codeMirror.Controller = Controller;
})();

(function() {
  'use strict';

  // NOTE: This directive relies on the collapsible content
  // and collapsible toggle to live in the same scope.

  var Controller = function() {};

  RAML.Directives.collapsible = function() {
    return {
      controller: Controller,
      restrict: 'EA',
      scope: true,
      link: {
        pre: function(scope, element, attrs) {
          if (attrs.hasOwnProperty('collapsed')) {
            scope.collapsed = true;
          }
        }
      }
    };
  };

  RAML.Directives.collapsibleToggle = function() {
    return {
      require: '^collapsible',
      restrict: 'EA',
      link: function(scope, element) {
        element.bind('click', function() {
          scope.$apply(function() {
            scope.collapsed = !scope.collapsed;
          });
        });
      }
    };
  };

  RAML.Directives.collapsibleContent = function() {
    return {
      require: '^collapsible',
      restrict: 'EA',
      link: function(scope, element) {
        scope.$watch('collapsed', function(collapsed) {
          element.css('display', collapsed ? 'none' : 'block');
          element.parent().removeClass('collapsed expanded');
          element.parent().addClass(collapsed ? 'collapsed' : 'expanded');
        });
      }
    };
  };

})();

(function() {
  'use strict';

  RAML.Directives.documentation = function() {
    return {
      controller: RAML.Controllers.Documentation,
      restrict: 'E',
      templateUrl: 'views/documentation.tmpl.html',
      replace: true
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.enum = function($timeout, $filter) {
    var KEY_DOWN  = 40,
        KEY_UP    = 38,
        KEY_ENTER = 13;

    var link = function($scope, $el) {
      var filterEnumElements = function() {
        $scope.filteredEnum = $filter('filter')($scope.options, $scope.model);
      };

      $scope.$watch(function enumFilterWatch() {
        return $scope.model;
      }, filterEnumElements);

      $scope.selectItem = function(item) {
        $scope.model = item;
        $scope.focused = false;
      };

      filterEnumElements();

      $el.find('input').bind('focus', function() {
        $scope.$apply(function() {
          $scope.selectedIndex = -1;
          $scope.focused = true;
        });
      });

      $el.find('input').bind('blur', function() {
        $scope.$apply(function() {
          $scope.focused = false;
        });
      });

      $el.bind('mousedown', function(event) {
        if (event.target.tagName === 'LI') {
          event.preventDefault();
        }
      });

      $el.find('input').bind('input', function() {
        $scope.$apply(function() {
          $scope.focused = true;
          $scope.selectedIndex = 0;
        });
      });

      $el.find('input').bind('keydown', function(e) {
        switch (e.keyCode) {
        case KEY_UP:
          $scope.selectedIndex = $scope.selectedIndex - 1;
          $scope.selectedIndex = Math.max(0, $scope.selectedIndex);
          e.preventDefault();

          break;
        case KEY_DOWN:
          $scope.selectedIndex = $scope.selectedIndex + 1;
          $scope.selectedIndex = Math.min($scope.filteredEnum.length - 1, $scope.selectedIndex);
          e.preventDefault();
          break;
        case KEY_ENTER:
          var selection = $scope.filteredEnum[$scope.selectedIndex];

          if (selection) {
            $scope.model = selection;
            $scope.focused = false;
          }
          e.preventDefault();
          break;
        }
        $scope.$apply();
      });
    };

    return {
      restrict: 'E',
      transclude: true,
      link: link,
      templateUrl: 'views/enum.tmpl.html',
      scope: {
        options: '=',
        model: '='
      }
    };
  };
})();

(function() {
  'use strict';

  // enhancement to ng-model for input[type="file"]
  // code for this directive taken from:
  // https://github.com/marcenuc/angular.js/commit/2bfff4668c341ddcfec0120c9a5018b0c2463982
  RAML.Directives.input = function() {
    return {
      restrict: 'E',
      require: '?ngModel',
      link: function(scope, element, attr, ctrl) {
        if (ctrl && attr.type && attr.type.toLowerCase() === 'file') {
          element.bind('change', function() {
            scope.$apply(function() {
              var files = element[0].files;
              var viewValue = attr.multiple ? files : files[0];

              ctrl.$setViewValue(viewValue);
            });
          });
        }
      }
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.markdown = function($sanitize) {
    var converter = new Showdown.converter({ extensions: ['table'] });

    var link = function(scope, element) {
      var processMarkdown = function(markdown) {
        var result = converter.makeHtml(markdown || '');
        element.html($sanitize(result));
      };

      scope.$watch('markdown', processMarkdown);
    };

    return {
      restrict: 'A',
      link: link,
      scope: {
        markdown: '='
      }
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.method = function() {
    return {
      controller: RAML.Controllers.Method,
      require: ['^resource', 'method'],
      restrict: 'E',
      templateUrl: 'views/method.tmpl.html',
      replace: true,
      link: function(scope, element, attrs, controllers) {
        var resourceView = controllers[0],
            methodView   = controllers[1];

        if (resourceView.expandInitially(scope.method)) {
          methodView.expand();
        }
      }
    };
  };
})();

'use strict';

(function() {
  var Controller = function($scope) {
    var parameters = $scope.parameters || {};
    parameters.plain = parameters.plain || {};
    parameters.parameterized = parameters.parameterized || {};

    $scope.displayParameters = function() {
      return Object.keys(parameters.plain).length > 0 || Object.keys(parameters.parameterized).length > 0;
    };
  };

  RAML.Directives.namedParameters = function() {
    return {
      restrict: 'E',
      controller: Controller,
      templateUrl: 'views/named_parameters.tmpl.html',
      replace: true,
      scope: {
        heading: '@',
        parameters: '='
      }
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.namedParametersDocumentation = function() {
    return {
      restrict: 'E',
      controller: RAML.Controllers.NamedParametersDocumentation,
      templateUrl: 'views/named_parameters_documentation.tmpl.html',
      scope: {
        heading: '@',
        parameters: '='
      }
    };
  };
})();

'use strict';

(function() {
  RAML.Directives.oauth1 = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/oauth1.tmpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };
})();

'use strict';

(function() {
  RAML.Directives.oauth2 = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/oauth2.tmpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };
})();

'use strict';

(function() {

  var Controller = function($scope) {
    $scope.parameterFields = this;
  };

  Controller.prototype.inputView = function(parameter) {
    if (parameter.type === 'file') {
      return 'file';
    } else if (!!parameter.enum) {
      return 'enum';
    } else {
      return 'default';
    }
  };

  RAML.Directives.parameterFields = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameter_fields.tmpl.html',
      controller: Controller,
      scope: {
        parameters: '=',
      }
    };
  };
})();

(function() {
  'use strict';

  var Controller = function($scope) {
    $scope.parameterFactory = this;

    this.parameterName = $scope.parameterName;
    this.parameters = $scope.parameters;
  };

  Controller.prototype.open = function($event) {
    $event.preventDefault();
    this.opened = true;
  };

  Controller.prototype.create = function($event) {
    $event.preventDefault();

    try {
      this.parameters.create(this.parameterName, this.value);
      this.opened = false;
      this.value = this.status = '';
    } catch (e) {
      this.status = 'error';
    }
  };

  RAML.Directives.parameterizedParameter = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameterized_parameter.tmpl.html',
      replace: true,
      controller: Controller,
      scope: {
        parameters: '=',
        parameterName: '='
      }
    };
  };
})();

'use strict';

(function() {
  RAML.Directives.parameters = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameters.tmpl.html',
      link: function(scope) {
        var plainAndParameterizedHeaders = RAML.Utils.copy(scope.method.headers.plain);
        Object.keys(scope.method.headers.parameterized).forEach(function(parameterizedHeader) {
          plainAndParameterizedHeaders[parameterizedHeader] = scope.method.headers.parameterized[parameterizedHeader].map(function(parameterized) {
            return parameterized.definition();
          });
        });
        scope.plainAndParameterizedHeaders = plainAndParameterizedHeaders;
      }
    };
  };
})();

(function() {
  'use strict';

  var Controller = function($scope) {
    $scope.pathBuilder = new RAML.Client.PathBuilder.create($scope.resource.pathSegments);
    $scope.pathBuilder.baseUriContext = {};
    $scope.pathBuilder.segmentContexts = $scope.resource.pathSegments.map(function() {
      return {};
    });
  };

  RAML.Directives.pathBuilder = function() {
    return {
      restrict: 'E',
      controller: Controller,
      templateUrl: 'views/path_builder.tmpl.html',
      replace: true
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.ramlConsole = function(ramlParserWrapper, DataStore) {

    var link = function ($scope, $el, $attrs, controller) {
      ramlParserWrapper.onParseSuccess(function(raml) {
        $scope.api = controller.api = RAML.Inspector.create(raml);
        DataStore.invalidate();
      });

      ramlParserWrapper.onParseError(function(error) {
        $scope.parseError = error;
      });
    };

    return {
      restrict: 'E',
      templateUrl: 'views/raml-console.tmpl.html',
      controller: RAML.Controllers.RAMLConsole,
      scope: {
        src: '@'
      },
      link: link
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.ramlConsoleInitializer = function(ramlParserWrapper) {
    var controller = function($scope) {
      $scope.consoleLoader = this;
    };

    controller.prototype.load = function() {
      ramlParserWrapper.load(this.location);
      this.finished = true;
    };

    controller.prototype.parse = function() {
      ramlParserWrapper.parse(this.raml);
      this.finished = true;
    };

    var link = function($scope, $element, $attrs, controller) {
      if (document.location.search.indexOf('?raml=') !== -1) {
        controller.location = document.location.search.replace('?raml=', '');
        controller.load();
      }
    };

    return { restrict: 'E', controller: controller, link: link };
  };
})();

'use strict';

(function() {
  RAML.Directives.requests = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/requests.tmpl.html'
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.resource = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/resource.tmpl.html',
      replace: true,
      controller: RAML.Controllers.Resource
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.repeatable = function($parse) {
    var controller = function($scope, $attrs) {
      this.repeatable = function() {
        return $parse($attrs.repeatable)($scope);
      };

      this.new = function() {
        $scope.repeatableModel.push('');
      };

      this.remove = function(index) {
        $scope.repeatableModel.splice(index, 1);
      };
    };

    return {
      restrict: 'EA',
      templateUrl: 'views/repeatable.tmpl.html',
      transclude: true,
      controller: controller,
      link: function(scope, element, attrs) {
        scope.repeatable = !attrs.repeatable || $parse(attrs.repeatable)(scope);
        scope.repeatableModel = $parse(attrs.repeatableModel)(scope);

        scope.$watch('repeatableModel', function(value) {
          $parse(attrs.repeatableModel).assign(scope, value);
        }, true);
      }
    };
  };
})();

'use strict';

(function() {
  RAML.Directives.repeatableAdd = function() {
    return {
      require: '^repeatable',
      restrict: 'E',
      template: '<i class="icon icon-plus-sign-alt" ng-show="visible" ng-click="new()"></i>',
      scope: true,
      link: function(scope, element, attrs, controller) {
        scope.$watch('$last', function(last) {
          scope.visible = controller.repeatable() && last;
        });

        scope.new = function() {
          controller.new();
        };
      }
    };
  };
})();

'use strict';

(function() {
  RAML.Directives.repeatableRemove = function() {
    return {
      require: '^repeatable',
      restrict: 'E',
      template: '<i class="icon icon-remove-sign" ng-show="visible" ng-click="remove()"></i>',
      scope: true,
      link: function(scope, element, attrs, controller) {
        scope.$watch('repeatableModel.length', function(length) {
          scope.visible = controller.repeatable() && length > 1;
        });

        scope.remove = function() {
          var index = scope.$index;
          controller.remove(index);
        };
      }
    };
  };
})();

'use strict';

(function() {
  RAML.Directives.responses = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/responses.tmpl.html'
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.rootDocumentation = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/root_documentation.tmpl.html',
      replace: true
    };
  };
})();

'use strict';

(function() {
  RAML.Directives.securitySchemes = function() {

    var controller = function($scope) {
      $scope.securitySchemes = this;
    };

    controller.prototype.supports = function(scheme) {
      return scheme.type === 'OAuth 2.0' ||
        scheme.type === 'OAuth 1.0' ||
        scheme.type === 'Basic Authentication';
    };

    return {
      restrict: 'E',
      templateUrl: 'views/security_schemes.tmpl.html',
      replace: true,
      controller: controller,
      scope: {
        schemes: '=',
        keychain: '='
      }
    };
  };
})();

(function() {
  'use strict';

  ////////////
  // tabset
  ////////////

  RAML.Directives.tabset = function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: RAML.Controllers.tabset,
      templateUrl: 'views/tabset.tmpl.html',
      scope: {
        keyBase: '@'
      }
    };
  };

  ////////////////
  // tabs
  ///////////////

  var link = function($scope, $element, $attrs, tabsetCtrl) {
    tabsetCtrl.addTab($scope);
  };

  RAML.Directives.tab = function() {
    return {
      restrict: 'E',
      require: '^tabset',
      replace: true,
      transclude: true,
      link: link,
      templateUrl: 'views/tab.tmpl.html',
      scope: {
        heading: '@',
        active: '=?',
        disabled: '=?'
      }
    };
  };
})();

(function() {
  'use strict';

  RAML.Directives.tryIt = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/try_it.tmpl.html',
      replace: true,
      controller: RAML.Controllers.TryIt
    };
  };
})();

(function() {
  'use strict';

  var Controller = function($attrs, $parse) {
    this.constraints = $parse($attrs.constraints);
  };

  Controller.prototype.validate = function(scope, value) {
    var constraints = this.constraints(scope);
    var validator = RAML.Client.Validator.from(constraints);

    return validator.validate(value);
  };

  var link = function($scope, $el, $attrs, controllers) {
    var modelController    = controllers[0],
        validateController = controllers[1],
        errorClass = $attrs.invalidClass || 'warning';

    function validateField() {
      var errors = validateController.validate($scope, modelController.$modelValue);

      if (errors) {
        $el.addClass(errorClass);
      } else {
        $el.removeClass(errorClass);
      }
    }

    $el.bind('blur', function() {
      $scope.$apply(validateField);
    });

    $el.bind('focus', function() {
      $scope.$apply(function() {
        $el.removeClass(errorClass);
      });
    });

    angular.element($el[0].form).bind('submit', function() {
      $scope.$apply(validateField);
    });
  };

  RAML.Directives.validatedInput = function() {
    return {
      restrict: 'A',
      require: ['ngModel', 'validatedInput'],
      controller: Controller,
      link: link
    };
  };
})();

RAML.Filters = {};

(function() {
  'use strict';

  RAML.Filters.nameFromParameterizable = function() {
    return function(input) {
      if (typeof input === 'object' && input !== null) {
        return Object.keys(input)[0];
      } else if (input) {
        return input;
      } else {
        return undefined;
      }
    };
  };
})();

(function() {
  'use strict';

  RAML.Filters.yesNo = function() {
    return function(input) {
      return input ? 'Yes' : 'No';
    };
  };
})();

(function() {
  'use strict';

  RAML.Services = {};
})();

(function() {
  'use strict';

  RAML.Services.DataStore = function() {
    var store = {};

    return {
      get: function(key, validate) {
        var entry = store[key];
        if (!entry) {
          return;
        }

        if (validate === true) {
          entry.valid = validate;
        }

        if (entry.valid) {
          return entry.value;
        }
      },
      set: function(key, value) {
        store[key] = {
          valid: true,
          value: value
        };
      },
      invalidate: function() {
        Object.keys(store).forEach(function(key) {
          store[key].valid = false;
        });
      }
    };
  };
})();

(function() {
  'use strict';

  RAML.Services.RAMLParserWrapper = function($rootScope, ramlParser, $q) {
    var ramlProcessor, errorProcessor, whenParsed, PARSE_SUCCESS = 'event:raml-parsed';

    var load = function(file) {
      setPromise(ramlParser.loadFile(file));
    };

    var parse = function(raml) {
      setPromise(ramlParser.load(raml));
    };

    var onParseSuccess = function(cb) {
      ramlProcessor = function() {
        cb.apply(this, arguments);
        if (!$rootScope.$$phase) {
          // handle aggressive digesters!
          $rootScope.$digest();
        }
      };

      if (whenParsed) {
        whenParsed.then(ramlProcessor);
      }
    };

    var onParseError = function(cb) {
      errorProcessor = function() {
        cb.apply(this, arguments);
        if (!$rootScope.$$phase) {
          // handle aggressive digesters!
          $rootScope.$digest();
        }
      };

      if (whenParsed) {
        whenParsed.then(undefined, errorProcessor);
      }

    };

    var setPromise = function(promise) {
      whenParsed = promise;

      if (ramlProcessor || errorProcessor) {
        whenParsed.then(ramlProcessor, errorProcessor);
      }
    };

    $rootScope.$on(PARSE_SUCCESS, function(e, raml) {
      setPromise($q.when(raml));
    });

    return {
      load: load,
      parse: parse,
      onParseSuccess: onParseSuccess,
      onParseError: onParseError
    };
  };
})();

'use strict';

(function() {
  RAML.Settings = RAML.Settings || {};

  var location = window.location;

  var uri = location.protocol + '//' + location.host + location.pathname + 'authentication/oauth2.html';
  RAML.Settings.oauth2RedirectUri = RAML.Settings.oauth2RedirectUri || uri;
  RAML.Settings.oauth1RedirectUri = RAML.Settings.oauth1RedirectUri || uri.replace(/oauth2\.html$/, 'oauth1.html');

  // RAML.Settings.proxy = RAML.Settings.proxy || '/proxy/';
})();

(function() {
  'use strict';

  function Clone() {}

  RAML.Utils = {
    clone: function(object) {
      Clone.prototype = object;
      return new Clone();
    },

    copy: function(object) {
      var copiedObject = {};
      for (var key in object) {
        copiedObject[key] = object[key];
      }
      return copiedObject;
    },

    isEmpty: function(object) {
      if (object) {
        return Object.keys(object).length === 0;
      } else {
        return true;
      }
    }
  };
})();

'use strict';

(function() {
  var module = angular.module('raml', []);

  module.factory('ramlParser', function () {
    return RAML.Parser;
  });

})();

'use strict';

(function() {
  var module = angular.module('ramlConsoleApp', ['raml', 'ngSanitize']);

  module.directive('apiResources', RAML.Directives.apiResources);
  module.directive('basicAuth', RAML.Directives.basicAuth);
  module.directive('bodyContent', RAML.Directives.bodyContent);
  module.directive('codeMirror', RAML.Directives.codeMirror);
  module.directive('collapsible', RAML.Directives.collapsible);
  module.directive('collapsibleContent', RAML.Directives.collapsibleContent);
  module.directive('collapsibleToggle', RAML.Directives.collapsibleToggle);
  module.directive('documentation', RAML.Directives.documentation);
  module.directive('enum', RAML.Directives.enum);
  module.directive('input', RAML.Directives.input);
  module.directive('markdown', RAML.Directives.markdown);
  module.directive('method', RAML.Directives.method);
  module.directive('namedParameters', RAML.Directives.namedParameters);
  module.directive('namedParametersDocumentation', RAML.Directives.namedParametersDocumentation);
  module.directive('oauth1', RAML.Directives.oauth1);
  module.directive('oauth2', RAML.Directives.oauth2);
  module.directive('parameterFields', RAML.Directives.parameterFields);
  module.directive('parameterizedParameter', RAML.Directives.parameterizedParameter);
  module.directive('parameters', RAML.Directives.parameters);
  module.directive('pathBuilder', RAML.Directives.pathBuilder);
  module.directive('ramlConsole', RAML.Directives.ramlConsole);
  module.directive('ramlConsoleInitializer', RAML.Directives.ramlConsoleInitializer);
  module.directive('requests', RAML.Directives.requests);
  module.directive('repeatable', RAML.Directives.repeatable);
  module.directive('repeatableAdd', RAML.Directives.repeatableAdd);
  module.directive('repeatableRemove', RAML.Directives.repeatableRemove);
  module.directive('resource', RAML.Directives.resource);
  module.directive('responses', RAML.Directives.responses);
  module.directive('rootDocumentation', RAML.Directives.rootDocumentation);
  module.directive('securitySchemes', RAML.Directives.securitySchemes);
  module.directive('tab', RAML.Directives.tab);
  module.directive('tabset', RAML.Directives.tabset);
  module.directive('tryIt', RAML.Directives.tryIt);
  module.directive('validatedInput', RAML.Directives.validatedInput);

  module.controller('TryItController', RAML.Controllers.tryIt);

  module.service('DataStore', RAML.Services.DataStore);
  module.service('ramlParserWrapper', RAML.Services.RAMLParserWrapper);

  module.filter('nameFromParameterizable', RAML.Filters.nameFromParameterizable);
  module.filter('yesNo', RAML.Filters.yesNo);
})();

angular.module('ramlConsoleApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/api_resources.tmpl.html',
    "<div id=\"raml-console-api-reference\" role=\"resources\">\n" +
    "  <div collapsible role=\"resource-group\" class=\"resource-group\" ng-repeat=\"resourceGroup in api.resourceGroups\">\n" +
    "    <h1 collapsible-toggle class='path'>\n" +
    "      {{resourceGroup[0].pathSegments[0].toString()}}\n" +
    "      <i ng-class=\"{'icon-caret-right': collapsed, 'icon-caret-down': !collapsed}\"></i>\n" +
    "    </h1>\n" +
    "\n" +
    "    <div collapsible-content>\n" +
    "      <resource ng-repeat=\"resource in resourceGroup\"></resource>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/basic_auth.tmpl.html',
    "<fieldset class=\"labelled-inline\" role=\"basic\">\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"username\">Username:</label>\n" +
    "    <input type=\"text\" name=\"username\" ng-model='credentials.username'/>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"password\">Password:</label>\n" +
    "    <input type=\"password\" name=\"password\" ng-model='credentials.password'/>\n" +
    "  </div>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/body_content.tmpl.html',
    "<div class=\"request-body\" ng-show=\"body\">\n" +
    "  <fieldset class=\"bordered\">\n" +
    "    <legend>Body</legend>\n" +
    "\n" +
    "    <fieldset class=\"labelled-radio-group\" role=\"media-types\">\n" +
    "      <label>Content Type</label>\n" +
    "      <div class=\"radio-group\">\n" +
    "        <label class=\"radio\" ng-repeat=\"contentType in body.contentTypes\">\n" +
    "          <input type=\"radio\" name=\"media-type\" value=\"{{contentType}}\" ng-model=\"body.selected\">\n" +
    "          {{contentType}}\n" +
    "        </label>\n" +
    "      </div>\n" +
    "    </fieldset>\n" +
    "\n" +
    "    <div ng-repeat=\"contentType in body.contentTypes\">\n" +
    "      <div class=\"labelled-inline\" ng-if='body.isForm(contentType)' ng-show=\"body.isSelected(contentType)\">\n" +
    "        <parameter-fields parameters='body.definitions[contentType]'></parameter-fields>\n" +
    "      </div>\n" +
    "      <div ng-if=\"!body.isForm(contentType)\" ng-show=\"body.isSelected(contentType)\">\n" +
    "        <textarea name=\"{{contentType}}\" ng-model=\"body.definitions[contentType].value\"></textarea>\n" +
    "        <a href=\"#\" class=\"body-prefill\" ng-show=\"body.hasExample(contentType)\" ng-click=\"body.fillWithExample($event)\">Prefill with example</a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </fieldset>\n" +
    "</div>\n"
  );


  $templateCache.put('views/documentation.tmpl.html',
    "<section class='documentation' role='documentation'>\n" +
    "  <ul role=\"traits\" class=\"modifiers\">\n" +
    "    <li class=\"trait\" ng-repeat=\"trait in documentation.traits()\">\n" +
    "      {{trait|nameFromParameterizable}}\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div role=\"full-description\" class=\"description\"\n" +
    "       ng-if=\"method.description\"\n" +
    "       markdown=\"method.description\">\n" +
    "  </div>\n" +
    "\n" +
    "  <tabset key-base='{{methodView.methodKey()}}'>\n" +
    "    <tab role='documentation-requests' heading=\"Request\" active='documentation.requestsActive' disabled=\"!documentation.hasRequestDocumentation()\">\n" +
    "      <parameters></parameters>\n" +
    "      <requests></requests>\n" +
    "    </tab>\n" +
    "    <tab role='documentation-responses' class=\"responses\" heading=\"Responses\" active='documentation.responsesActive' disabled='!documentation.hasResponseDocumentation()'>\n" +
    "      <responses></responses>\n" +
    "    </tab>\n" +
    "    <tab role=\"try-it\" heading=\"Try It\" active=\"documentation.tryItActive\" disabled=\"!ramlConsole.tryItEnabled()\">\n" +
    "      <try-it></try-it>\n" +
    "    </tab>\n" +
    "  </tabset>\n" +
    "</section>\n"
  );


  $templateCache.put('views/enum.tmpl.html',
    "<div class=\"autocomplete\">\n" +
    "  <span ng-transclude></span>\n" +
    "  <ul ng-show=\"focused\">\n" +
    "    <li ng-click='selectItem(item)' ng-class=\"{ selected: $index == selectedIndex }\" ng-repeat=\"item in filteredEnum\">\n" +
    "      {{item}}\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n"
  );


  $templateCache.put('views/method.tmpl.html',
    "<div class='method' role=\"method\" ng-class=\"methodView.cssClass()\">\n" +
    "  <div class='accordion-toggle method-summary' role=\"methodSummary\" ng-class='method.method' ng-click='methodView.toggleExpansion($event)'>\n" +
    "    <span role=\"verb\" class='method-name' ng-class='method.method'>{{method.method}}</span>\n" +
    "    <div class='filler' ng-show='methodView.expanded' ng-class='method.method'></div>\n" +
    "\n" +
    "    <div role=\"description\" ng-if=\"!methodView.expanded\">\n" +
    "       <div class='abbreviated-description' markdown='method.description'></div>\n" +
    "       <i class='icon-caret-right'></i>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-show='methodView.expanded'>\n" +
    "    <documentation></documentation>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/named_parameters.tmpl.html',
    "<fieldset class='labelled-inline bordered' ng-show=\"displayParameters()\">\n" +
    "  <legend>{{heading}}</legend>\n" +
    "  <parameter-fields parameters=\"parameters\"></parameter-fields>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/named_parameters_documentation.tmpl.html',
    "<section class='named-parameters' ng-if='!namedParametersDocumentation.isEmpty(parameters)'>\n" +
    "  <h2>{{heading}}</h2>\n" +
    "  <section role='parameter' class='parameter' ng-repeat='parameter in parameters'>\n" +
    "    <div ng-repeat=\"definition in parameter\">\n" +
    "      <h4 class='strip-whitespace'>\n" +
    "        <span role=\"display-name\">{{definition.displayName}}</span>\n" +
    "        <span class=\"constraints\">{{namedParametersDocumentation.constraints(definition)}}</span>\n" +
    "      </h4>\n" +
    "\n" +
    "      <div class=\"info\">\n" +
    "        <div ng-if=\"definition.example\"><span class=\"label\">Example:</span> <code class=\"well\" role=\"example\">{{definition.example}}</code></div>\n" +
    "        <div role=\"description\" markdown=\"definition.description\"></div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "</section>\n"
  );


  $templateCache.put('views/oauth1.tmpl.html',
    "<fieldset class=\"labelled-inline\" role=\"oauth1\">\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"consumerKey\">Consumer Key:</label>\n" +
    "    <input type=\"text\" name=\"consumerKey\" ng-model='credentials.consumerKey'/>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"consumerSecret\">Consumer Secret:</label>\n" +
    "    <input type=\"password\" name=\"consumerSecret\" ng-model='credentials.consumerSecret'/>\n" +
    "  </div>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/oauth2.tmpl.html',
    "<fieldset class=\"labelled-inline\" role=\"oauth2\">\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"clientId\">Client ID:</label>\n" +
    "    <input type=\"text\" name=\"clientId\" ng-model='credentials.clientId'/>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"clientSecret\">Client Secret:</label>\n" +
    "    <input type=\"password\" name=\"clientSecret\" ng-model='credentials.clientSecret'/>\n" +
    "  </div>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/parameter_fields.tmpl.html',
    "<fieldset>\n" +
    "  <div ng-repeat=\"(parameterName, parameter) in parameters.plain track by parameterName\">\n" +
    "    <div class=\"parameter-field\" ng-repeat=\"definition in parameter.definitions\" ng-show=\"parameter.isSelected(definition)\">\n" +
    "      <div repeatable=\"definition.repeat\" repeatable-model=\"parameters.values[parameterName]\">\n" +
    "        <div class=\"control-group\">\n" +
    "          <label for=\"{{parameterName}}\">\n" +
    "            <span class=\"required\" ng-if=\"definition.required\">*</span>\n" +
    "            {{definition.displayName}}:\n" +
    "          </label>\n" +
    "          <ng-switch on='parameterFields.inputView(definition)'>\n" +
    "            <span ng-switch-when=\"file\">\n" +
    "              <input name=\"{{parameterName}}\" type='file' ng-model='repeatableModel[$index]'/>\n" +
    "            </span>\n" +
    "            <span ng-switch-when=\"enum\">\n" +
    "              <enum options='definition.enum' model='repeatableModel[$index]'>\n" +
    "                <input validated-input name=\"{{parameterName}}\" type='text' ng-model='repeatableModel[$index]' placeholder='{{definition.example}}' ng-trim=\"false\" constraints='definition'/>\n" +
    "              </enum>\n" +
    "           </span>\n" +
    "            <span ng-switch-default>\n" +
    "              <input validated-input name=\"{{parameterName}}\" type='text' ng-model='repeatableModel[$index]' placeholder='{{definition.example}}' ng-trim=\"false\" constraints='definition'/>\n" +
    "            </span>\n" +
    "          </ng-switch>\n" +
    "          <repeatable-remove></repeatable-remove>\n" +
    "          <repeatable-add></repeatable-add>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"parameter-type\" ng-if=\"parameter.hasMultipleTypes()\">\n" +
    "      as\n" +
    "      <select class=\"form-control\" ng-model=\"parameter.selected\" ng-options=\"definition.type as definition.type for definition in parameter.definitions\"></select>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"parameter-factory\" ng-repeat='(name, _) in parameters.parameterized'>\n" +
    "    <parameterized-parameter parameter-name=\"name\" parameters=\"parameters\"></parameterized-parameter>\n" +
    "  </div>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/parameterized_parameter.tmpl.html',
    "<div class=\"labelled-inline\">\n" +
    "  <label for=\"{{parameterName}}\">{{parameterName}}:</label>\n" +
    "  <a href='#' role=\"open-factory\" ng-click=\"parameterFactory.open($event)\" ng-hide=\"parameterFactory.opened\">Add Header<i class='icon icon-plus-sign-alt'></i></a>\n" +
    "  <span ng-show=\"parameterFactory.opened\">\n" +
    "    <input type=\"text\" name=\"{{parameterName}}\" ng-model=\"parameterFactory.value\" ng-class=\"parameterFactory.status\"/>\n" +
    "    <a href='#' role='create-parameter' ng-click=\"parameterFactory.create($event)\"><i class='icon icon-plus-sign-alt'></i></a>\n" +
    "  </span>\n" +
    "</div>\n"
  );


  $templateCache.put('views/parameters.tmpl.html',
    "<named-parameters-documentation heading='Headers' role='parameter-group' parameters='plainAndParameterizedHeaders'></named-parameters-documentation>\n" +
    "\n" +
    "<named-parameters-documentation heading='URI Parameters' role='parameter-group' parameters='resource.uriParametersForDocumentation'></named-parameters-documentation>\n" +
    "\n" +
    "<named-parameters-documentation heading='Query Parameters' role='parameter-group' parameters='method.queryParameters'></named-parameters-documentation>\n"
  );


  $templateCache.put('views/path_builder.tmpl.html',
    "<span role=\"path\" class=\"path\">\n" +
    "  <span clsas=\"segment\">\n" +
    "    <span ng-repeat='token in api.baseUri.tokens track by $index'>\n" +
    "      <input type='text' validated-input ng-if='api.baseUri.parameters[token]'\n" +
    "                             name=\"{{token}}\"\n" +
    "                             ng-model=\"pathBuilder.baseUriContext[token]\"\n" +
    "                             placeholder=\"{{token}}\"\n" +
    "                             constraints=\"api.baseUri.parameters[token]\"\n" +
    "                             invalid-class=\"error\"/>\n" +
    "      <span class=\"segment\" ng-if=\"!api.baseUri.parameters[token]\">{{token}}</span>\n" +
    "    </span>\n" +
    "  <span role='segment' ng-repeat='segment in resource.pathSegments' ng-init=\"$segmentIndex = $index\">\n" +
    "    <span ng-repeat='token in segment.tokens track by $index'>\n" +
    "      <input type='text' validated-input ng-if='segment.parameters[token]'\n" +
    "                             name=\"{{token}}\"\n" +
    "                             ng-model=\"pathBuilder.segmentContexts[$segmentIndex][token]\"\n" +
    "                             placeholder=\"{{token}}\"\n" +
    "                             constraints=\"segment.parameters[token]\"\n" +
    "                             invalid-class=\"error\"/>\n" +
    "      <span class=\"segment\" ng-if=\"!segment.parameters[token]\">{{token}}</span>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</span>\n"
  );


  $templateCache.put('views/raml-console.tmpl.html',
    "<article role=\"api-console\" id=\"raml-console\">\n" +
    "  <div role=\"error\" ng-if=\"parseError\">\n" +
    "    {{parseError}}\n" +
    "  </div>\n" +
    "\n" +
    "  <header id=\"raml-console-api-title\">{{api.title}}</header>\n" +
    "\n" +
    "  <nav id=\"raml-console-main-nav\" ng-if='ramlConsole.showRootDocumentation()' ng-switch='ramlConsole.view'>\n" +
    "    <a class=\"btn\" ng-switch-when='rootDocumentation' role=\"view-api-reference\" ng-click='ramlConsole.gotoView(\"apiReference\")'>&larr; API Reference</a>\n" +
    "    <a class=\"btn\" ng-switch-default role=\"view-root-documentation\" ng-click='ramlConsole.gotoView(\"rootDocumentation\")'>Documentation &rarr;</a>\n" +
    "  </nav>\n" +
    "\n" +
    "  <div id=\"raml-console-content\" ng-switch='ramlConsole.view'>\n" +
    "    <div ng-switch-when='rootDocumentation'>\n" +
    "      <root-documentation></root-documentation>\n" +
    "    </div>\n" +
    "    <div ng-switch-default>\n" +
    "      <api-resources></api-resources>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</article>\n"
  );


  $templateCache.put('views/repeatable.tmpl.html',
    "<div ng-if=\"repeatable\" ng-repeat=\"model in repeatableModel track by $index\">\n" +
    "  <div ng-transclude></div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"!repeatable\">\n" +
    "  <div ng-transclude></div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/requests.tmpl.html',
    "<h2 ng-if=\"method.body\">Body</h2>\n" +
    "<section ng-repeat=\"(mediaType, definition) in method.body track by mediaType\">\n" +
    "  <h4>{{mediaType}}</h4>\n" +
    "  <div ng-switch=\"mediaType\">\n" +
    "    <named-parameters-documentation ng-switch-when=\"application/x-www-form-urlencoded\" role='parameter-group' parameters='definition.formParameters'></named-parameters-documentation>\n" +
    "    <named-parameters-documentation ng-switch-when=\"multipart/form-data\" role='parameter-group' parameters='definition.formParameters'></named-parameters-documentation>\n" +
    "    <div ng-switch-default>\n" +
    "      <section ng-if=\"definition.schema\">\n" +
    "        <h5>Schema</h5>\n" +
    "        <div class=\"code\" code-mirror=\"definition.schema\" mode=\"{{mediaType}}\" visible=\"methodView.expanded && documentation.requestsActive\"></div>\n" +
    "      </section>\n" +
    "      <section ng-if=\"definition.example\">\n" +
    "        <h5>Example</h5>\n" +
    "        <div class=\"code\" code-mirror=\"definition.example\" mode=\"{{mediaType}}\" visible=\"methodView.expanded && documentation.requestsActive\"></div>\n" +
    "      </section>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</section>\n"
  );


  $templateCache.put('views/resource.tmpl.html',
    "<div ng-class=\"{expanded: resourceView.expanded, collapsed: !resourceView.expanded}\"\n" +
    "     class='resource' role=\"resource\">\n" +
    "\n" +
    "  <div class='summary accordion-toggle' role='resource-summary' ng-click='resourceView.toggleExpansion()'>\n" +
    "    <ul class=\"modifiers\">\n" +
    "      <li class=\"trait\" ng-show='resourceView.expanded' role=\"trait\" ng-repeat=\"trait in resource.traits\">\n" +
    "        {{trait | nameFromParameterizable}}\n" +
    "      </li>\n" +
    "      <li class=\"resource-type\" role=\"resource-type\" ng-if='resource.resourceType'>\n" +
    "        {{resource.resourceType | nameFromParameterizable}}\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <h3 class=\"path\">\n" +
    "      <span role='segment' ng-repeat='segment in resource.pathSegments'>{{segment.toString()}} </span>\n" +
    "    </h3>\n" +
    "    <ul class='methods' role=\"methods\" ng-if=\"resource.methods\" ng-hide=\"resourceView.expanded\">\n" +
    "      <li class='method-name' ng-class='method.method'\n" +
    "          ng-click='resourceView.expandMethod(method)' ng-repeat=\"method in resource.methods\">{{method.method}}</li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-if='resourceView.expanded'>\n" +
    "    <div>\n" +
    "      <div role='description'\n" +
    "           class='description'\n" +
    "           ng-if='resource.description'\n" +
    "           markdown='resource.description'>\n" +
    "      </div>\n" +
    "      <div class='accordion' role=\"methods\">\n" +
    "        <method ng-repeat=\"method in resource.methods\"></method>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/responses.tmpl.html',
    "<section collapsible collapsed ng-repeat='(responseCode, response) in method.responses'>\n" +
    "  <h2 role=\"response-code\" collapsible-toggle>\n" +
    "    <a href=''>\n" +
    "      <i ng-class=\"{'icon-caret-right': collapsed, 'icon-caret-down': !collapsed}\"></i>\n" +
    "      {{responseCode}}\n" +
    "    </a>\n" +
    "    <div ng-if=\"collapsed\" class=\"abbreviated-description\" markdown='response.description'></div>\n" +
    "  </h2>\n" +
    "  <div collapsible-content>\n" +
    "    <section role='response'>\n" +
    "      <div markdown='response.description'></div>\n" +
    "      <named-parameters-documentation heading='Headers' role='parameter-group' parameters='response.headers'></named-parameters-documentation>\n" +
    "      <h3 ng-show=\"response.body\">Body</h3>\n" +
    "      <section ng-repeat=\"(mediaType, definition) in response.body track by mediaType\">\n" +
    "        <h4>{{mediaType}}</h4>\n" +
    "        <section ng-if=\"definition.schema\">\n" +
    "          <h5>Schema</h5>\n" +
    "          <div class=\"code\" mode='{{mediaType}}' code-mirror=\"definition.schema\" visible=\"methodView.expanded && !collapsed\"></div>\n" +
    "        </section>\n" +
    "        <section ng-if=\"definition.example\">\n" +
    "          <h5>Example</h5>\n" +
    "          <div class=\"code\" mode='{{mediaType}}' code-mirror=\"definition.example\" visible=\"methodView.expanded && !collapsed\"></div>\n" +
    "        </section>\n" +
    "      </section>\n" +
    "    </section>\n" +
    "  </div>\n" +
    "</section>\n"
  );


  $templateCache.put('views/root_documentation.tmpl.html',
    "<div role=\"root-documentation\">\n" +
    "  <section collapsible collapsed ng-repeat=\"document in api.documentation\">\n" +
    "    <h2 collapsible-toggle>{{document.title}}</h2>\n" +
    "    <div collapsible-content class=\"content\">\n" +
    "      <div markdown='document.content'></div>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "</div>\n"
  );


  $templateCache.put('views/security_schemes.tmpl.html',
    "<div class=\"authentication\">\n" +
    "  <fieldset class=\"labelled-radio-group bordered\">\n" +
    "    <legend>Authentication</legend>\n" +
    "    <label for=\"scheme\">Type:</label>\n" +
    "\n" +
    "    <div class=\"radio-group\">\n" +
    "      <label class=\"radio\">\n" +
    "        <input type=\"radio\" name=\"scheme\" value=\"anonymous\" ng-model=\"keychain.selectedScheme\"> Anonymous </input>\n" +
    "      </label>\n" +
    "      <span ng-repeat=\"(name, scheme) in schemes\">\n" +
    "        <label class=\"radio\"  ng-if=\"securitySchemes.supports(scheme)\">\n" +
    "          <input type=\"radio\" name=\"scheme\" value=\"{{name}}\" ng-model=\"keychain.selectedScheme\"> {{ name }} </input>\n" +
    "        </label>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </fieldset>\n" +
    "\n" +
    "  <div ng-repeat=\"(name, scheme) in schemes\">\n" +
    "    <div ng-show=\"keychain.selectedScheme == name\">\n" +
    "      <div ng-switch=\"scheme.type\">\n" +
    "        <basic-auth ng-switch-when=\"Basic Authentication\" credentials='keychain[name]'></basic-auth>\n" +
    "        <oauth1 ng-switch-when=\"OAuth 1.0\" credentials='keychain[name]'></oauth1>\n" +
    "        <oauth2 ng-switch-when=\"OAuth 2.0\" credentials='keychain[name]'></oauth2>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/tab.tmpl.html',
    "<div class=\"tab-pane\" ng-class=\"{active: active, disabled: disabled}\" ng-show=\"active\" ng-transclude>\n" +
    "\n" +
    "</div>\n"
  );


  $templateCache.put('views/tabset.tmpl.html',
    "<div class=\"tabbable\">\n" +
    "  <ul class=\"nav nav-tabs\">\n" +
    "    <li ng-repeat=\"tab in tabs\" ng-class=\"{active: tab.active, disabled: tab.disabled}\">\n" +
    "      <a ng-click=\"tabset.select(tab)\">{{tab.heading}}</a>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div class=\"tab-content\" ng-transclude></div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/try_it.tmpl.html',
    "<section class=\"try-it\">\n" +
    "\n" +
    "  <form>\n" +
    "    <path-builder></path-builder>\n" +
    "\n" +
    "    <security-schemes ng-if=\"apiClient.securitySchemes\" schemes=\"apiClient.securitySchemes\" keychain=\"ramlConsole.keychain\"></security-schemes>\n" +
    "    <named-parameters heading=\"Headers\" parameters=\"context.headers\"></named-parameters>\n" +
    "    <named-parameters heading=\"Query Parameters\" parameters=\"context.queryParameters\"></named-parameters>\n" +
    "    <body-content body=\"context.bodyContent\"></body-content>\n" +
    "\n" +
    "\n" +
    "    <div class=\"form-actions\">\n" +
    "      <i ng-show='apiClient.inProgress()' class=\"icon-spinner icon-spin icon-large\"></i>\n" +
    "\n" +
    "      <div role=\"error\" class=\"error\" ng-show=\"apiClient.missingUriParameters\">\n" +
    "        Required URI Parameters must be entered\n" +
    "      </div>\n" +
    "      <div role=\"warning\" class=\"warning\" ng-show=\"apiClient.disallowedAnonymousRequest\">\n" +
    "        Successful responses require authentication\n" +
    "      </div>\n" +
    "      <button role=\"try-it\" ng-class=\"'btn-' + method.method\" ng-click=\"apiClient.execute()\">\n" +
    "        {{method.method}}\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "\n" +
    "  <div class=\"response\" ng-if=\"apiClient.response\">\n" +
    "    <h4>Response</h4>\n" +
    "    <div class=\"request-url\">\n" +
    "      <h5>Request URL</h5>\n" +
    "      <code class=\"response-value\">{{apiClient.response.requestUrl}}</code>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"status\">\n" +
    "      <h5>Status</h5>\n" +
    "      <code class=\"response-value\">{{apiClient.response.status}}</code>\n" +
    "    </div>\n" +
    "    <div class=\"headers\">\n" +
    "      <h5>Headers</h5>\n" +
    "      <ul class=\"response-value\">\n" +
    "        <li ng-repeat=\"(header, value) in apiClient.response.headers track by header\">\n" +
    "          <code>\n" +
    "            <span class=\"header-key\">{{header}}:</span>\n" +
    "            <span class=\"header-value\">{{value}}</span>\n" +
    "          </code>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "    <div class=\"body\">\n" +
    "      <h5>Body</h5>\n" +
    "      <div class=\"response-value\">\n" +
    "        <div class=\"code\" mode='{{apiClient.response.contentType}}' code-mirror=\"apiClient.response.body\" visible=\"apiClient.response.body\"></div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</section>\n"
  );

}]);
