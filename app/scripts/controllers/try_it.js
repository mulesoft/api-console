'use strict';

(function() {
  function isEmpty(object) {
    return Object.keys(object || {}).length === 0;
  }

  function filterEmpty(object) {
    var copy = {};

    Object.keys(object).forEach(function(key) {
      if (object[key] && object[key].trim().length > 0) {
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
    this.getPathBuilder = function() {
      return $scope.pathBuilder;
    };

    this.method = $scope.method;
    this.httpMethod = $scope.method.method;
    this.headers = {};
    this.queryParameters = {};
    this.formParameters = {};
    this.supportsCustomBody = this.supportsFormUrlencoded = this.supportsFormData = false;

    for (var mediaType in $scope.method.body) {
      this.supportsMediaType = true;

      if (mediaType === FORM_URLENCODED) {
        this.supportsFormUrlencoded = true;
      } else if (mediaType === FORM_DATA) {
        this.supportsFormData = true;
      } else {
        this.supportsCustomBody = true;
      }
    }

    $scope.apiClient = this;
    this.parsed = $scope.api;
    this.securitySchemes = $scope.method.securitySchemes();
    this.keychain = $scope.ramlConsole.keychain;

    apply = function() {
      $scope.$apply.apply($scope, arguments);
    };
  };

  TryIt.prototype.showBody = function() {
    return this.supportsCustomBody && !this.showUrlencodedForm() && !this.showMultipartForm();
  };

  TryIt.prototype.showUrlencodedForm = function() {
    if (this.mediaType) {
      return this.mediaType === FORM_URLENCODED;
    } else {
      return (!this.supportsCustomBody && this.supportsFormUrlencoded);
    }
  };

  TryIt.prototype.showMultipartForm = function() {
    if (this.mediaType) {
      return this.mediaType === FORM_DATA;
    } else  {
      return (!this.supportsCustomBody && !this.supportsFormUrlencoded && this.supportsFormData);
    }
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

      if (!isEmpty(this.queryParameters)) {
        request.data(filterEmpty(this.queryParameters));
      }

      if (!isEmpty(this.formParameters)) {
        request.data(filterEmpty(this.formParameters));
      }

      if (!isEmpty(this.headers)) {
        request.headers(filterEmpty(this.headers));
      }

      if (this.mediaType) {
        request.header('Content-Type', this.mediaType);
        if (this.showBody()) { request.data(this.body); }
      }

      var authStrategy;

      try {
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
