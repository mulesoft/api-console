angular.module('apiconsolemod', [])
  .directive('apiconsole', function () {
    return {
      restrict: 'E',
      templateUrl: '/apiconsole.html',
      replace: true,
      transclude: false,
      scope: { 'title': '@', 'src': '@' }
    };
  });