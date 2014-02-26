(function() {
  'use strict';

  RAML.Controllers.BodyDocumentation = function bodyDocumentationController($scope, DataStore) {
    $scope.bodyKey =  $scope.keyBase + ':body';
    $scope.displayed = {};

    $scope.expandSchema = function(contentType) {
      var key = $scope.bodyKey + ':schemaExpanded:' + contentType;
      return DataStore.set(key, true);
    };

    $scope.schemaExpanded = function(contentType) {
      var key = $scope.bodyKey + ':schemaExpanded:' + contentType;
      return DataStore.get(key);
    };
  };
})();
