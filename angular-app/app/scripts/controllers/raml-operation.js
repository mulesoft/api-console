angular.module('ramlConsoleApp')
    .controller('ramlOperation', function ($scope, $filter, ramlHelper) {
        $scope.headerClick = function () {
            this.toggle('active');
        };

        $scope.changeMethod = function (methodName) {
            var method = $filter('filter')(this.resource.methods, { method: methodName });
            if (method && method.length) {
                $scope.operation = method[0];
                $scope.urlParams = ramlHelper.processUrlParts($scope.resource.relativeUri);
                $scope.queryParams = ramlHelper.processQueryParts($scope.operation.query);
            }
        };

        $scope.isMethodActive = function (methodName) {
            return this.operation && (this.operation.method === methodName)
        };

        $scope.toggle = function (member) {
            this[member] = !this[member];
        };

        $scope.init = function () {
            if (this.resource.methods.length) {
                this.changeMethod(this.resource.methods[0].method);
            }
        };

        $scope.init();
    });