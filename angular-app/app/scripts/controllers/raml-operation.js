angular.module('ramlConsoleApp')
  .controller('ramlOperation', function ($scope) {
    $scope.headerClick = function () {
        this.toggle('active');
    };
    $scope.toggle = function (member) {
        this[member] = !this[member];
    };
  });
