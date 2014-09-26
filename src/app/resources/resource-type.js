RAML.Directives.resourceType = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'resources/resource-type.tpl.html',
    replace: true
  };
};

angular.module('RAML.Directives')
  .directive('resourceType', ['$window', RAML.Directives.resourceType]);
