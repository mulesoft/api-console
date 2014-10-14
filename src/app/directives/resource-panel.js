RAML.Directives.resourcePanel = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/resource-panel.tpl.html',
    replace: true,
    controller: function($scope) {
      $scope.uriParameters = {};
      $scope.headers = {};
      $scope.queryParameters = {};
      console.log($scope.resource);
    }
  };
};

angular.module('RAML.Directives')
  .directive('resourcePanel', ['$window', RAML.Directives.resourcePanel]);
