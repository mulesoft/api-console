(function() {
  'use strict';

  RAML.Controllers.BodyDocumentation = function bodyDocumentationController($scope, DataStore) {
    var displayed = {};

    $scope.bodyKey =  $scope.keyBase + ':body';

    $scope.expandSchema = function(contentType) {
      var key = $scope.bodyKey + ':schemaExpanded:' + contentType;
      return DataStore.set(key, true);
    };

    $scope.schemaExpanded = function(contentType) {
      var key = $scope.bodyKey + ':schemaExpanded:' + contentType;
      return DataStore.get(key);
    };

    $scope.displayed = function(contentType) {
      return displayed[contentType];
    };

    $scope.prepareView = function(contentType) {
      displayed[contentType] = true;
    };
  };
})();
