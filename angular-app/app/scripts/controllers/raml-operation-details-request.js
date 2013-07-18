angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsRequest', function ($scope, $filter, ramlHelper) {
        $scope.$on('event:raml-method-changed', function () {
            $scope.init();
        });

        $scope.init = function () {
            var description = null,
                methodDescriptor = $filter('filter')($scope.resource.methods, {
                    method: $scope.operation.method
                })[0];

            if (methodDescriptor.body && methodDescriptor.body['application/json']) {
                description = {
                    example: methodDescriptor.body['application/json'].example,
                    schema: methodDescriptor.body['application/json'].schema
                };
            }

            // console.log(ramlHelper.getRequestData(methodDescriptor));

            $scope.description = description;
        };

        $scope.init();
    });