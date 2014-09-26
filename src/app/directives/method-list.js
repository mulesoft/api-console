RAML.Directives.methodList = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/method-list.tpl.html',
    replace: true
  };
};

angular.module('RAML.Directives')
  .directive('methodList', ['$window', RAML.Directives.methodList]);
