(function() {
  TryIt = function($scope, $http) {
    this.baseUri = $scope.api.baseUri || "";
    this.pathBuilder = $scope.method.pathBuilder;

    this.httpMethod = $http[$scope.method.verb];

    $scope.apiClient = this;
  };

  TryIt.prototype.execute = function() {
    var url = this.baseUri + this.pathBuilder(this.pathBuilder);
    var response = this.response = {};

    this.httpMethod(url).then(function(httpResponse) {
      response.body = httpResponse.data,
      response.status = httpResponse.status,
      response.headers = httpResponse.headers()
    });
  };

  RAML.Controllers.TryIt = TryIt;
})();
