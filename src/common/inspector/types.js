(function() {
  'use strict';

  function isNativeType(typeName) {
    var nativeTypes = ['string', 'boolean', 'number', 'integer', 'object'];
    return nativeTypes.indexOf(typeName) !== -1;
  }

  function getType(typeName, types) {
    typeName = typeName.replace('[]', '');
    var existingType = types.find(function (aType) {
      return aType[typeName];
    });
    return existingType ? existingType[typeName] : existingType;
  }

  function getSuperTypesProperties(properties, typeName, types) {
    if (!isNativeType(typeName)) {
      var superType = getType(typeName, types);

      if (superType) {
        properties = angular.extend({}, superType.properties, properties);
        return getSuperTypesProperties(properties, superType.type[0], types);
      }
    } else {
      return properties;
    }
  }

  function mergeType(type, types) {
    if (!isNativeType(type.type[0])) {
      var resultingType = angular.copy(type);
      resultingType.properties = getSuperTypesProperties(type.properties, type.type[0], types);

      return resultingType;
    }
    return type;
  }

  RAML.Inspector.Types = {
    mergeType: mergeType
  };
})();
