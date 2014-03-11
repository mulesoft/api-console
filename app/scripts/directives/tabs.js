(function() {
  'use strict';

  (function() {
    RAML.Directives.tabset = function() {
      return {
        restrict: 'E',
        templateUrl: 'views/tabset.tmpl.html',
        replace: true,
        transclude: true,
        controller: RAML.Controllers.tabset,
        scope: {
          heading: '@',
          keyBase: '@'
        }
      };
    };
  })();

  (function() {
    function Controller($scope) {
      this.registerSubtabs = function(subtabs, keyBase) {
        $scope.subtabs = subtabs;
        $scope.keyBase = keyBase;
      };
    }

    RAML.Directives.tab = function($location, $anchorScroll, DataStore) {
      return {
        restrict: 'E',
        templateUrl: 'views/tab.tmpl.html',
        replace: true,
        transclude: true,
        require: '^tabset',
        controller: Controller,
        link: function($scope, $element, $attrs, tabsetCtrl) {
          var selected = DataStore.get($scope.keyBase);

          $scope.select = function(subItem) {
            selected = subItem;
            $location.hash(selected);
            $anchorScroll();
            $location.hash('');
            DataStore.set($scope.keyBase, selected);
          };

          $scope.selected = function(subItem) {
            return (selected || $scope.subtabs[0]) === subItem;
          };

          tabsetCtrl.addTab($scope);
        },
        scope: {
          active: '=',
          disabled: '=',
          heading: '@',
        }
      };
    };
  })();

  (function() {
    RAML.Directives.subtabs = function() {
      return {
        restrict: 'E',
        require: '^tab',
        link: function($scope, $element, $attrs, tabCtrl) {
          tabCtrl.registerSubtabs($scope.tabs, $scope.keyBase);
        },
        scope: {
          tabs: '=',
          keyBase: '@'
        }
      };
    };
  })();
})();
