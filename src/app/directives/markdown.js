(function () {
  'use strict';

  RAML.Directives.markdown = function() {
    return {
      restrict: 'A',
      scope: {
        markdown: '='
      },
      controller: 'MarkdownController'
    };
  };

  RAML.Directives.markdownString = function () {
    return {
      restrict: 'A',
      scope: {
        markdownString: '@'
      },
      controller: 'MarkdownStringController'
    };
  };

  var watchMarkdown = function(expression, $scope, $window, $sanitize, $element) {
    $scope.$watch(expression, function (markdown) {
      var allowUnsafeMarkdown = $scope.$parent.allowUnsafeMarkdown;
      var markdownString = typeof markdown === 'string' ? markdown || '' : '';
      var html = $window.marked(markdownString, RAML.Settings.marked);

      if (!allowUnsafeMarkdown) {
        html = $sanitize(html);
      }

      $element.html(html);
    });
  };

  function controller($scope, $sanitize, $window, $element) {
    watchMarkdown('markdown', $scope, $window, $sanitize, $element);
  }

  function stringController($scope, $sanitize, $window, $element) {
    watchMarkdown('markdownString', $scope, $window, $sanitize, $element);
  }

  angular.module('RAML.Directives')
    .controller('MarkdownController', controller)
    .controller('MarkdownStringController', stringController)
    .directive('markdown', RAML.Directives.markdown)
    .directive('markdownString', RAML.Directives.markdownString);
})();
