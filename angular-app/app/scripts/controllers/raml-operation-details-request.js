angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsRequest', function ($scope, $filter, ramlHelper) {
        $scope.$on('event:raml-method-changed', function () {
            $scope.init();
        });
        //// TODO: filter by the current content-type
        $scope.init = function () {
            var methodDescriptor = $filter('filter')($scope.resource.methods, {
                method: $scope.operation.method
            })[0];

            $scope.description = $filter('filter')(ramlHelper.getRequestData(methodDescriptor), {
                name: 'application/json'
            })[0];
        };

        $scope.init();
    });