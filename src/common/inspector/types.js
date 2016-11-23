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

  function isSchema(typeName) {
    try {
      JSON.parse(typeName);
      return true;
    } catch (error) {
      return false;
    }
  }

  function find(name, collection) {
    var found;
    var length = collection.length;
    for (var i = 0; i < length; i++) {
      if (collection[i][name]) {
        found = collection[i][name];
        break;
      }
    }
    return found;
  }

  function findType(typeName, types) {
    if (types) {
      typeName = cleanupTypeName(typeName);
      var existingType = find(typeName, types);
      return existingType;
    }
  }

  function findSchema(schemaName, schemas) {
    if (schemas) {
      var existingSchema = find(schemaName, schemas);
      return existingSchema;
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

  function typeDocumentation(type) {
    var result = [];

    if (type.minItems) {
      result.push('minItems: ' + type.minItems);
    }

    if (type.maxItems) {
      result.push('maxItems: ' + type.maxItems);
    }

    if (type['enum']) {
      var enumValues = type['enum'];
      var enumDescription = '';

      if (enumValues.length > 1) {
        enumDescription += 'one of ';
      }

      enumDescription += '(' + enumValues.filter(function (value) { return value !== ''; }).join(', ') + ')';

      result.push(enumDescription);
    }

    if (type.pattern) {
      result.push('pattern: ' + type.pattern);
    }

    if (type.minLength) {
      result.push('minLength: ' + type.minLength);
    }

    if (type.maxLength) {
      result.push('maxLength: ' + type.maxLength);
    }

    if (type.minimum) {
      result.push('minimum: ' + type.minimum);
    }

    if (type.format) {
      result.push('format: ' + type.format);
    }

    if (type.multipleOf) {
      result.push('multipleOf: ' + type.multipleOf);
    }

    if (type.fileTypes) {
      result.push('fileTypes: ' + type.fileTypes.join(', '));
    }

    return result.join(', ');
  }

  RAML.Inspector.Types = {
    mergeType:           mergeType,
    isNativeType:        isNativeType,
    isSchema:            isSchema,
    findType:            findType,
    findSchema:          findSchema,
    getTypeInfo:         getTypeInfo,
    getTypeFromTypeInfo: getTypeFromTypeInfo,
    ensureArray:         ensureArray,
    cleanupTypeName:     cleanupTypeName,
    typeDocumentation:   typeDocumentation
  };
})();
