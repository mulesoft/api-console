angular.module('ramlConsoleApp')
  .controller('ramlConsoleSidebar', function ($scope, $filter, eventService) {
    $scope.elementClick = function (id) {
      var data = this.resource || this.documentation;

      eventService.broadcast('event:raml-sidebar-clicked', $filter('filter')(data, {
        $$hashKey: id
      }));
    };
  });