angular.module('ramlConsoleApp')
    .controller('ramlOperation', function ($scope, $filter) {
        if ($scope.resource.methods.length) {
            $scope.operation = $scope.resource.methods[0];
        }
        $scope.headerClick = function () {
            this.toggle('active');
        };
        $scope.changeMethod = function (methodName) {
            var method = $filter('filter')(this.resource.methods, { method: methodName });
            if (method && method.length) {
                $scope.operation = method[0];
            }
        };
        $scope.isMethodActive = function (methodName) {
            return this.operation && (this.operation.method === methodName)
        };
        $scope.toggle = function (member) {
            this[member] = !this[member];
        };
    });