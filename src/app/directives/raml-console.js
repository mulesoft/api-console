(function () {
  'use strict';

  angular.module('RAML.Directives')
    .directive('ramlConsole', function ramlConsole() {
      return {
        restrict:    'E',
        templateUrl: 'directives/raml-console.tpl.html',
        replace:     true,
        controller:  'RamlConsoleController',
        scope:       {
          raml:    '=',
          options: '='
        }
      };
    })
    .controller('RamlConsoleController', function RamlConsoleController(
      $attrs,
      $scope,
      $rootScope,
      $window
    ) {
      $scope.allowUnsafeMarkdown        = $attrs.hasOwnProperty('allowUnsafeMarkdown');
      $scope.collapseAll                = collapseAll;
      $scope.credentials                = {};
      $scope.disableRamlClientGenerator = $attrs.hasOwnProperty('disableRamlClientGenerator');
      $scope.disableThemeSwitcher       = $attrs.hasOwnProperty('disableThemeSwitcher');
      $scope.disableTitle               = $attrs.hasOwnProperty('disableTitle');
      $scope.disableTryIt               = $attrs.hasOwnProperty('disableTryIt');
      $scope.documentationCollapsed     = $attrs.hasOwnProperty('documentationCollapsed');
      $scope.proxy                      = $window.RAML.Settings.proxy;
      $scope.readResourceTraits         = readResourceTraits;
      $scope.resourcesCollapsed         = $attrs.hasOwnProperty('resourcesCollapsed');
      $scope.singleView                 = $attrs.hasOwnProperty('singleView');
      $scope.hasResourcesWithChilds     = hasResourcesWithChilds;
      $scope.toggle                     = toggle;
      $scope.updateProxyConfig          = updateProxyConfig;

      // ---

      (function activate() {
        $scope.options && [
          'allowUnsafeMarkdown',
          'disableRamlClientGenerator',
          'disableThemeSwitcher',
          'disableTitle',
          'disableTryIt',
          'documentationCollapsed',
          'resourcesCollapsed',
          'singleView'
        ].forEach(function (property) {
          if ($scope.options[property]) {
            $scope[property] = true;
          }
        });

        $scope.$watch('raml', function (raml) {
          raml && inspectRaml(raml);
          if (raml.types) {
            $rootScope.types = angular.copy(raml.types);
            $rootScope.types = $rootScope.types.map(function (type) {
              var theType = type[Object.keys(type)[0]];
              theType.properties = RAML.Inspector.Properties.normalizeNamedParameters(theType.properties);
              return type;
            });
          }

          if (raml.schemas) {
            $rootScope.schemas = angular.copy(raml.schemas);
          }
        });
      })();

      // ---

      function collapseAll($event, collection, flagKey) {
        var $this = jQuery($event.currentTarget);

        if ($this.hasClass('raml-console-resources-expanded')) {
          $scope[flagKey] = true;
        } else {
          if (flagKey === 'resourcesCollapsed') {
            jQuery('.raml-console-resource-description').removeClass('ng-hide');
          }
          $scope[flagKey] = false;
        }

        jQuery('.raml-console-resources-' + flagKey).find('ol.raml-console-resource-list').toggleClass('raml-console-is-collapsed');

        toggleCollapsed($scope[flagKey], collection);
      }

      function readResourceTraits(traits) {
        var list = [];

        if (traits) {
          traits.map(function (trait) {
            if (trait) {
              if (typeof trait === 'object') {
                list.push(Object.keys(trait).join(', '));
              } else {
                list.push(trait);
              }
            }
          });
        }

        return list.join(', ');
      }

      function toggle($event, index, collection, flagKey) {
        var $this    = jQuery($event.currentTarget);
        var $section = $this
          .closest('.raml-console-resource-list-item')
          .find('.raml-console-resource-list');

        collection[index] = !collection[index];

        $scope[flagKey] = checkItemStatus(false, collection) ? false : $scope[flagKey];
        $scope[flagKey] = checkItemStatus(true, collection) ? true : $scope[flagKey];

        $section.toggleClass('raml-console-is-collapsed');
      }

      function updateProxyConfig(status) {
        $window.RAML.Settings.disableProxy = status;
      }

      // ---

      function toggleCollapsed(status, collection) {
        for (var i = 0; i < collection.length; i++) {
          collection[i] = collection[i] !== null ? status : collection[i];
        }
      }

      function checkItemStatus(status, collection) {
        return collection.filter(function (el) { return el === status || el === null; }).length === collection.length;
      }

      function hasResourcesWithChilds() {
        return $scope.inspectedRaml.resourceGroups.filter(function (el) {
          return el.length > 1;
        }).length > 0;
      }

      function inspectRaml(raml) {
        $scope.inspectedRaml = RAML.Inspector.create(raml);
        $scope.resourceList  = [];
        $scope.documentList  = [];

        for (var i = 0; i < $scope.inspectedRaml.resourceGroups.length; i++) {
          var resources = $scope.inspectedRaml.resourceGroups[i];
          var status    = resources.length > 1 ? false : null;
          $scope.resourceList.push($scope.resourcesCollapsed ? true : status);
        }

        if ($scope.inspectedRaml.documentation) {
          for (var j = 0; j < $scope.inspectedRaml.documentation.length; j++) {
            $scope.documentList.push($scope.documentationCollapsed ? true : false);
          }
        }
      }
    })
  ;
})();
