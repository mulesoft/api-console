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

  TryIt = function($scope, Base64) {
    this.baseUri = $scope.api.baseUri || '';
    this.pathBuilder = $scope.method.pathBuilder;

    this.encoder = Base64;
    this.httpMethod = $scope.method.method;
    this.headers = {};
    this.queryParameters = {};
    this.formParameters = {};
    this.supportsCustomBody = this.supportsFormUrlencoded = this.supportsFormData = false;

    if ($scope.method.requiresBasicAuthentication()) {
      this.basicauth = {};
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
      return (!this.suppoprtsCustomBody && !this.supportsFormUrlencoded && this.supportsFormData);
    }
  }

  TryIt.prototype.execute = function() {
    var response = this.response = {};
    var url = this.response.requestUrl = this.baseUri + this.pathBuilder(this.pathBuilder);
    var requestOptions = { url: url, type: this.httpMethod, headers: {} }

    function handleResponse(jqXhr) {
      this.requestInProgress = false;
      response.body = jqXhr.responseText,
      response.status = jqXhr.status,
      response.headers = parseHeaders(jqXhr.getAllResponseHeaders());

      if (response.headers['Content-Type']) {
        response.contentType = response.headers['Content-Type'].split(';')[0];
      }
      apply();
    }

    if (!isEmpty(this.queryParameters)) {
      requestOptions.data = this.queryParameters;
    }

    if (!isEmpty(this.formParameters)) {
      requestOptions.data = this.formParameters;
    }

    if (!isEmpty(this.headers)) {
      requestOptions.headers = this.headers;
    }

    if (this.mediaType) {
      requestOptions.contentType = this.mediaType;
      if (this.showBody()) { requestOptions.data = this.body; }
    }

    if (this.basicauth) {
      var encoded = this.encoder.encode(this.basicauth.username + ":" + this.basicauth.password);
      requestOptions.headers['Authorization'] = "Basic " + encoded;
    }

    $.ajax(requestOptions).then(
      function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
      function(jqXhr) { handleResponse(jqXhr); }
    );
  };

  RAML.Controllers.TryIt = TryIt;
})();
