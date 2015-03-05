(function () {
  'use strict';

  RAML.Directives.resources = function(ramlParserWrapper) {
    return {
      restrict: 'E',
      templateUrl: 'resources/resources.tpl.html',
      replace: true,
      scope: {
        src: '@'
      },
      controller: function($scope, $window, $attrs) {
        $scope.proxy = $window.RAML.Settings.proxy;
        $scope.disableTitle = false;
        $scope.collapsed = false;

        if ($attrs.hasOwnProperty('singleView')) {
          $scope.singleView = true;
        }

        if ($attrs.hasOwnProperty('disableThemeSwitcher')) {
          $scope.disableThemeSwitcher = true;
        }

        if ($attrs.hasOwnProperty('disableRamlClientGenerator')) {
          $scope.disableRamlClientGenerator = true;
        }

        if ($attrs.hasOwnProperty('disableTitle')) {
          $scope.disableTitle = true;
        }

        if ($attrs.hasOwnProperty('collapsed')) {
          $scope.collapsed = true;
        }

        if ($scope.src) {
          ramlParserWrapper.load($scope.src);
        }

        $scope.updateProxyConfig = function (status) {
          $window.RAML.Settings.disableProxy = status;
        };

        $scope.toggle = function ($event, index) {
          var $this    = jQuery($event.currentTarget);
          var $section = $this
            .closest('.raml-console-resource-list-item')
            .find('.raml-console-resource-list');

          if ($section.hasClass('raml-console-is-collapsed')) {
            $section.velocity('slideDown', {
              duration: 200
            });
          } else {
            $section.velocity('slideUp', {
              duration: 200
            });
          }

          $scope.items[index] = !$scope.items[index];

          $scope.collapsed = checkItemStatus(false) ? false : $scope.collapsed;
          $scope.collapsed = checkItemStatus(true) ? true : $scope.collapsed;

          $section.toggleClass('raml-console-is-collapsed');
        };

        $scope.collapseAll = function ($event) {
          var $this = jQuery($event.currentTarget);

          if ($this.hasClass('raml-console-resources-expanded')) {
            $scope.collapsed = true;
            jQuery('#raml-console-resources-container').find('ol.raml-console-resource-list').velocity('slideUp', {
              duration: 200
            });
          } else {
            $scope.collapsed = false;
            jQuery('#raml-console-resources-container').find('ol.raml-console-resource-list').velocity('slideDown', {
              duration: 200
            });
          }

          toggleCollapsed($scope.collapsed);
        };

        function toggleCollapsed (status) {
          for (var i = 0; i < $scope.items.length; i++) {
            $scope.items[i] = $scope.items[i] !== null ? status : $scope.items[i];
          }
        }

        function checkItemStatus(status) {
          return $scope.items.filter(function (el) { return el === status || el === null; }).length === $scope.items.length;
        }

        $scope.showResourceDescription = function ($event) {
          var $this      = jQuery($event.currentTarget);
          var $container = $this.closest('.raml-console-resource-list-item');

          $container.find('.raml-console-resource-description').toggleClass('ng-hide');
        };

        $scope.hasResourcesWithChilds = function () {
          return $scope.raml.resourceGroups.filter(function (el) {
            return el.length > 1;
          }).length > 0;
        };
      },
      link: function($scope) {
        ramlParserWrapper.onParseSuccess(function(raml) {
          $scope.raml    = RAML.Inspector.create(raml);
          $scope.rawRaml = raml;
          $scope.loaded  = true;
          $scope.items = [];

          for (var i = 0 ; i < $scope.raml.resourceGroups.length; i++) {
            $scope.items.push($scope.raml.resourceGroups[i].length > 1 ? false : null);
          }
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlConsole', RAML.Directives.resources);
})();
