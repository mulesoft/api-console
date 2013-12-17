'use strict';

(function() {
  RAML.Directives.repeatable = function($parse) {
    return {
      restrict: 'EA',
      templateUrl: 'views/repeatable.tmpl.html',
      transclude: true,
      link: function(scope, element, attrs) {
        scope.repeatable = $parse(attrs.repeatable)(scope);
        scope.repeatableModel = [''];

        scope.$watch('repeatableModel', function(value) {
          $parse(attrs.repeatableModel).assign(scope, value);
        });

        scope.new = function() {
          scope.repeatableModel.push('');
        };

        scope.remove = function(index) {
          scope.repeatableModel.splice(index, 1);
        };
      }
    };
  };
})();
