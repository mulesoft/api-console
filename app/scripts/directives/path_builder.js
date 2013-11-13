(function() {
  'use strict';

  var Controller = function($scope) {
    $scope.pathBuilder = new RAML.Client.PathBuilder.create($scope.resource.pathSegments);
    $scope.pathBuilder.baseUriContext = {};
    $scope.pathBuilder.segmentContexts = $scope.resource.pathSegments.map(function() {
      return {};
    });
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
