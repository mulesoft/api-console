'use strict';

(function() {
  RAML.Directives.repeatableAdd = function() {
    return {
      require: '^repeatable',
      restrict: 'E',
      template: '<i class="fa fa-plus-square" ng-show="visible" ng-click="new()"></i>',
      scope: true,
      link: function(scope, element, attrs, controller) {
        scope.$watch('$last', function(last) {
          scope.visible = controller.repeatable() && last;
        });

        scope.new = function() {
          controller.new();
        };
      }
    };
  };
})();
