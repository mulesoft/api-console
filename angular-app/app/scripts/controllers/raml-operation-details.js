angular.module('ramlConsoleApp')
    .controller('ramlOperationDetails', function ($scope, $filter, eventService) {

        $scope.initTabs = function () {
            if (this.tabs) {
                return;
            }

            this.tabs = [];
            this.tabs.push({
                name: 'try-it',
                displayName: 'Try It',
                view: 'views/raml-operation-details-try-it.tmpl.html',
                show: function () {
                    return true;
                }
            });

            this.tabs.push({
                name: 'parameters',
                displayName: 'Parameters',
                view: 'views/raml-operation-details-parameters.tmpl.html',
                show: function () {
                    return typeof $scope.operation.queryParameters !== 'undefined';
                }
            });

            this.tabs.push({
                name: 'requests',
                displayName: 'Request',
                view: 'views/raml-operation-details-request.tmpl.html',
                show: function () {
                    return typeof $scope.operation.request !== 'undefined';
                }
            });

            this.tabs.push({
                name: 'response',
                displayName: 'Response',
                view: 'views/raml-operation-details-response.tmpl.html',
                show: function () {
                    return typeof $scope.operation.responses !== 'undefined';
                }
            });

            this.tabName = this.tabs[0].name;
        };

        $scope.$on('event:raml-method-changed', function () {
            $scope.init();
        });

        $scope.isTabActive = function (tabName) {
            return tabName === $scope.tabName;
        };

        $scope.changeTab = function (tabName) {
            $scope.tabName = tabName;
        };

        $scope.requestFilter = function (el) {
            return el.method === $scope.operation.method && typeof el.body !== 'undefined' && typeof el.body[$scope.bodyType.name] !== 'undefined';
        };

        $scope.changeBodyType = function (bodyTypeName) {
            debugger  
            // var bodyParam = $filter('filter')(this.bodyParams, {
            //     name: bodyTypeName
            // });
            // if (bodyParam && bodyParam.length) {
            //     $scope.bodyType = bodyParam[0];

            //     eventService.broadcast('event:raml-body-type-changed', bodyTypeName);
            // }
        };

        $scope.responseFilter = function (el) {
            return el.name === $scope.operation.name && typeof el.responses !== 'undefined';
        };

        $scope.initTabs();
    });