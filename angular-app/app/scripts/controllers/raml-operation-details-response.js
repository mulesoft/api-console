angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsResponse', function ($scope, $filter) {
        $scope.$on('event:raml-method-changed', function () {
            $scope.init();
        });

        $scope.init = function () {
            var statusCodes = [],
                methodDescriptor = $filter('filter')($scope.resource.methods, {
                    method: $scope.operation.method
                })[0];

            if (methodDescriptor.responses) {
                for (var prop in methodDescriptor.responses) {
                    var response = methodDescriptor.responses[prop] || {},
                        example = response.body ? response.body['application/json'].example : '',
                        schema = response.body ? response.body['application/json'].schema : '';

                    statusCodes.push({
                        name: prop,
                        description: response.description,
                        example: example,
                        schema: schema
                    });
                }
            }

            $scope.statusCodes = statusCodes;
        };

        $scope.init();
    });