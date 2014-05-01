'use strict';

(function() {
  RAML.Directives.repeatableRemove = function() {
    return {
      require: '^repeatable',
      restrict: 'E',
      template: '<i class="fa fa-times-circle" ng-show="visible" ng-click="remove()"></i>',
      scope: true,
      link: function(scope, element, attrs, controller) {
        scope.$watch('repeatableModel.length', function(length) {
          scope.visible = controller.repeatable() && length > 1;
        });

        scope.remove = function() {
          var index = scope.$index;
          controller.remove(index);
        };
      }
    };
  };
})();
