(function() {
  'use strict';

  RAML.Directives.bodyDocumentation = function(DataStore) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/body_documentation.tmpl.html',
      link: function($scope) {
        var displayed = {};
        $scope.displayed = function(contentType) {
          return displayed[contentType];
        };

        $scope.prepareView = function(name) {
          displayed[name] = true;
        };

        $scope.bodyKey = function() {
          return $scope.resourceView.methodKey() + ':body';
        };

        $scope.expandSchema = function(contentType) {
          var key = $scope.bodyKey() + ':schemaExpanded:' + contentType;
          return DataStore.set(key, true);
        };

        $scope.schemaExpanded = function(contentType) {
          var key = $scope.bodyKey() + ':schemaExpanded:' + contentType;
          return DataStore.get(key);
        };
      }
    };
  };
})();
