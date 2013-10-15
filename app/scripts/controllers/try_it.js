(function() {
  var FORM_URLENCODED = 'application/x-www-form-urlencoded';
  var FORM_DATA = 'multipart/form-data';

  function isEmpty(object) {
    return Object.keys(object || {}).length == 0;
  }

  TryIt = function($scope, $http, Base64) {
    this.baseUri = $scope.api.baseUri || '';
    this.pathBuilder = $scope.method.pathBuilder;

    this.http = $http;
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
    var requestOptions = { url: url, method: this.httpMethod }

    if (!isEmpty(this.queryParameters)) {
      requestOptions.params = this.queryParameters;
    }

    if (!isEmpty(this.formParameters)) {
      requestOptions.data = this.formParameters;
    }

    if (!isEmpty(this.headers)) {
      requestOptions.headers = this.headers;
    }

    if (this.mediaType) {
      requestOptions.headers = requestOptions.headers || {};
      requestOptions.headers['Content-Type'] = this.mediaType;
      requestOptions.data = this.body;
    }

    if (this.basicauth) {
      var encoded = this.encoder.encode(this.basicauth.username + ":" + this.basicauth.password);
      requestOptions.headers = requestOptions.headers || {};
      requestOptions.headers['Authorization'] = "Basic " + encoded;
    }

    this.requestInProgress = true;
    this.http(requestOptions).then(
      this.handleResponse.bind(this), this.handleResponse.bind(this)
    );
  };

  TryIt.prototype.handleResponse = function(httpResponse) {
    this.requestInProgress = false;

    this.response.body = httpResponse.data,
      this.response.status = httpResponse.status,
      this.response.headers = httpResponse.headers();

    if (this.response.headers['content-type']) {
      this.response.contentType = this.response.headers['content-type'].split(';')[0];
    }
  }

  RAML.Controllers.tryIt = TryIt;
})();
