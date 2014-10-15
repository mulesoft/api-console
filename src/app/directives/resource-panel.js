RAML.Directives.resourcePanel = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/resource-panel.tpl.html',
    replace: true,
    controller: function($scope) {
      $scope.uriParameters = {};
    }
  };
};

angular.module('RAML.Directives')
  .directive('resourcePanel', ['$window', RAML.Directives.resourcePanel]);
