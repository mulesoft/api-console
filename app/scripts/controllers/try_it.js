'use strict';

(function() {

  function filterEmpty(object) {
    var copy = {};

    Object.keys(object).forEach(function(key) {
      if (object[key] && (typeof object[key] !== 'string' || object[key].trim().length > 0)) {
        copy[key] = object[key];
      }
    });

    return copy;
  }

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

  var FORM_URLENCODED = 'application/x-www-form-urlencoded';
  var FORM_DATA = 'multipart/form-data';
  var apply;

  var TryIt = function($scope) {
    this.context = $scope.context = {};
    this.context.headers = new RAML.Controllers.TryIt.NamedParameters($scope.method.headers.plain, $scope.method.headers.parameterized);

    this.getPathBuilder = function() {
      return $scope.pathBuilder;
    };

    this.method = $scope.method;
    this.httpMethod = $scope.method.method;
    this.queryParameters = {};
    this.formParameters = {};
    this.mediaType = Object.keys($scope.method.body || {})[0];

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

  TryIt.prototype.fillBody = function($event) {
    $event.preventDefault();
    this.body = this.method.body[this.mediaType].example;
  };

  TryIt.prototype.bodyHasExample = function() {
    return !!this.method.body[this.mediaType];
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

      if (!RAML.Utils.isEmpty(filterEmpty(this.queryParameters))) {
        request.queryParams(filterEmpty(this.queryParameters));
      }

      if (!RAML.Utils.isEmpty(this.context.headers.data())) {
        request.headers(this.context.headers.data());
      }

      if (this.mediaType) {
        request.header('Content-Type', this.mediaType);
        if (this.mediaType === FORM_DATA || this.mediaType === FORM_URLENCODED) {
          if (!RAML.Utils.isEmpty(filterEmpty(this.formParameters))) {
            request.data(filterEmpty(this.formParameters));
          }
        } else {
          request.data(this.body);
        }
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
