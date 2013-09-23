angular.module('ramlConsoleApp')
    .controller('ramlOperation', function ($scope, $filter, commons, eventService) {
        $scope.headerClick = function () {
            this.toggle('active');
        };

        $scope.changeMethod = function (methodName) {
            var method = this.resource.methods[methodName];
            var uri = commons.getAbsoluteUri(this.baseUri, this.resource.relativeUri);

            if (method) {
                $scope.operation = method;
                $scope.urlParams = commons.processUrlParts(uri);
                $scope.queryParams = this.operation.queryParameters;
                $scope.contentType = this.operation.supportedTypes[0];
            }

            eventService.broadcast('event:raml-method-changed', methodName);
        };

        $scope.isMethodActive = function (methodName) {
            return this.operation && (this.operation.name === methodName);
        };

        $scope.toggle = function (member) {
            this[member] = !this[member];
        };

        $scope.init = function () {
            if (!$scope.operation) {
                $scope.operation = {};
            }

            if (this.resource.methods && this.resource.methods !== {}) {
                this.changeMethod(Object.keys(this.resource.methods)[0]);
            }
        };

        $scope.init();
    });