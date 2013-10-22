(function() {
  'use strict';

  var Controller = function($scope) {
    $scope.pathBuilder = $scope.method.pathBuilder = new RAML.Inspector.PathBuilder.create($scope.resource.pathSegments);
  };

  RAML.Directives.pathBuilder = function() {
    return {
      restrict: 'E',
      controller: Controller,
      templateUrl: 'views/path_builder.tmpl.html',
      replace: true
    };
  };
})();
