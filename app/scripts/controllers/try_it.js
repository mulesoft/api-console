(function() {
  TryIt = function($scope, $http) {
    this.httpMethod = $http[$scope.method.verb];
    this.url = $scope.api.baseUri + $scope.resource.pathSegments.join("")

    $scope.apiClient = this;
  };

  TryIt.prototype.execute = function() {
    var success = this.handleResponse.bind(this);
    this.httpMethod(this.url).then(success);
  };

  TryIt.prototype.handleResponse = function(response) {
    this.response = {
      body: response.data,
      status: response.status,
      headers: response.headers()
    };
  }

  RAML.Controllers.TryIt = TryIt;
})();
