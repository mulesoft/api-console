'use strict';

(function() {
  RAML.Directives.repeatableAdd = function() {
    return {
      require: '^repeatable',
      restrict: 'E',
      template: '<i class="icon icon-plus-sign-alt" ng-show="visible" ng-click="new()"></i>',
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
