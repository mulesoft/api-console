'use strict';

(function() {
  RAML.Directives.responses = function(DataStore) {
    var controller = function($scope) {
      var self = $scope.responsesView = this;
      this.responses = $scope.method.responses || {};
      this.expanded = {};
      this.responseBaseKey = $scope.resource.toString() + ':' + $scope.method.method;

      Object.keys(this.responses).forEach(function(code) {
        self.expanded[code] = DataStore.get(self.responseBaseKey + ':' + code);
      });

      $scope.$watch('responsesView.expanded', function(state) {
        Object.keys(state).forEach(function(code) {
          DataStore.set(self.responseBaseKey + ':' + code, state[code]);
        });
      }, true);
    };

    return {
      restrict: 'E',
      templateUrl: 'views/responses.tmpl.html',
      controller: controller
    };
  };
})();
