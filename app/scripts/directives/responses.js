'use strict';

(function() {
  RAML.Directives.responses = function(DataStore) {
    function linkResponses($scope) {
      var responseBaseKey = $scope.resource.toString() + ':' + $scope.method.method;
      var selectedCode = DataStore.get(responseBaseKey);
      var displayed = {};

      selectedCode = selectedCode || Object.keys($scope.method.responses || {}).sort()[0];

      $scope.select = function select(responseCode) {
        selectedCode = responseCode;
        DataStore.set(responseBaseKey, responseCode);
      };

      $scope.selected = function selected(responseCode) {
        return selectedCode === responseCode;
      };

      $scope.displayed = function(contentType) {
        return displayed[contentType];
      };

      $scope.prepareView = function(contentType) {
        displayed[contentType] = true;
      };
    }

    return {
      restrict: 'E',
      templateUrl: 'views/responses.tmpl.html',
      link: linkResponses
    };
  };
})();
