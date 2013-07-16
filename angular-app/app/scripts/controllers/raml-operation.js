angular.module('ramlConsoleApp')
    .controller('ramlOperation', function ($scope) {
        if ($scope.resource.methods.length) {
            $scope.selectedOperation = $scope.resource.methods[0];
        }
        $scope.headerClick = function () {
            this.toggle('active');
        };
        $scope.toggle = function (member) {
            this[member] = !this[member];
        };
    });