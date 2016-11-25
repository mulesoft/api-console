(function () {
  'use strict';

  RAML.Directives.type = function() {
    var TOGGLE_POPOVER = 'popover:toggle';
    return {
      restrict: 'E',
      templateUrl: 'directives/type.tpl.html',
      scope: {
        typeName: '=',
        hideTypeLinks: '=',
        items: '='
      },
      controller: ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
        $scope.typeInfo = RAML.Inspector.Types.getTypeInfo($scope.typeName, $scope.items);

        $scope.closePopover = function () {
          $scope.selectedType = null;
        };

        $rootScope.$on(TOGGLE_POPOVER, function () {
          $scope.closePopover();
        });

        $scope.showTypeLink = function (type) {
          return !$scope.hideTypeLinks && !RAML.Inspector.Types.isNativeType(type);
        };

        $scope.cleanupTypeName = RAML.Inspector.Types.cleanupTypeName;

        $scope.typeDocumentation = function(type) {
          type = RAML.Inspector.Types.findType(type.type[0], $rootScope.types);
          return RAML.Inspector.Types.typeDocumentation(type);
        };

        $scope.getSupertTypes = function (type) {
          return RAML.Inspector.Types.findType(type.type[0], $rootScope.types).type.map(function (aTypeName) {
            return aTypeName;
          });
        };

        $scope.selectType = function ($event, type) {
          jQuery(document).one('click', function () {
            $timeout(function () {
              $rootScope.$broadcast(TOGGLE_POPOVER);
            });
          });

          $rootScope.$broadcast(TOGGLE_POPOVER);

          $timeout(function () {
            $scope.selectedType = RAML.Inspector.Types.mergeType({
                displayName: type,
                type: [type]
              },
              $rootScope.types);
          });

          $event.stopPropagation();
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('type', RAML.Directives.type);
})();
