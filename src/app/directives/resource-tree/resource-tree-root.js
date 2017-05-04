(function () {
  'use strict';

  angular.module('RAML.Directives')
    .directive('resourceTreeRoot', ['showResource', 'resourceId', function resourceTreeRoot(showResource, resourceId) {
      return {
        restrict: 'E',
        templateUrl: 'directives/resource-tree/resource-tree-root.tpl.html',
        replace: true,
        link: function ($scope, element) {
          element.addClass($scope.disableTitle ? 'raml-console-resources-container-no-title' : 'raml-console-resources-container');
          $scope.resourceIdFn = resourceId;

          $scope.showResource = function ($event, $index, resource) {
            showResource($scope, resource, $event, $index);
          };
        }
      };
    }]);
}());
