(function () {
  'use strict';

  RAML.Directives.typeSwitcher = function(RecursionHelper) {
    return {
      restrict: 'E',
      templateUrl: 'directives/type-switcher.tpl.html',
      scope: {
        body: '=',
        mediaType: '='
      },
      controller: ['$scope', function($scope) {
        $scope.bodyType = RAML.Transformer.getBodyType($scope.body);

        $scope.transformArray = function(arrayType) {
          // TODO: This method should always receive an AST type. Change this when
          // conversion from runtime type to AST is available.
          var runtimeType = arrayType.runtimeType ? arrayType.runtimeType() : arrayType;
          return runtimeType.componentType();
        };

        $scope.getRightType = function(body) {
          // TODO: This method should always receive an AST type. Change this when
          // conversion from runtime type to AST is available.
          var runtimeType = body.runtimeType ? body.runtimeType() : body;
          return runtimeType.rightType();
        };

        $scope.getLeftType = function(body) {
          // TODO: This method should always receive an AST type. Change this when
          // conversion from runtime type to AST is available.
          var runtimeType = body.runtimeType ? body.runtimeType() : body;
          return runtimeType.leftType();
        };
      }],
      compile: function (element) {
        return RecursionHelper.compile(element);
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('typeSwitcher', ['RecursionHelper', RAML.Directives.typeSwitcher]);
})();
