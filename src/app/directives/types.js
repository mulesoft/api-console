(function () {
  'use strict';

  RAML.Directives.types = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/types.tpl.html',
      scope: {
        type: '=',
        model: '=',
        editMode: '='
      },
      controller: ['$scope', function($scope) {
        $scope.$watch('type', function () {
          $scope.model = {value: ''};
        });
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('types', RAML.Directives.types);
})();
