angular.module('ramlConsoleApp')
    .controller('ramlOperationDetailsTryIt', function ($scope, $resource, commons, eventService) {
        $scope.hasAdditionalParams = function (operation) {
            return operation.query || operation.method === 'post' || operation.method === 'put';
        };

        $scope.hasRequestBody = function (operation) {
            return operation.method === 'post' || operation.method === 'put';
        };

        $scope.showResponse = function () {
            return this.response;
        };

        $scope.tryIt = function () {
            var params = {};
            var tester = new this.testerResource();
            var body = this.hasRequestBody(this.operation) ? this.requestBody[this.operation.method] : null;

            commons.extend(params, this.url);
            commons.extend(params, this.query[this.operation.method]);
            tester.body = body || null;

            this.response = null;
            this.$request(tester, params, this.operation.method);
        };

        $scope.$request = function (tester, params, method) {
            var that = this;

            tester['$' + method](params, function (data, headers, status, url) {
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
            });
        };

        $scope.transformResponse = function (data, headers) {
            try {
                data = JSON.parse(data);
                data = angular.toJson(data, true);
            }
            catch (e) {}

            return { data: data, headers: headers() };
        };

        $scope.transformRequest = function (data, headers) {
            return (data && data.body) ? data.body : null;
        };

        $scope.buildTester = function () {
            var resourceUri = this.baseUri + this.resource.relativeUri.replace(/{/g, ':').replace(/}/g, '');
            this.testerResource = $resource(resourceUri, null, {
                'get': {
                    method:'GET',
                    transformResponse: this.transformResponse,
                    transformRequest: this.transformRequest
                },
                'post': {
                    method:'POST',
                    transformResponse: this.transformResponse,
                    transformRequest: this.transformRequest
                },
                'put': {
                    method:'PUT',
                    transformResponse: this.transformResponse,
                    transformRequest: this.transformRequest
                },
                'delete': {
                    method:'DELETE',
                    transformResponse: this.transformResponse,
                    transformRequest: this.transformRequest
                }
            });
        };

        $scope.init = function () {
            if (!this.request) {
                this.request = {};
            }

            if (!this.requestBody) {
                this.requestBody = { put: '', post: '' };
            }

            if (!this.url) {
                this.url = {};
            }

            if (!this.query) {
                this.query = { get: {}, put: {}, post: {}, delete: {} };
            }

            this.response = null;
            this.buildTester();
        };

        $scope.$on('event:raml-method-changed', function () {
            $scope.init();
        });

        $scope.init();
    });
