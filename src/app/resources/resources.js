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
      controller: ['$scope', '$window', '$attrs', function($scope, $window, $attrs) {
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
          ramlParserWrapper.load($scope.src);
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

        $scope.toggle = function ($event, index, collection, flagKey) {
          var $this    = jQuery($event.currentTarget);
          var $section = $this
            .closest('.raml-console-resource-list-item')
            .find('.raml-console-resource-list');

          collection[index] = !collection[index];

          $scope[flagKey] = checkItemStatus(false, collection) ? false : $scope[flagKey];
          $scope[flagKey] = checkItemStatus(true, collection) ? true : $scope[flagKey];

          $section.toggleClass('raml-console-is-collapsed');
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

        function checkItemStatus(status, collection) {
          return collection.filter(function (el) { return el === status || el === null; }).length === collection.length;
        }

        $scope.hasResourcesWithChilds = function () {
          return $scope.raml.resourceGroups.filter(function (el) {
            return el.length > 1;
          }).length > 0;
        };

        ramlParserWrapper.onParseError(function(error) {
          $scope.error  = error;
          $scope.loaded = true;

          /*jshint camelcase: false */
          var context = error.context_mark || error.problem_mark;
          /*jshint camelcase: true */

          $scope.errorMessage = error.message;

          if (context) {
            $scope.raml = context.buffer;

            $window.ramlErrors.line    = context.line;
            $window.ramlErrors.message = error.message;

            // Hack to update codemirror
            setTimeout(function () {
              var editor = jQuery('.raml-console-initializer-input-container .CodeMirror')[0].CodeMirror;
              editor.addLineClass(context.line, 'background', 'line-error');
              editor.doc.setCursor(context.line);
            }, 10);
          }
        });
      }],
      link: function($scope) {
        ramlParserWrapper.onParseSuccess(function(raml) {
          $scope.raml         = RAML.Inspector.create(raml);
          $scope.rawRaml      = raml;
          $scope.loaded       = true;
          $scope.resourceList = [];
          $scope.documentList = [];

          for (var i = 0; i < $scope.raml.resourceGroups.length; i++) {
            var resources = $scope.raml.resourceGroups[i];
            var status = resources.length > 1 ? false : null;
            $scope.resourceList.push($scope.resourcesCollapsed ? true : status);
          }

          if ($scope.raml.documentation) {
            for (var j = 0; j < $scope.raml.documentation.length; j++) {
              $scope.documentList.push($scope.documentationCollapsed ? true : false);
            }
          }
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlConsole', ['ramlParserWrapper', RAML.Directives.resources]);
})();
