(function() {
  'use strict';

  var Controller = function($scope) {
    if ($scope.hasOwnProperty('collapsed')) {
      $scope.expanded = !$scope.collapsed;
    }

    var callback;

    this.toggle = function() {
      $scope.expanded = !$scope.expanded;
      $scope.collapsed = !$scope.expanded;
      callback($scope.expanded);
    };

    this.stateUpdated = function(cb) {
      callback = cb;
      callback($scope.expanded);
    };
  };

  RAML.Directives.collapsible = function() {
    return {
      controller: Controller,
      restrict: 'EA',
      scope: {
        expanded: '=?',
        collapsed: '=?'
      },
      transclude: true,
      template: '<div ng-transclude></div>'
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
      link: function(scope, element, attrs, controller) {
        controller.stateUpdated(function(expanded) {
          element.css('display', expanded ? 'block' : 'none');
          element.parent().removeClass('collapsed expanded');
          element.parent().addClass(expanded ? 'expanded' : 'collapsed');
        });
      }
    };
  };

})();
