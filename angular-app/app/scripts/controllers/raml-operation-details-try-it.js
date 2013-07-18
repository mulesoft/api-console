angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsTryIt', function ($scope, $resource, commons, eventService) {
        $scope.hasAdditionalParams = function (operation) {
            return operation.query || operation.method === 'post' || operation.method === 'put';
        };

        $scope.hasRequestBody = function (operation) {
            return operation.method === 'post' || operation.method === 'put';
        };

        $scope.showResponse = function () {
            return this.responseAvailable;
        };

        $scope.tryIt = function () {
            var params = {};
            var tester = new this.testerResource();

            commons.extend(params, this.url);
            commons.extend(params, this.query[this.operation.method]);

            this['$' + this.operation.method](tester, params);
        };

        $scope.$get = function (tester, params) {
            var that = this;
            this.responseAvailable = true;

            tester.$get(params, function (data, headers, status, url) {
                that.response = {
                    data: data.data,
                    headers: data.headers,
                    statusCode: status,
                    url: url
                };
            }, function (error) {
                that.response = {
                    data: error.data.data,
                    headers: error.data.headers,
                    statusCode: error.status,
                    url: error.config.url
                };

                console.log(error);
            });
        }

        $scope.transformResponse = function (data) {
            console.log(data);
            return { data: data };
        };

        $scope.buildTester = function () {
            var resourceUri = this.baseUri + this.resource.relativeUri.replace(/{/g, ':').replace(/}/g, '');
            this.testerResource = $resource(resourceUri, null, {
                    'get': {
                        method:'GET',
                        isArray: false,
                        transformResponse: function (data, headers) {
                            try {
                                data = JSON.parse(data);
                                data = angular.toJson(data, true);
                            }
                            catch (e) {}

                            return { data: data, headers: angular.toJson(headers(), true) };
                        },
                        transformRequest: function (data, headers) {
                            return data;
                        }
                    },
                    'post': { method:'POST' },
                    'put': { method:'PUT' },
                    'delete': { method:'DELETE' }
                });
        };

        $scope.init = function () {
            this.request = {};
            this.url = {};
            this.query = { get: {}, put: {}, post: {}, delete: {} };
            this.requestBody = '';
            this.responseAvailable = false;

            this.buildTester();
        };

        $scope.init();
    });
