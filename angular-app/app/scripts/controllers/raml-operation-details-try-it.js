angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsTryIt', function ($scope, $resource, commons) {
        $scope.hasAdditionalParams = function (operation) {
            return operation.query || operation.method === 'post' || operation.method === 'put';
        };

        $scope.hasRequestBody = function (operation) {
            return operation.method === 'post' || operation.method === 'put';
        };

        $scope.showResponse = function () {
            return false;
        };

        $scope.tryIt = function () {
            var params = {};

            commons.extend(params, this.url);
            commons.extend(params, this.query);
            this.tester['$' + this.operation.method](params);
        };

        $scope.buildTester = function () {
            var resourceUri = this.resource.relativeUri.replace(/{/g, ':').replace(/}/g, '');
            var TesterResource = $resource(resourceUri, null, {
                    'get': { method:'GET' },
                    'post': { method:'POST' },
                    'put': { method:'PUT' },
                    'delete': { method:'DELETE' }
                });

            this.tester = new TesterResource();
        };

        $scope.init = function () {
            $scope.request = {};
            $scope.url = {};
            $scope.query = {};
            $scope.requestBody = '';

            $scope.buildTester();
        };

        $scope.init();
    });
