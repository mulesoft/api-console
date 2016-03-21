(function () {
  'use strict';
  angular.module('RAML.Services').factory('TypeService', function () {
    return {
      isNativeType: isNativeType,
      isArrayType: isArrayType,
      isUnionType: isUnionType,
      isCustomType: isCustomType,
      isProperties: isProperties
    };

    function isNativeType(type) {
      return type === 'string' || type === 'number' || type === 'boolean';
    }

    function isArrayType(type) {
      return type === 'array';
    }

    function isUnionType(type) {
      return type === 'union';
    }

    function isCustomType(type) {
      return type && !isNativeType(type) && !isArrayType(type) &&
        !isUnionType(type);
    }

    function isProperties(type) {
      return !type.type && type.properties;
    }
  });
})();
