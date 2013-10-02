angular.module('ramlConsoleApp')
    .controller('ramlOperationList', function ($scope, ramlReader) {
        $scope.model = null;

        $scope.$on('event:raml-operation-list-published', function (e, eventData) {
            $scope.resources = ramlReader.read(eventData).resources;
        });

        $scope.$on('event:raml-sidebar-clicked', function (e, eventData) {
            if (eventData.isResource) {
                $scope.model = [eventData.data];
            } else {
                $scope.model = {};
            }
        });
    });
