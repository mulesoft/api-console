angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsTryIt', function ($scope, ramlHelper) {
        $scope.urlParams = ramlHelper.processUrlParts($scope.resource.relativeUri);
    });