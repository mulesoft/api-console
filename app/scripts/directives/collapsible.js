(function() {
  'use strict';

  // NOTE: This directive relies on the collapsible content
  // and collapsible toggle to live in the same scope.

  var Controller = function() {};

  RAML.Directives.collapsible = function() {
    return {
      controller: Controller,
      restrict: 'EA',
      scope: true,
      link: {
        pre: function(scope, element, attrs) {
          if (attrs.hasOwnProperty('collapsed')) {
            scope.collapsed = true;
          }
        }
      }
    };
  };

  RAML.Directives.collapsibleToggle = function() {
    return {
      require: '^collapsible',
      restrict: 'EA',
      link: function(scope, element) {
        element.bind('click', function() {
          scope.$apply(function() {
            scope.collapsed = !scope.collapsed;
          });
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
          element.parent().removeClass('collapsed expanded');
          element.parent().addClass(collapsed ? 'collapsed' : 'expanded');
        });
      }
    };
  };

})();
