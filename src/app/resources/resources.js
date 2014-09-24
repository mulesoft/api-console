RAML.Directives.resources = function() {
  return {
    restrict: 'E',
    templateUrl: 'resources/resources-list.tpl.html',
    replace: true,
    scope: { },
    controller: function($scope, $element) {
    }
  };
};

angular.module('RAML.Directives')
  .directive('ramlResources', RAML.Directives.resources);
