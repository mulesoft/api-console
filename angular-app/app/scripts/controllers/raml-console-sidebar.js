angular.module('ramlConsoleApp')
    .controller('ramlConsoleSidebar', function ($scope, $filter, eventService) {
        $scope.elementName = '';

        $scope.elementClick = function (id) {
            var data = this.resource || this.documentation;

            var result = {
                data: $filter('filter')(data, {
                    $$hashKey: id
                }),
                isDocumentation: this.documentation ? true : false,
                isResource: this.resource ? true : false
            };

            $scope.elementName = id;

            eventService.broadcast('event:raml-sidebar-clicked', result);
        };

        $scope.isElementActive = function (elementName) {
            return elementName === $scope.elementName;
        };
    });