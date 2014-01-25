(function() {
  'use strict';

  RAML.Directives.apiResources = function(DataStore) {
    var controller = function($scope) {
      var self = $scope.apiResources = this;
      this.groups = $scope.api.resourceGroups;
      this.collapsed = {};

      this.groups.forEach(function(group) {
        var key = self.keyFor(group);
        self.collapsed[key] = DataStore.get(key);
      });

      this.toggleAll = function(collapsed) {
        this.groups.forEach(function(group) {
          var key = self.keyFor(group);
          self.collapsed[key] = collapsed;
        });
      };

      this.isCollapsed = function(group) {
        var key = self.keyFor(group);
        return self.collapsed[key];
      };

      $scope.$watch('apiResources.collapsed', function(state) {
        Object.keys(state).forEach(function(key) {
          DataStore.set(key, state[key]);
        });
      }, true);
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
