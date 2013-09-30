(function() {
  'use strict';

  var Controller = function($scope) {
    $scope.pathBuilder = $scope.method.pathBuilder = new RAML.Inspector.PathBuilder.create($scope.resource.pathSegments);
  }

  RAML.Directives.pathBuilder = function() {

    var link = function($scope, $element, $attrs) { }

    return {
      restrict: 'E',
      link: link,
      controller: Controller,
      templateUrl: 'views/path_builder.tmpl.html',
      replace: true
    }
  }
})();
