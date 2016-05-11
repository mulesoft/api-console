(function() {
  'use strict';

  var UNION_ARRAY_REGEXP = /^\([^\)]*\)\[\]$/;

  function cleanupTypeName(typeName) {
    return typeName.replace('[]', '').replace('(', '').replace(')', '').trim();
  }

  function isNativeType(typeName) {
    typeName = cleanupTypeName(typeName);
    var nativeTypes = [
      'object',
      'string',
      'number',
      'integer',
      'boolean',
      'date-only',
      'time-only',
      'datetime-only',
      'datetime',
      'file',
      'array'
    ];
    return nativeTypes.indexOf(typeName) !== -1;
  }

  function find(name, collection) {
    return collection.find(function (item) {
      return item[name];
    });
  }

  function findType(typeName, types) {
    if (types) {
      typeName = cleanupTypeName(typeName);
      var existingType = find(typeName, types);
      return existingType ? existingType[typeName] : existingType;
    }
  }

  function findSchema(schemaName, schemas) {
    if (schemas) {
      var existingSchema = find(schemaName, schemas);
      return existingSchema ? existingSchema[schemaName] : existingSchema;
    }
  }

  function getSuperTypesProperties(properties, typeName, types) {
    if (!isNativeType(typeName)) {
      var superType = findType(typeName, types);

      if (superType) {
        var superTypeProperties = convertProperties(superType);
        properties = angular.extend({}, superTypeProperties, properties);
        return getSuperTypesProperties(properties, superType.type[0], types);
      }
    }
    return properties;
  }

  function convertProperties(type) {
    if (type.properties) {
      Object.keys(type.properties).forEach(function (propertyKey) {
        var aProperty = type.properties[propertyKey];
        if (type.discriminator && type.discriminator === aProperty[0].name) {
          aProperty[0].discriminator = true;
        }
      });
    }
    return type.properties;
  }

  function mergeType(type, types) {
    var resultingType = angular.copy(type);
    resultingType.type = resultingType.type || resultingType.schema;
    var properties = angular.copy(resultingType.properties || {});
    var currentType = Array.isArray(resultingType.type) ?
        resultingType.type[0] : resultingType.type;

    properties = convertProperties(resultingType);

    if (!isNativeType(currentType)) {
      resultingType.type.forEach(function (superType) {
        properties = getSuperTypesProperties(properties, superType, types);
      });
    }
    if (properties) {
      var propertiesKeys = Object.keys(properties).sort();

      if (propertiesKeys.length > 0) {
        resultingType.properties = propertiesKeys.map(function (key) {
          return ensureArray(properties[key]);
        });
      }
    }

    return resultingType;
  }

  function getTypeInfo(typeName) {
    var types = typeName.split('|');
    var typeInfo = {};

    if (types.length > 1) {
      typeInfo.type = 'union';
      typeInfo.isArray = UNION_ARRAY_REGEXP.test(typeName);
      typeInfo.parts = types.map(function (type) {
        return cleanupTypeName(type);
      });
    } else if (typeName.indexOf('[]') !== -1) {
      typeInfo.type = 'array';
      typeInfo.parts = [typeName.replace('[]', '').trim()];
    } else {
      typeInfo.type = 'custom';
      typeInfo.parts = [typeName.trim()];
    }

    return typeInfo;
  }

  function getTypeFromTypeInfo(typeInfo) {
    var type;
    if (typeInfo.type === 'union') {
      type = typeInfo.parts.join('|');
      if (typeInfo.isArray) {
        type = '(' + type + ')[]';
      }

      return type;
    } else if (typeInfo.type === 'array') {
      return typeInfo.parts.join('') + '[]';
    } else {
      return typeInfo.parts.join('');
    }
  }

  function ensureArray(type) {
    return Array.isArray(type) ? type : [type];
  }

  RAML.Inspector.Types = {
    mergeType:           mergeType,
    isNativeType:        isNativeType,
    findType:            findType,
    findSchema:          findSchema,
    getTypeInfo:         getTypeInfo,
    getTypeFromTypeInfo: getTypeFromTypeInfo,
    ensureArray:         ensureArray,
    cleanupTypeName:     cleanupTypeName
  };
})();
