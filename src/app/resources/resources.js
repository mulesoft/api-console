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

          var itemsStatus = $scope.items.filter(function (el) { return el === false}).length === $scope.items.length;

          $scope.collapsed = checkItemStatus(false) ? true : $scope.collapsed;
          $scope.collapsed = checkItemStatus(true) ? false : $scope.collapsed;

          $section.toggleClass('raml-console-is-collapsed');
          $this.toggleClass('raml-console-is-active');
        };

        function checkItemStatus(status) {
          return $scope.items.filter(function (el) { return el === status || el === null}).length === $scope.items.length
        }

        $scope.showResourceDescription = function ($event) {
          var $this      = jQuery($event.currentTarget);
          var $container = $this.closest('.raml-console-resource-list-item');

          $container.find('.raml-console-resource-description').toggleClass('ng-hide');
        };

        $scope.toggleInverted = function ($event) {
          var $section    = jQuery($event.currentTarget)
            .closest('.raml-console-resource-list-item')
            .find('.raml-console-resource-list');

          var $this = $section
            .closest('.raml-console-resource-list-item')
            .find('.raml-console-resource-root-toggle');

          if ($section.hasClass('raml-console-is-collapsed')) {
            $section.velocity('slideDown', {
              duration: 200
            });
          } else {
            $section.velocity('slideUp', {
              duration: 200
            });
          }

          $section.toggleClass('raml-console-is-collapsed');
          $this.toggleClass('raml-console-is-active');
        };

        $scope.collapseAll = function ($event) {
          var $this = jQuery($event.currentTarget);

          if ($this.hasClass('raml-console-resources-expanded')) {
            $scope.collapsed = true;
            setCollapsed(true);
            $this.text('expand all');
            $this.removeClass('raml-console-resources-expanded');
            jQuery('#raml-console-resources-container').find('ol.raml-console-resource-list').velocity('slideUp', {
              duration: 200
            });
          } else {
            $scope.collapsed = false;
            setCollapsed(false);
            $this.text('collapse all');
            $this.addClass('raml-console-resources-expanded');
            jQuery('#raml-console-resources-container').find('ol.raml-console-resource-list').velocity('slideDown', {
              duration: 200
            });
          }
        };

        function setCollapsed (status) {
          for (var i = 0; i < $scope.items.length; i++) {
            $scope.items[i] = $scope.items[i] !== null ? !status : $scope.items[i];
          }
        }

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
            $scope.items.push($scope.raml.resourceGroups[i].length > 1 ? true : null);
          };
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlConsole', RAML.Directives.resources);
})();
