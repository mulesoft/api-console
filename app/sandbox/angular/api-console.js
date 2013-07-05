ramlModule.directive('console', function ($rootScope) {
    return {
        require: '^definition',
        restrict: 'E',
        transclude: true,
        scope: {},
        template: '<div><ul><li ng-repeat="resource in resources">{{resource.name}}</li></ul></div>',
        replace: true,
        link: function ($scope, $element, $attributes, defController) {
            $scope.resources = [];

            $rootScope.$on('event:raml-parsed', function (e, args) {
                $scope.resources = args.resources;
                $scope.$apply();
            });
        }
    };
});