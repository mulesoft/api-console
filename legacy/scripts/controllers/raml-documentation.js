angular.module('ramlConsoleApp')
    .controller('ramlDocumentation', function ($scope) {
        $scope.model = null;

        $scope.$on('event:raml-sidebar-clicked', function (e, eventData) {
            if (eventData.isDocumentation) {
                $scope.model = eventData.data[0];
            } else {
                $scope.model = null;
            }
        });
    });