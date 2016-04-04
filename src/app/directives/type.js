(function () {
  'use strict';

  RAML.Directives.type = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/type.tpl.html',
      scope: {
        typeName: '=',
        hideTypeLinks: '='
      },
      controller: function ($scope, $rootScope) {
        $scope.typeInfo = RAML.Inspector.Types.getTypeInfo($scope.typeName);

        $scope.selectType = function (type) {
          jQuery(document).one('click', function () {
            $scope.selectedType = null;
          });
          $scope.selectedType = RAML.Inspector.Types.mergeType(
            RAML.Inspector.Types.getType(type, $rootScope.types),
            $rootScope.types);
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('type', RAML.Directives.type);
})();
