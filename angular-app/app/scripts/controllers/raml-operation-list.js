angular.module('ramlConsoleApp')
    .controller('ramlOperationList', function ($scope) {
        $scope.model = {};

        $scope.$on('event:raml-sidebar-clicked', function (e, eventData) {
            if (eventData.isResource) {
                $scope.model = eventData.data;
            } else {
                $scope.model = {};
            }
        });
    });