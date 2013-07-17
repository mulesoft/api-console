angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsTryIt', function ($scope) {
        $scope.request = {};
        $scope.url = {};
        $scope.query = {};

        $scope.hasAdditionalParams = function (operation) {
            return operation.query || operation.method === 'post' || operation.method === 'put';
        };

        $scope.hasRequestBody = function (operation) {
            return operation.method === 'post' || operation.method === 'put';
        };

        $scope.showResponse = function () {
            return false;
        };
    });
