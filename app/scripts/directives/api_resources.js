(function() {
  'use strict';

  RAML.Directives.apiResources = function() {
    var controller = function($scope) {
      var self = $scope.apiResources = this;
      this.collapsed = {};

      this.toggleAll = function(collapsed) {
        $scope.api.resourceGroups.forEach(function(group) {
          var key = self.keyFor(group);
          self.collapsed[key] = collapsed;
        });
      };

      this.isCollapsed = function(group) {
        var key = self.keyFor(group);
        return self.collapsed[key];
      };
    };

    controller.prototype.keyFor = function(group) {
      return group[0].pathSegments[0].toString();
    };

    return {
      restrict: 'E',
      templateUrl: 'views/api_resources.tmpl.html',
      replace: true,
      controller: controller
    };
  };
})();
