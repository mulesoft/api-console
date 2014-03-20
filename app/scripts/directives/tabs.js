(function() {
  'use strict';

  (function() {
    RAML.Directives.consoleTabset = function() {
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

      this.registerUriBar = function(uriBar) {
        $scope.uriBar = uriBar;
      };
    }

    RAML.Directives.consoleTab = function($location, $anchorScroll, DataStore) {
      return {
        restrict: 'E',
        templateUrl: 'views/tab.tmpl.html',
        replace: true,
        transclude: true,
        require: '^consoleTabset',
        controller: Controller,
        link: function($scope, $element, $attrs, tabsetCtrl) {
          var selected = DataStore.get($scope.keyBase);

          $scope.select = function(subItem) {
            selected = subItem;

            var responseCode = $('#'+ selected)[0],
                container = $element.parent()[0];

            container.scrollTop = responseCode.offsetTop - container.getBoundingClientRect().top + responseCode.offsetParent.getBoundingClientRect().top;
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
        require: '^consoleTab',
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

  (function() {
    RAML.Directives.uriBar = function() {
      return {
        restrict: 'E',
        require: '^consoleTab',
        link: function($scope, $element, $attrs, tabCtrl) {
          $attrs.$observe('pathBuilder', function(pathBuilder) {
            if (!pathBuilder) {
              return;
            }

            tabCtrl.registerUriBar($scope);
          });
        },
        scope: {
          pathBuilder: '=',
          baseUri: '=',
          pathSegments: '='
        }
      };
    };
  })();
})();
