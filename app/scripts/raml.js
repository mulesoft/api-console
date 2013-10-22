'use strict';

(function() {
  var module = angular.module('raml', []);

  module.factory('ramlParser', function () {
    return RAML.Parser;
  });

})();
