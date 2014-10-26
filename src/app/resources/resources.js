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
      controller: function($scope, $window) {
        $scope.proxy               = $window.RAML.Settings.proxy;
        $scope.documentationHidden = $window.RAML.Settings.documentationHidden;

        if ($scope.src) {
          ramlParserWrapper.load($scope.src);
        }

        $scope.updateProxyConfig = function (status) {
          $window.RAML.Settings.disableProxy = status;
        };

        $scope.toggle = function ($event) {
          var $this    = jQuery($event.currentTarget);
          var $section = $this
            .closest('.resource-list-item')
            .find('.resource-list');

          if ($section.hasClass('is-collapsed')) {
            $section.velocity('slideDown', {
              duration: 200
            });
          } else {
            $section.velocity('slideUp', {
              duration: 200
            });
          }

          $section.toggleClass('is-collapsed');
          $this.toggleClass('is-active');
        };
      },
      link: function($scope) {
        $scope.loaded     = false;
        $scope.parseError = null;

        ramlParserWrapper.onParseSuccess(function(raml) {
          $scope.raml = RAML.Inspector.create(raml);
          $scope.parseError = null;
          $scope.loaded = true;
        });

        ramlParserWrapper.onParseError(function(error) {
          /*jshint camelcase: false */
          var context = error.context_mark || error.problem_mark;
          /*jshint camelcase: true */
          $scope.parseError = { message: error.message };

          if (context) {
            /*jshint camelcase: false */
            var snippet = context.get_snippet(0, 10000).replace('^', '').trim();
            /*jshint camelcase: true */

            $scope.cmModel = context.buffer;

            $scope.parseError = {
              column: context.column + 1,
              line: context.line + 1,
              message: error.message,
              snippet: snippet,
              raml: context.buffer,
              fileName: context.name
            };

            // Hack to update codemirror
            setTimeout(function () {
              var editor = jQuery('.error-codemirror-container .CodeMirror')[0].CodeMirror;
              editor.doc.addLineClass(context.line, 'background', 'line-error');
              editor.doc.setCursor(context.line);
            }, 10);
          }

          $scope.$apply.apply($scope, null);
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlConsole', RAML.Directives.resources);
})();
