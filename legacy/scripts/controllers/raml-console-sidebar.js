angular.module('ramlConsoleApp')
    .controller('ramlConsoleSidebar', function ($scope, $filter, eventService, $rootScope) {
        var broadcast = function (data, isDoc, isRes) {
            var result = {
                data: data,
                isDocumentation: isDoc,
                isResource: isRes
            };

            $rootScope.elementName = data.name || (data[0] ? data[0].title : data.relativeUri);
            $rootScope.type = isDoc && !isRes ? 'document' : 'resource';

            if (isDoc) {
                eventService.broadcast('event:raml-sidebar-clicked', result);
            } else {
                eventService.broadcast('event:raml-operation-list-published', [data]);
            }
        };

        $rootScope.elementName = '';
        $rootScope.type = '';

        $scope.elementClick = function (id) {
            var data = this.resource || this.documentation;

            broadcast($filter('filter')(data, function (el) {
                return el.name === id || el.title === id;
            }), this.documentation ? true : false, this.resource ? true : false);
        };

        $scope.isElementActive = function (elementName, type) {
            return elementName === $rootScope.elementName && type === $rootScope.type;
        };

        $scope.initialStatus = function () {
            var doc = this.documentation && this.documentation.length ? this.documentation[0] : null,
                res = this.resources && this.resources.length ? this.resources[0] : null;

            if (doc) {
                broadcast([doc], true, false);
            } else if (res) {
                broadcast(res, false, true);
            }
        };

        $scope.$watch('resources || documentation', $scope.initialStatus.bind($scope), true);
    });