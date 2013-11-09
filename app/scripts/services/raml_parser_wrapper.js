(function() {
  'use strict';

  RAML.Services.RAMLParserWrapper = function($rootScope, ramlParser) {
    var PARSE_SUCCESS = 'event:raml-parsed',
        PARSE_FAILURE = 'event:raml-invalid';

    function success(raml) {
      $rootScope.$broadcast(PARSE_SUCCESS, raml);
    }

    function error(message) {
      $rootScope.$broadcast(PARSE_FAILURE, message);
    }

    var load = function(file) {
      ramlParser.loadFile(file).then(success, error);
    };

    var parse = function(raml) {
      ramlParser.load(raml).then(success, error);
    };

    return {
      load: load,
      parse: parse,
      PARSE_SUCCESS: PARSE_SUCCESS,
      PARSE_FAILURE: PARSE_FAILURE
    };
  };
})();
