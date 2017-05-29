(function () {
  'use strict';

  angular.module('RAML.Directives')
    .factory('isCurrentResource', ['$rootScope', 'resourceId',function resource($rootScope, resourceId) {
      return function($scope, resource) {
        return $scope.currentId && $rootScope.currentId === resourceId(resource);
      };
    }]);
})();
