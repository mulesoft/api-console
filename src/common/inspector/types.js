(function() {
  'use strict';

  function isNativeType(typeName) {
    typeName = typeName.replace('[]', '');
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

  function getTypeInfo(typeName) {
    var types = typeName.split('|');
    var typeInfo = {};

    if (types.length > 1) {
      typeInfo.type = 'union';
      typeInfo.parts = types.map(function (type) {
        return type.trim();
      });
    } else if (typeName.indexOf('[]')) {
      typeInfo.type = 'array';
      typeInfo.parts = [typeName.replace('[]', '').trim()];
    } else {
      typeInfo.type = 'custom';
      typeInfo.parts = [typeName.trim()];
    }

    return typeInfo;
  }

  RAML.Inspector.Types = {
    mergeType: mergeType,
    isNativeType: isNativeType,
    getType: getType,
    getTypeInfo: getTypeInfo
  };
})();
