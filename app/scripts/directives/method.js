(function() {
  'use strict';

  RAML.Directives.method = function() {
    return {
      controller: RAML.Controllers.Method,
      require: ['^resource', 'method'],
      restrict: 'E',
      templateUrl: 'views/method.tmpl.html',
      replace: true,
      link: function(scope, element, attrs, controllers) {
        var resourceView = controllers[0],
            methodView   = controllers[1];

        // TODO expandInitially has been removed
        if (resourceView.expandInitially(scope.method)) {
          methodView.expand();
        }
      }
    };
  };
})();
