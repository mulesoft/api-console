(function() {
  'use strict';

  RAML.Directives.enum = function($timeout, $filter) {
    var KEY_DOWN  = 40,
        KEY_UP    = 38,
        KEY_ENTER = 13;

    function correctHeight(el, container) {
      var enumRect = el.getBoundingClientRect(),
          containerRect = container.getBoundingClientRect(),
          top = enumRect.top,
          bottom = enumRect.bottom;

      if (top <= containerRect.top) {
        top = containerRect.top;
      }

      if (bottom >= containerRect.bottom) {
        bottom = containerRect.bottom;
      }

      return bottom - top;
    }

    var link = function($scope, $el) {
      function filterEnumElements() {
        $scope.filteredEnum = $filter('filter')($scope.options, $scope.$parent.model);
      }

      $scope.$watch('$parent.model', filterEnumElements);

      $scope.selectItem = function(item) {
        $scope.model = $scope.$parent.model = item;
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
          $scope.model = $scope.$parent.model;
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
            $scope.selectItem(selection);
          }
          e.preventDefault();
          break;
        }
        $scope.$apply();
      });

      $scope.$watch('focused', function() {
        $scope.filteredEnum = $scope.options;

        setTimeout(function() {
          var ul = $el.find('ul'), container = $el[0].offsetParent;
          ul.css('max-height', null);

          if ($scope.containedBy) {
            container = document.querySelector($scope.containedBy);
          }

          if(!container) {
            return;
          }

          ul.css('max-height', correctHeight(ul[0], container) + 'px');
          filterEnumElements();
          $scope.$digest();
        });
      });
    };

    return {
      restrict: 'E',
      transclude: true,
      link: link,
      templateUrl: 'views/enum.tmpl.html',
      scope: {
        options: '=',
        model: '=',
        containedBy: '='
      }
    };
  };
})();
