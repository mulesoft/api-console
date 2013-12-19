(function() {
  'use strict';

  RAML.Directives.repeatable = function($parse) {
    var controller = function($scope, $attrs) {
      this.repeatable = function() {
        return $parse($attrs.repeatable)($scope);
      };

      this.new = function() {
        $scope.repeatableModel.push('');
      };

      this.remove = function(index) {
        $scope.repeatableModel.splice(index, 1);
      };
    };

    return {
      restrict: 'EA',
      templateUrl: 'views/repeatable.tmpl.html',
      transclude: true,
      controller: controller,
      link: function(scope, element, attrs) {
        scope.repeatable = !attrs.repeatable || $parse(attrs.repeatable)(scope);
        scope.repeatableModel = $parse(attrs.repeatableModel)(scope);

        scope.$watch('repeatableModel', function(value) {
          $parse(attrs.repeatableModel).assign(scope, value);
        }, true);
      }
    };
  };
})();
