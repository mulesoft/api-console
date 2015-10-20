(function () {
  'use strict';

  RAML.Directives.markdown = function() {
    return {
      restrict: 'A',
      scope: {
        markdown: '='
      },
      controller: ['$scope', '$sanitize', '$window', '$element', function($scope, $sanitize, $window, $element) {
        $scope.$watch('markdown', function (markdown) {
          var allowUnsafeMarkdown = $scope.$parent.allowUnsafeMarkdown;
          var html = $window.marked(markdown || '', RAML.Settings.marked);

          if (!allowUnsafeMarkdown) {
            html = $sanitize(html);
          }

          $element.html(html);
        });
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('markdown', RAML.Directives.markdown);
})();
