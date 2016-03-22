(function () {
  'use strict';

  RAML.Directives.rootTypes = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/root-types.tpl.html',
      replace: true,
      scope: {
        types: '='
      },
      controller: function ($scope) {
        var types = {};
        $scope.types.forEach(function (type) {
          types[Object.keys(type)[0]] = type[Object.keys(type)[0]];
        });
        $scope.types = RAML.Inspector.Properties.normalizeNamedParameters(types);

      }
    };
  };

  angular.module('RAML.Directives')
    .directive('rootTypes', RAML.Directives.rootTypes);
})();
