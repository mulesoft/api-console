(function() {
  'use strict';

  function isNativeType(typeName) {
    typeName = typeName.replace('[]', '');
    var nativeTypes = ['string', 'boolean', 'number', 'integer', 'object'];
    return nativeTypes.indexOf(typeName) !== -1;
  }

  function find(name, collection) {
    return collection.find(function (item) {
      return item[name];
    });
  }

  function findType(typeName, types) {
    if (types) {
      typeName = typeName.replace('[]', '');
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
    var properties = angular.copy(resultingType.properties || {});

    properties = convertProperties(resultingType);

    if (!isNativeType(type.type[0])) {
      type.type.forEach(function (superType) {
        properties = getSuperTypesProperties(properties, superType, types);
      });
    }
    if (properties) {
      var propertiesKeys = Object.keys(properties).sort();

      if (propertiesKeys.length > 0) {
        resultingType.properties = propertiesKeys.map(function (key) {
          return properties[key];
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
      typeInfo.parts = types.map(function (type) {
        return type.trim();
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

  RAML.Inspector.Types = {
    mergeType:    mergeType,
    isNativeType: isNativeType,
    findType:     findType,
    findSchema:   findSchema,
    getTypeInfo:  getTypeInfo
  };
})();
