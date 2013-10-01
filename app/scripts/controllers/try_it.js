(function() {
  function isEmpty(object) {
    return Object.keys(object || {}).length == 0;
  }

  TryIt = function($scope, $http) {
    this.baseUri = $scope.api.baseUri || "";
    this.pathBuilder = $scope.method.pathBuilder;

    this.httpMethod = $http[$scope.method.verb];
    this.queryParameters = {};
    this.supportsMediaType = !isEmpty($scope.method.body);

    $scope.apiClient = this;
  };

  TryIt.prototype.execute = function() {
    var url = this.baseUri + this.pathBuilder(this.pathBuilder);
    var response = this.response = {};
    var requestOptions = {};

    if (!isEmpty(this.queryParameters)) {
      requestOptions.params = this.queryParameters;
    }

    if (this.mediaType) {
      requestOptions.headers = { 'Content-Type': this.mediaType };
      requestOptions.data = this.body;
    }

    this.httpMethod(url, requestOptions).then(function(httpResponse) {
      response.body = httpResponse.data,
      response.status = httpResponse.status,
      response.headers = httpResponse.headers()
    });
  };

  RAML.Controllers.TryIt = TryIt;
})();
