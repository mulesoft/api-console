angular.module('ramlConsoleApp')
  .controller('ramlDocumentation', function ($scope, $filter, eventService, showdown) {
    $scope.model = {};

    $scope.$on('event:raml-sidebar-clicked', function (e, args) {
      $scope.model = args[0];
    });
  });