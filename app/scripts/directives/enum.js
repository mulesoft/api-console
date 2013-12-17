(function() {
  'use strict';

  RAML.Directives.enum = function($timeout, $filter) {
    var KEY_DOWN  = 40,
        KEY_UP    = 38,
        KEY_ENTER = 13;

    var link = function($scope, $el) {
      var filterEnumElements = function() {
        $scope.filteredEnum = $filter('filter')($scope.options, $scope.model);
      };

      $scope.$watch(function enumFilterWatch() {
        return $scope.model;
      }, filterEnumElements);

      $scope.selectItem = function(item) {
        $scope.model = item;
        $scope.focused = false;
      };

      filterEnumElements();

      $el.find('input').bind('focus', function() {
        $scope.$apply(function() {
          $scope.selectedIndex = -1;
          $scope.focused = true;
        });
      });

      $el.find('input').bind('blur', function() {
        $scope.$apply(function() {
          $scope.focused = false;
        });
      });

      $el.bind('mousedown', function(event) {
        if (event.target.tagName === 'LI') {
          event.preventDefault();
        }
      });

      $el.find('input').bind('input', function() {
        $scope.$apply(function() {
          $scope.focused = true;
          $scope.selectedIndex = 0;
        });
      });

      $el.find('input').bind('keydown', function(e) {
        switch (e.keyCode) {
        case KEY_UP:
          $scope.selectedIndex = $scope.selectedIndex - 1;
          $scope.selectedIndex = Math.max(0, $scope.selectedIndex);
          e.preventDefault();

          break;
        case KEY_DOWN:
          $scope.selectedIndex = $scope.selectedIndex + 1;
          $scope.selectedIndex = Math.min($scope.filteredEnum.length - 1, $scope.selectedIndex);
          e.preventDefault();
          break;
        case KEY_ENTER:
          var selection = $scope.filteredEnum[$scope.selectedIndex];

          if (selection) {
            $scope.model = selection;
            $scope.focused = false;
          }
          e.preventDefault();
          break;
        }
        $scope.$apply();
      });
    };

    return {
      restrict: 'E',
      transclude: true,
      link: link,
      templateUrl: 'views/enum.tmpl.html',
      scope: {
        options: '=',
        model: '='
      }
    };
  };
})();
