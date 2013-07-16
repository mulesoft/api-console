angular.module('ramlConsoleApp')
  .directive('ramlConsole', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: '/views/raml-console.tmpl.html',
      replace: true,
      transclude: false,
      scope: {
        'id': '@',
        'definition': '@'
      },
      link: function ($scope, $element, $attributes) {
        $scope.resources = [];

        $rootScope.$on('event:raml-parsed', function (e, args) {
          $scope.resources = args.resources;
          $scope.$apply();
        });
      }
    };
  });