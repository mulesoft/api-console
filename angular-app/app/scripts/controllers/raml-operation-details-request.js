angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsRequest', function ($scope, $filter) {
        $scope.$on('event:raml-method-changed', function () {
            $scope.init();
        });

        $scope.init = function () {
            var description = {},
                methodDescriptor = $filter('filter')($scope.resource.methods, {
                    method: $scope.operation.method
                })[0];

            if (methodDescriptor.body && methodDescriptor.body['application/json']) {
                description = {
                    example: methodDescriptor.body['application/json'].example,
                    schema: methodDescriptor.body['application/json'].schema
                };
            }

            $scope.description = description;
        };

        $scope.init();
    });