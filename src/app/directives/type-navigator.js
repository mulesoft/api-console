(function () {
  'use strict';

  RAML.Directives.typeNavigator = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/type-navigator.tpl.html',
      scope: {
        mediaType: '=',
        type: '='
      },
      controller: ['$scope', function($scope) {
        $scope.previousTypes = [];

        $scope.changeType = function (theRuntimeType, ignoreBack) {
          if (!ignoreBack) {
            $scope.previousTypes.push($scope.runtimeType);
          }
          $scope.runtimeType = theRuntimeType;

          $scope.typeName = $scope.runtimeType.nameId();
          $scope.supertypes = RAML.Transformer.extractSupertypes($scope.runtimeType);
          $scope.properties = RAML.Transformer.transformProperties($scope.runtimeType);

          $scope.examples = $scope.runtimeType.examples().map(function (example) {
            return example.expandAsString();
          });
        };

        $scope.goBack = function () {
          $scope.changeType($scope.previousTypes.pop(), true);
        };

        // TODO: This component should always receive an AST type. Change this when conversion
        // from runtime type to AST type is available.
        $scope.changeType($scope.type.runtimeType ? $scope.type.runtimeType() : $scope.type, true);
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('typeNavigator', RAML.Directives.typeNavigator);
})();
