'use strict';

(function() {
  RAML.Directives.responses = function(DataStore) {
    function linkResponses($scope) {
      $scope.keyBase = $scope.resource.toString() + ':' + $scope.method.method;

      $scope.select = function select(responseCode) {
        selectedCode = responseCode;
        DataStore.set($scope.keyBase, responseCode);
      };

      $scope.selected = function selected(responseCode) {
        return selectedCode === responseCode;
      };

      var selectedCode = DataStore.get($scope.keyBase);

      selectedCode = selectedCode || Object.keys($scope.method.responses || {}).sort()[0];

    }

    return {
      restrict: 'E',
      templateUrl: 'views/responses.tmpl.html',
      link: linkResponses
    };
  };
})();
