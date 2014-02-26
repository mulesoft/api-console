(function() {
  'use strict';

  RAML.Directives.tryIt = function(DataStore) {
    return {
      restrict: 'E',
      templateUrl: 'views/try_it.tmpl.html',
      replace: true,
      link: function($scope) {
        // fix that ensures the try it display is updated
        // when switching between methods in the resource popover.
        $scope.$watch('method', function() {
          new RAML.Controllers.TryIt($scope, DataStore);
        });
      }
    };
  };
})();
