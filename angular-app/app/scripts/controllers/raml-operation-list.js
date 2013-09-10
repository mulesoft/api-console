angular.module('ramlConsoleApp')
    .controller('ramlOperationList', function ($scope) {
        $scope.model = null;

        $scope.$on('event:raml-operation-list-published', function (e, eventData) {
            $scope.resources = eventData;
        });

        $scope.$on('event:raml-sidebar-clicked', function (e, eventData) {
            if (eventData.isResource) {
                $scope.model = [eventData.data];
            } else {
                $scope.model = {};
            }
        });
    });