angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsTryIt', function ($scope, ramlHelper) {
        $scope.urlParams = ramlHelper.processUrlParts($scope.resource.relativeUri);
        $scope.hasAdditionalParams = function (operation) {
            return (operation.query && operation.query.length) || operation.method == 'POST' || operation.method == 'PUT'
        }
    });