angular.module('ramlConsoleApp')
    .controller('ramlOperationDetails', function ($scope, ramlHelper) {
        $scope.tabName = 'try-it';
        $scope.urlParams = ramlHelper.processUrlParts($scope.resource.relativeUri);
        $scope.queryParams = ramlHelper.processQueryParts($scope.operation.query);

        $scope.isTabActive = function (tabName) {
            return tabName === this.tabName;
        };
        $scope.changeTab = function (tabName) {
            this.tabName = tabName;
        };
    });