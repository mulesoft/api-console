(function() {
  'use strict';

  function generateKey(resource) {
    return resource.toString();
  }

  RAML.Controllers.Resource = function Resource($scope, DataStore, $element) {
    $scope.resourceView = this;
    $scope.$emit('console:resource:rendered', $scope.resource, $element);
    $scope.$on('$destroy', function() {
      $scope.$emit('console:resource:destroyed', $scope.resource);
    });

    this.expanded = DataStore.get(generateKey($scope.resource));

    this.openDocumentation = function($event, method) {
      $event.stopPropagation();

      this.expanded || this.toggleExpansion();
      $scope.$emit('console:expand', $scope.resource, method, $element);
    };

    this.toggleExpansion = function() {
      this.expanded = !this.expanded;
      DataStore.set(generateKey($scope.resource), this.expanded);
    };
  };
})();
