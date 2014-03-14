(function() {
  'use strict';

  var Controller = function($scope) {
    this.toggle = function() {
      $scope.collapsed = !$scope.collapsed;
    };
  };

  RAML.Directives.collapsible = function($parse) {
    return {
      controller: Controller,
      restrict: 'EA',
      scope: true,
      link: function(scope, element, attrs) {
        if (!attrs.collapsed && !attrs.expanded) {
          scope.collapsed = true;
          return;
        }

        var attr = attrs.collapsed || attrs.expanded;
        var normalizeForAttribute = function(arg) {
          return attrs.expanded ? !arg : arg;
        };

        scope.collapsed = normalizeForAttribute($parse(attr)(scope));

        scope.$watch(attr, function(value) {
          scope.collapsed = normalizeForAttribute(value);
        });

        scope.$watch('collapsed', function(collapsed) {
          $parse(attr).assign(scope.$parent, normalizeForAttribute(collapsed));

          element.removeClass('collapsed expanded');
          element.addClass(collapsed ? 'collapsed' : 'expanded');
        });
      }
    };
  };

  RAML.Directives.collapsibleToggle = function() {
    return {
      require: '^collapsible',
      restrict: 'EA',
      link: function(scope, element, attrs, controller) {
        element.bind('click', function() {
          scope.$apply(controller.toggle);
        });
      }
    };
  };

  RAML.Directives.collapsibleContent = function() {
    return {
      require: '^collapsible',
      restrict: 'EA',
      link: function(scope, element) {
        scope.$watch('collapsed', function(collapsed) {
          element.css('display', collapsed ? 'none' : 'block');
        });
      }
    };
  };
})();
