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
      controller: ['$scope', '$rootScope', '$window', '$attrs', function($scope, $rootScope, $window, $attrs) {
        $scope.proxy                  = $window.RAML.Settings.proxy;
        $scope.disableTitle           = false;
        $scope.resourcesCollapsed     = false;
        $scope.documentationCollapsed = false;
        $scope.credentials = {};
        $scope.allowUnsafeMarkdown    = false;
        $scope.disableTryIt           = false;

        if ($attrs.hasOwnProperty('disableTryIt')) {
          $scope.disableTryIt = true;
        }

        if ($attrs.hasOwnProperty('allowUnsafeMarkdown')) {
          $scope.allowUnsafeMarkdown = true;
        }

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

        if ($attrs.hasOwnProperty('resourcesCollapsed')) {
          $scope.resourcesCollapsed = true;
        }

        if ($attrs.hasOwnProperty('documentationCollapsed')) {
          $scope.documentationCollapsed = true;
        }

        if ($scope.src) {
          if (/^https?/i.test($scope.src)) {
            ramlParserWrapper.load($scope.src);
          } else {
            ramlParserWrapper.load($window.location.origin + '/' + $scope.src);
          }
        }

        $scope.readResourceTraits = function readResourceTraits(traits) {
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
        };

        $scope.updateProxyConfig = function (status) {
          $window.RAML.Settings.disableProxy = status;
        };

        $scope.collapseAll = function ($event, collection, flagKey) {
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
        };

        function toggleCollapsed (status, collection) {
          for (var i = 0; i < collection.length; i++) {
            collection[i] = collection[i] !== null ? status : collection[i];
          }
        }

        $scope.hasResourcesWithChilds = function () {
          return $scope.resourceGroups.filter(function (el) {
            return el.length > 1;
          }).length > 0;
        };

        $scope.generateId = function (path) {
          return jQuery.trim(path.toString().replace(/\W/g, ' ')).replace(/\s+/g, '_');
        };

        ramlParserWrapper.onParseSuccess(function(raml) {
          // Store RAML in the Root scope
          $rootScope.raml     = raml;
          $scope.raml         = raml;
          $scope.rawRaml      = raml;
          $scope.loaded       = true;
          $scope.resourceList = [];
          $scope.documentList = [];

          $scope.baseUri = $scope.raml.baseUri();

          // Obtain the API title from the RAML API.
          $scope.title = $scope.raml.title();

          $scope.resourceGroups = RAML.Transformer.groupResources(
            $scope.raml.resources());

          $scope.documentation = RAML.Transformer.transformDocumentation(
            $scope.raml.documentation());

          $scope.protocols = $scope.raml.allProtocols();

          for (var i = 0; i < $scope.resourceGroups.length; i++) {
            var resources = $scope.resourceGroups[i];
            var status = resources.length > 1 ? false : null;
            $scope.resourceList.push($scope.resourcesCollapsed ? true : status);
          }

          if ($scope.documentation) {
            for (var j = 0; j < $scope.documentation.length; j++) {
              $scope.documentList.push($scope.documentationCollapsed ? true : false);
            }
          }
        });
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlConsole', ['ramlParserWrapper', RAML.Directives.resources]);
})();
