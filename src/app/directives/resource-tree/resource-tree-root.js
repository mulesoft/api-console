(function () {
  'use strict';

  angular.module('RAML.Directives')
    .directive('resourceTreeRoot', ['showResource', 'resourceId', 'isCurrentResource', function resourceTreeRoot(showResource, resourceId, isCurrentResource) {
      return {
        restrict: 'E',
        templateUrl: 'directives/resource-tree/resource-tree-root.tpl.html',
        replace: true,
        link: function ($scope, element) {
          element.addClass($scope.disableTitle ? 'raml-console-resources-container-no-title' : 'raml-console-resources-container');
          $scope.resourceIdFn = resourceId;
          $scope.isCurrentResourceFn = isCurrentResource;

          $scope.showResource = showResource;

          $scope.readTraits = function (traits) {
            var list = [];
            var traitList = traits || [];

            traitList.map(function (trait) {
              if (trait) {
                if (typeof trait === 'object') {
                  trait = Object.keys(trait).join(', ');
                }

                if (list.indexOf(trait) === -1) {
                  list.push(trait);
                }
              }
            });

            return list.join(', ');
          };
        }
      };
    }]);
}());
