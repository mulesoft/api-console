(function() {
  function isEmpty(object) {
    return Object.keys(object || {}).length == 0;
  }

  TryIt = function($scope, $http) {
    this.baseUri = $scope.api.baseUri || "";
    this.pathBuilder = $scope.method.pathBuilder;
    this.method = $scope.method;

    this.httpMethod = $http[$scope.method.method];
    this.headers = {};
    this.queryParameters = {};
    this.supportsMediaType = !isEmpty($scope.method.body);

    $scope.apiClient = this;
  };

  TryIt.prototype.hasQueryParameters = function() {
    return !isEmpty(this.method.queryParameters);
  };

  TryIt.prototype.hasCustomHeaders = function() {
    return !isEmpty(this.method.headers);
  };

  TryIt.prototype.execute = function() {
    var url = this.baseUri + this.pathBuilder(this.pathBuilder);
    var response = this.response = {};
    var requestOptions = { }

    if (!isEmpty(this.queryParameters)) {
      requestOptions.params = this.queryParameters;
    }

    if (!isEmpty(this.headers)) {
      requestOptions.headers = this.headers;
    }

    if (this.mediaType) {
      requestOptions.headers = requestOptions || {};
      requestOptions.headers['Content-Type'] = this.mediaType;
      requestOptions.data = this.body;
    }

    this.httpMethod(url, requestOptions).then(function(httpResponse) {
      response.body = httpResponse.data;
      response.requestUrl = url,
      response.status = httpResponse.status,
      response.headers = httpResponse.headers();
      if (response.headers['content-type']) {
        response.contentType = response.headers['content-type'].split(';')[0];
      }
    });
  };

  RAML.Controllers.tryIt = TryIt;
})();
