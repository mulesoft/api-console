RAML.Directives.resources = function(ramlParserWrapper) {
  return {
    restrict: 'E',
    templateUrl: 'resources/resources.tpl.html',
    replace: true,
    scope: {
        src: '@'
      },
    controller: function($scope, $element) {
      if ($scope.src) {
        ramlParserWrapper.load($scope.src);
      }

      $scope.toggle = function ($event) {
        var $this = jQuery($event.currentTarget);
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

      // The ui-codemirror config
      $scope.cmOption = {
        lineNumbers: true,
        indentWithTabs: true,
        readOnly: 'nocursor',
        lineWrapping : true,
        mode: 'yaml'
      };
    },
    link: function($scope, $element) {
      $scope.parseError = {};

      ramlParserWrapper.onParseSuccess(function(raml) {
        $scope.raml = RAML.Inspector.create(raml);
        $scope.parseError = null;
      });

      ramlParserWrapper.onParseError(function(error) {
        var context = error.context_mark || error.problem_mark;
        var snippet = context.get_snippet(0, 10000).replace('^', '').trim();

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
          var editor = jQuery('.CodeMirror')[0].CodeMirror;
          editor.doc.addLineClass(context.line, 'background', 'line-error');
          editor.doc.setCursor(context.line);
          $scope.$apply.apply($scope, null);
        }, 10);

        $scope.$apply.apply($scope, null);
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('ramlResources', RAML.Directives.resources);
