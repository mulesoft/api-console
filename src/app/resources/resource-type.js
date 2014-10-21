RAML.Directives.resourceType = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'resources/resource-type.tpl.html',
    replace: true,
    controller: function ($scope) {
      var resourceType = $scope.resource.resourceType;

      if (typeof resourceType === 'object') {
        $scope.resource.resourceType = Object.keys(resourceType).join();
      }
    }
  };
};

angular.module('RAML.Directives')
  .directive('resourceType', ['$window', RAML.Directives.resourceType]);
