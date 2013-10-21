(function() {
  function parseHeaders(headers) {
    var parsed = {}, key, val, i;

    if (!headers) return parsed;

    headers.split('\n').forEach(function(line) {
      i = line.indexOf(':');
      key = line.substr(0, i).trim();
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

  function isEmpty(object) {
    return Object.keys(object || {}).length == 0;
  }

  TryIt = function($scope) {
    this.baseUri = $scope.api.baseUri || '';
    if (this.baseUri.match(/\{version\}/) && $scope.api.version) {
      this.baseUri = this.baseUri.replace(/\{version\}/g, $scope.api.version);
    }
    this.pathBuilder = $scope.method.pathBuilder;

    this.httpMethod = $scope.method.method;
    this.headers = {};
    this.queryParameters = {};
    this.formParameters = {};
    this.supportsCustomBody = this.supportsFormUrlencoded = this.supportsFormData = false;

    if ($scope.method.requiresBasicAuthentication()) {
      this.basicauth = {};
    }

    if ($scope.method.requiresOauth2()) {
      this.securityScheme = $scope.method.requiresOauth2();
      this.oauth2 = {};
    }

    for (mediaType in $scope.method.body) {
      this.supportsMediaType = true;

      if (mediaType == FORM_URLENCODED) {
        this.supportsFormUrlencoded = true;
      } else if (mediaType == FORM_DATA) {
        this.supportsFormData = true;
      } else {
        this.supportsCustomBody = true;
      }
    }

    $scope.apiClient = this;
    this.client = $scope.client = RAML.Client.create($scope.api)

    apply = function() {
      $scope.$apply.apply($scope, arguments);
    };
  };

  TryIt.prototype.showBody = function() {
    return this.supportsCustomBody && !this.showUrlencodedForm() && !this.showMultipartForm();
  }

  TryIt.prototype.showUrlencodedForm = function() {
    if (this.mediaType) {
      return this.mediaType == FORM_URLENCODED;
    } else {
      return (!this.supportsCustomBody && this.supportsFormUrlencoded);
    }
  }

  TryIt.prototype.showMultipartForm = function() {
    if (this.mediaType) {
      return this.mediaType == FORM_DATA
    } else  {
      return (!this.supportsCustomBody && !this.supportsFormUrlencoded && this.supportsFormData);
    }
  }

  TryIt.prototype.execute = function() {
    var response = this.response = {};
    var url = this.response.requestUrl = this.baseUri + this.pathBuilder(this.pathBuilder);
    if (RAML.Settings.proxy) {
      url = RAML.Settings.proxy + url;
    }
    var request = this.client.createRequest(url, this.httpMethod);

    function handleResponse(jqXhr) {
      response.body = jqXhr.responseText,
      response.status = jqXhr.status,
      response.headers = parseHeaders(jqXhr.getAllResponseHeaders());

      if (response.headers['Content-Type']) {
        response.contentType = response.headers['Content-Type'].split(';')[0];
      }
      apply();
    }

    if (!isEmpty(this.queryParameters)) {
      request.data(this.queryParameters);
    }

    if (!isEmpty(this.formParameters)) {
      request.data(this.formParameters);
    }

    if (!isEmpty(this.headers)) {
      request.headers(this.headers);
    }

    if (this.mediaType) {
      request.header("Content-Type", this.mediaType);
      if (this.showBody()) { request.data(this.body); }
    }

    var authStrategy = RAML.Client.AuthStrategies.anonymous();

    if (this.basicauth) {
      authStrategy = RAML.Client.AuthStrategies.basicAuth(this.basicauth);
    } else if (this.oauth2) {
      authStrategy = RAML.Client.AuthStrategies.oauth2(this.securityScheme, this.oauth2);
    }

    authStrategy.authenticate().then(function(token) {
      token.sign(request);
      $.ajax(request.toOptions()).then(
        function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
        function(jqXhr) { handleResponse(jqXhr); }
      );
    });
  };

  RAML.Controllers.TryIt = TryIt;
})();
