(function() { 
 'use strict';

var $inactiveElements = jQuery('.tab').add('.resource').add('li');

var completeAnimation = function (element) {
  jQuery(element).removeAttr('style');
}

var findTab = function (element) {
  return jQuery(element).closest('.resource')
    .find('.tab-list')
    .children()
    .first();
};

jQuery('.resource-heading')
  .on('mouseenter', function () {
    findTab(this).addClass('is-hovered');
  }).on('mouseleave', function () {
    findTab(this).removeClass('is-hovered');
  }).on('click', function () {
    findTab(this).trigger('click');
  });

jQuery('.tab').on('click', function (ev) {
  var $this = jQuery(this);
  var $resource = $this.closest('.resource'); // <header>.resource
  var $resourceListItem = $resource.parent('li'); //li contains <header>.resource
  var $closingEl;

  ev.preventDefault();

  if (!$resource.hasClass('is-active')) {
    $closingEl = $inactiveElements
      .filter('.is-active')
      .children('.resource-panel');

    $closingEl.velocity('slideUp');

    $resourceListItem
      .children('.resource-panel')
      .velocity('slideDown');

    $inactiveElements.removeClass('is-active');

    $resource
      .add($resourceListItem)
      .add($this)
      .addClass('is-active');
  } else if (jQuery(this).hasClass('is-active')) {
    $resource.find('.resource-close-btn').trigger('click');
  } else {
    jQuery(this).addClass('is-active');
    jQuery(this).siblings('.tab').removeClass('is-active');
  }
});

jQuery('.resource-close-btn').on('click', function (ev) {
  var $this = jQuery(this);
  var $resource = $this.closest('.resource');
  var $resourceListItem = $resource.parent('li');

  $resourceListItem
    .children('.resource-panel')
    .velocity('slideUp');

  $inactiveElements.removeClass('is-active');
});

jQuery('.resource-root-toggle').on('click', function (ev) {
  var $this = jQuery(this);
  var $section = $this
    .closest('.resource-list-item')
    .find('.resource-list');

  if ($section.hasClass('is-collapsed')) {
    $section.velocity('slideDown', {
      duration: 200
    });
  } else {
    $section.velocity('slideUp', {
      duration: 200
    });
  }

  $section.toggleClass('is-collapsed');
  $this.toggleClass('is-active');
});

jQuery('.js-sidebar-collapse-toggle').on('click', function () {
  var $panel = jQuery(this).closest('.resource-panel');
  var $panelContent = $panel.find('.resource-panel-primary');
  var $sidebar = $panel.find('.sidebar');
  var $sidebarContent = $panel.find('.sidebar-content');

  if ($sidebar.hasClass('is-collapsed')) {
    $sidebar.velocity(
      { width: 430 },
      {
        duration: 200,
        complete: completeAnimation
      }
    );

    $panelContent.velocity(
      { "padding-left": 430 },
      {
        duration: 200,
        complete: completeAnimation
      }
    );
  } else {
    $sidebar.velocity(
      { width: 0 },
      {
        duration: 200,
        complete: completeAnimation
      }
    );

    $panelContent.velocity(
      { "padding-left": 0 },
      {
        duration: 200,
        complete: completeAnimation
      }
    );
  }

  $sidebar.toggleClass('is-collapsed');
  $panel.toggleClass('has-sidebar-collapsed');
});

jQuery('.js-sidebar-fullscreen').on('click', function (ev) {
  ev.preventDefault();

  var $panel = jQuery(this).closest('.resource-panel');
  var $sidebar = $panel.find('.sidebar');
  var $sidebarContent = $panel.find('.sidebar-content');
  var sidebarWidth = 0;

  if (jQuery(window).width() > 960) {
    sidebarWidth = 430;
  }

  if ($sidebar.hasClass('is-fullscreen')) {
    $sidebar.velocity(
      { width: sidebarWidth },
      {
        duration: 200,
        complete: completeAnimation
      }
    );
  } else {
    $sidebar.velocity(
      { width: '100%' },
      {
        duration: 200,
        complete: completeAnimation
      }
    );
  }

  $sidebar.toggleClass('is-fullscreen');
  $panel.toggleClass('has-sidebar-fullscreen');
});


jQuery('.toggle-tabs').on('click', function(ev) {
  var $this = jQuery(this);
  var $eachTab = $this.children('.toggle-tab');
  var $panel = $this.closest('.resource-panel');
  var $eachContent = $panel.find('.resource-panel-content');

  $eachTab.toggleClass('is-active');
  $eachContent.toggleClass('is-active');
});

$('.js-schema-toggle').on('click', function (ev) {
  var $this = jQuery(this);
  var $panel = $this.closest('.resource-panel');
  var $schema = $panel.find('.resource-pre-toggle');

  $this.toggleClass('is-active');

  if (!$schema.hasClass('is-active')) {
    $schema
      .addClass('is-active')
      .velocity('slideDown');
  } else {
    $schema
      .removeClass('is-active')
      .velocity('slideUp');
  }
});

jQuery('.js-toggle-request-metadata').on('click', function(ev) {
  var $this = jQuery(this);
  var $panel = $this.closest('.resource-panel');
  var $metadata = $panel.find('.sidebar-request-metadata');

  $metadata.toggleClass('is-active');

  if (!$metadata.hasClass('is-active')) {
    $this.removeClass('is-open');
    $this.addClass('is-collapsed');
  } else {
    $this.removeClass('is-collapsed');
    $this.addClass('is-open');
  }
});

//// CODE ////

// The RAML object is being created by the RAML Parser lib
RAML.Directives = {};
RAML.Services = {};
RAML.Filters = {};

angular.module('RAML.Directives', []);
angular.module('RAML.Services', ['raml']);
angular.module('ramlConsole', ['RAML.Directives', 'RAML.Services']);

RAML.Directives.spinner = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'common/spinner.tpl.html',
    replace: true,
    link: function($scope, $element, attrs) {
      $scope.$on("loading-started", function(e) {
        $element.css({"display" : ""});
      });

      $scope.$on("loading-complete", function(e) {
        $element.css({"display" : "none"});
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('spinner', ['$window', RAML.Directives.spinner]);

RAML.Directives.theme = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'common/theme-switcher.tpl.html',
    replace: true,
    link: function($scope, $element, attrs) {
      $element.on('click', function(event) {
        var $link = jQuery('head link.theme');
        var theme = $link.attr('href');

        $link.attr('href', 'styles/light-theme.css');
        $element.removeClass('theme-toggle-dark');

        if (theme === 'styles/light-theme.css') {
          $link.attr('href', 'styles/dark-theme.css');
          $element.addClass('theme-toggle-dark');
        }
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('themeSwitcher', ['$window', RAML.Directives.theme]);

RAML.Directives.resources = function(ramlParserWrapper) {
  return {
    restrict: 'E',
    templateUrl: 'resources/resources-list.tpl.html',
    replace: true,
    scope: {
        src: '@'
      },
    controller: function($scope, $element) {
      if ($scope.src) {
        ramlParserWrapper.load($scope.src);
      }
    },
    link: function($scope, $element) {
      ramlParserWrapper.onParseSuccess(function(raml) {
        $scope.raml = RAML.Inspector.create(raml);
        console.log($scope.raml);
      });

      ramlParserWrapper.onParseError(function(error) {
        // Show errors!!!
        // $scope.parseError = error;
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('ramlResources', RAML.Directives.resources);

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
      var baseUri = rootRAML.baseUri.toString().replace(/\/+$/, '');

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
      var request = RAML.Client.Request.create(settings.requestTokenUri, 'post');

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
      var request = RAML.Client.Request.create(settings.tokenCredentialsUri, 'post');

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
      parser.href = uri;

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
      var request = RAML.Client.Request.create(settings.accessTokenUri, 'post');

      request.data(credentialsManager.accessTokenParameters(code));

      return $.ajax(request.toOptions()).then(function(data) {
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
      var o = RAML.Utils.copy(options);
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

      if (!RAML.Services.Config.config.disableProxy && RAML.Settings.proxy) {
        o.url = RAML.Settings.proxy + o.url;
      }

      return o;
    };
  };

  RAML.Client.Request = {
    create: function(url, method) {
      return new RequestDsl({ url: url, type: method, contentType: false });
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

angular.module('raml', [])
  .factory('ramlParser', function () {
    return RAML.Parser;
  });

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
      var prefix = resource.pathSegments[0].toString();
      if (prefix === currentPrefix || prefix.indexOf(currentPrefix + '/') === 0) {
        resourceGroups[resourceGroups.length-1].push(resource);
      } else {
        currentPrefix = resource.pathSegments[0].toString();
        resourceGroups.push([resource]);
      }
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

      method.responseCodes = Object.keys(method.responses || {});
      method.securitySchemes = securitySchemesExtractor(securitySchemes);
      method.allowsAnonymousAccess = allowsAnonymousAccess;
      normalizeNamedParameters(method.headers);
      normalizeNamedParameters(method.queryParameters);

      method.headers = filterHeaders(method.headers);
      processBody(method.body || {});
      processResponses(method.responses || {});

      method.plainAndParameterizedHeaders = RAML.Utils.copy(method.headers.plain);
      Object.keys(method.headers.parameterized).forEach(function(parameterizedHeader) {
        method.plainAndParameterizedHeaders[parameterizedHeader] = method.headers.parameterized[parameterizedHeader].map(function(parameterized) {
          return parameterized.definition();
        });
      });

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

angular.module('RAML.Services')
  .service('ramlParserWrapper', RAML.Services.RAMLParserWrapper);

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

angular.module('ramlConsole').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('common/spinner.tpl.html',
    "<img src=\"img/spinner.gif\">\n"
  );


  $templateCache.put('common/theme-switcher.tpl.html',
    "<a class=\"theme-toggle\" href=\"#\">Switch Theme</a>\n"
  );


  $templateCache.put('resources/resources-list.tpl.html',
    "<main class=\"container primary\">\n" +
    "  <h1 class=\"title\">{{raml.title}}</h1>\n" +
    "\n" +
    "  <ol class=\"resource-list resource-list-root\">\n" +
    "    <li class=\"resource-list-item\" ng-repeat=\"resourceGroup in raml.resourceGroups\">\n" +
    "      <header class=\"resource resource-root clearfix\" ng-init=\"resource = resourceGroup[0]\">\n" +
    "        <div class=\"resource-path-container\">\n" +
    "          <button class=\"resource-root-toggle\">\n" +
    "            <span class=\"visuallyhidden\">See Nested Resources</span>\n" +
    "          </button>\n" +
    "\n" +
    "          <h2 class=\"resource-heading resource-heading-large\">\n" +
    "            <span class=\"resource-path-active\" ng-repeat='segment in resource.pathSegments'>{{segment.toString()}}</span>\n" +
    "          </h2>\n" +
    "\n" +
    "          <span ng-show=\"resource.resourceType\" class=\"flag resource-heading-flag resource-heading-flag-root\"><b>Type:</b> {{resource.resourceType}}</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"tab-list\">\n" +
    "          <a class=\"tab\" href=\"#\" ng-repeat=\"method in resource.methods\">\n" +
    "            <svg class=\"tab-image tab-{{method.method}}\">\n" +
    "              <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "            </svg>\n" +
    "\n" +
    "            <span class=\"tab-label\">{{method.method.toLocaleUpperCase()}}</span>\n" +
    "          </a>\n" +
    "        </div>\n" +
    "\n" +
    "        <button class=\"resource-close-btn\">\n" +
    "          Close\n" +
    "        </button>\n" +
    "      </header>\n" +
    "\n" +
    "      <!-- Child Resources -->\n" +
    "      <ol class=\"resource-list\">\n" +
    "        <li class=\"resource-list-item\" ng-repeat=\"resource in resourceGroup\" ng-if=\"!$first\">\n" +
    "          <div class=\"resource clearfix\">\n" +
    "            <div class=\"resource-path-container\">\n" +
    "              <h3 class=\"resource-heading\">\n" +
    "                <span ng-repeat-start='segment in resource.pathSegments' ng-if=\"!$last\">{{segment.toString()}}</span><span ng-repeat-end ng-if=\"$last\" class=\"resource-path-active\">{{segment.toString()}}</span>\n" +
    "              </h3>\n" +
    "\n" +
    "              <span ng-show=\"resource.resourceType\" class=\"flag resource-heading-flag\"><b>Type:</b> {{resource.resourceType}}</span>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"tab-list\">\n" +
    "              <a class=\"tab\" href=\"#\" ng-repeat=\"method in resource.methods\">\n" +
    "                <svg class=\"tab-image tab-{{method.method}}\">\n" +
    "                  <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                </svg>\n" +
    "\n" +
    "                <span class=\"tab-label\">{{method.method.toLocaleUpperCase()}}</span>\n" +
    "              </a>\n" +
    "            </div>\n" +
    "\n" +
    "            <button class=\"resource-close-btn\">\n" +
    "              Close\n" +
    "            </button>\n" +
    "          </div>\n" +
    "        </li>\n" +
    "      </ol>\n" +
    "\n" +
    "    </li>\n" +
    "  </ol>\n" +
    "\n" +
    "</main>\n"
  );

}]);
})();