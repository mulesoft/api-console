angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsTryIt', function ($scope, ramlHelper) {
        $scope.request = {};
        $scope.url = {};

        $scope.urlParams = ramlHelper.processUrlParts($scope.resource.relativeUri);
        $scope.queryParams = ramlHelper.processQueryParts($scope.operation.query);

        $scope.hasAdditionalParams = function (operation) {
            return operation.query || operation.method === 'post' || operation.method === 'put';
        };

        $scope.showResponse = function () {
            return false;
        };
    });
