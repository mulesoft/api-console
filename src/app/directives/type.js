(function () {
  'use strict';

  RAML.Directives.type = function() {
    var TOGGLE_POPOVER = 'popover:toggle';
    return {
      restrict: 'E',
      templateUrl: 'directives/type.tpl.html',
      scope: {
        typeName: '=',
        hideTypeLinks: '='
      },
      controller: function ($scope, $rootScope, $timeout) {
        $scope.typeInfo = RAML.Inspector.Types.getTypeInfo($scope.typeName);

        $scope.closePopover = function () {
          $scope.selectedType = null;
        };

        $rootScope.$on(TOGGLE_POPOVER, function () {
          $scope.closePopover();
        });

        $scope.selectType = function ($event, type) {
          jQuery(document).one('click', function () {
            $timeout(function () {
              $rootScope.$broadcast(TOGGLE_POPOVER);
            });
          });

          $rootScope.$broadcast(TOGGLE_POPOVER);

          $scope.selectedType = RAML.Inspector.Types.mergeType({
              displayName: type,
              type: [type]
            },
            $rootScope.types);

          $event.stopPropagation();
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('type', RAML.Directives.type);
})();
