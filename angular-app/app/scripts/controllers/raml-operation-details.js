angular.module('ramlConsoleApp')
    .controller('ramlOperationDetails', function ($scope) {
        $scope.tabName = 'try-it';
        $scope.isTabActive = function (tabName) {
            return tabName === this.tabName;
        };
        $scope.changeTab = function (tabName) {
            this.tabName = tabName;
        };
    });