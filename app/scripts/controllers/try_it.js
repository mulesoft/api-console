(function() {
  TryIt = function($scope, $http) {
    this.baseUri = $scope.api.baseUri || "";
    this.pathBuilder = $scope.method.pathBuilder;
    this.method = $scope.method;

    this.httpMethod = $http[$scope.method.verb];
    this.queryParameters = {};

    $scope.apiClient = this;
  };

  TryIt.prototype.hasQueryParameters = function() {
    return this.method.queryParameters && Object.keys(this.method.queryParameters).length > 0;
  };

  TryIt.prototype.execute = function() {
    var url = this.baseUri + this.pathBuilder(this.pathBuilder);
    var response = this.response = {};

    this.httpMethod(url, { params: this.queryParameters }).then(function(httpResponse) {
      response.body = httpResponse.data,
      response.status = httpResponse.status,
      response.headers = httpResponse.headers()
    });
  };

  RAML.Controllers.TryIt = TryIt;
})();
