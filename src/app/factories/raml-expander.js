(function () {
  'use strict';

  angular.module('raml')
    .factory('ramlExpander',['$http', '$q', 'jsTraverse', function ramlExpander(
      $http,
      $q,
      jsTraverse
    ) {
      return {
        expandRaml: expandRaml
      };

      // ---

      function retrieveType(raml, typeName) {
        if (!raml.types) { return; }

        var object = raml.types.filter(function (type) { return type[typeName]; })[0];
        return object ? object[typeName] : object;
      }

      function replaceTypeIfExists(raml, type, value) {
        var valueHasExamples = value.example || value.examples;
        var expandedType = retrieveType(raml, type);
        if (expandedType) {
          for (var key in expandedType) {
            if (expandedType.hasOwnProperty(key)) {
              if (['example', 'examples'].includes(key) && valueHasExamples) { continue; }
              value[key] = expandedType[key];
            }
          }
        }
      }

      function dereferenceTypes(raml) {
        jsTraverse.traverse(raml).forEach(function (value) {
          if (this.path.slice(-2).join('.') === 'body.application/json' && value.type) {
            var type = value.type[0];
            replaceTypeIfExists(raml, type, value);
          }
        });

      }

      function extractArrayType(arrayNode) {
        if(arrayNode.items.type) { return arrayNode.items.type[0]; }
        return arrayNode.items;
      }

      function isNotObject(value) {
        return value === null || typeof value !== 'object';
      }

      function dereferenceTypesInArrays(raml) {
        jsTraverse.traverse(raml).forEach(function (value) {
          if (this.path.slice(-2).join('.') === 'body.application/json' && value.type && value.type[0] === 'array') {
            var type = extractArrayType(value);
            if (isNotObject(value.items)) { value.items = {}; }
            replaceTypeIfExists(raml, type, value.items);

            if (!value.examples && !value.example) { generateArrayExampleIfPossible(value); }
          }
        });

      }

      function generateArrayExampleIfPossible(arrayNode) {
        var examples = getExampleList(arrayNode.items);
        if (examples.length === 0 ) { return; }

        arrayNode.example = examples;
      }

      function getExampleList(node) {
        if(node.examples) {
          return node.examples.map(function (example) {
            return example.structuredValue;
          });
        }
        if(node.example) { return [node.example]; }

        return [];
      }

      function dereferenceSchemas(raml) {
        jsTraverse.traverse(raml).forEach(function (value) {
          if (this.path.slice(-2).join('.') === 'body.application/json' && value.schema) {
            var schema = value.schema[0];
            replaceSchemaIfExists(raml, schema, value);
          }
        });
      }

      function inlineSchemaRefs(raml) {

        function inlineSchema(obj) {
          delete obj.$schema;
          delete obj.id;
          return obj;
        }

        // get a property of obj. Property path is defined as an array.
        function getProperty(obj, namesArray) {
          return namesArray.reduce(function(obj, field){return obj[field];}, obj);
        }

        // Set a property of obj. Property path is defined as an array.
        function setProperty(obj, namesArray, value) {
          if(namesArray.length == 0) {
            return value;
          }
          var prop = getProperty(obj, namesArray.slice(0, -1));
          prop[namesArray[namesArray.length - 1]] = value;
        }

        // returns - Array[{key: Array, value: Object}], where key is a full path to the value.
        function flatten(obj) {
          return jsTraverse.traverse(obj).paths()
            .map(function(path){return {key: path, value: getProperty(obj, path)};});
        }

        // Returns - fully exapanded schema at the ref.
        function expandRef(ref) {
          var defaultResult = Promise.resolve(ref);
          if (ref.startsWith('http')) {
            return $http.get(ref).then(function(refSchema) {
              return expandSchema(refSchema.data)
            });
          }
          else {
            // Relative references to other files are not supported,
            // because we don't know relative schema locations.
            // I.e. something like `definitions.schema#/definitions` won't work.
            // TODO: add local ref resolution (should happen in a separate pass).
            console.warn('Unsupported schema reference: ' + ref);
          }
          return defaultResult;
        }

        function expandSchema(schema) {
          var expandedRefsP = flatten(schema)
            .filter(function(e){ return e.key[e.key.length-1] === '$ref';})
            .map(function(e){
              return expandRef(e.value)
                .then(function(expandedSchema){
                  return {key: e.key.slice(0, -1), value: inlineSchema(expandedSchema)};
                });
            });

          return Promise.all(expandedRefsP)
            .then(function(expandedRefs){
              expandedRefs.forEach(function(expandedRef){
                setProperty(schema, expandedRef.key, expandedRef.value);
              });
            })
            .then(function(){
              return schema;
            });
        }

        var schemaRegex = /{\s+"\$schema"/;
        var expandedSchemasP = flatten(raml)
          .filter(function(e){
            return angular.isString(e.value) && e.value.match(schemaRegex);
          })
          .map(function(e){
            return expandSchema(JSON.parse(e.value))
              .then(function(schema){
                return {key: e.key, value: schema};
              });
          });

        return Promise.all(expandedSchemasP)
          .then(function(expandedSchemas) {
            expandedSchemas.forEach(function(expandedSchema){
              setProperty(raml, expandedSchema.key, JSON.stringify(expandedSchema.value, null, 2));
            });
          })
          .then(function() {return raml;});
      }

      function replaceSchemaIfExists(raml, schema, value) {
        var expandedSchema = retrieveSchema(raml, schema);
        if (expandedSchema) {
          value.schema[0] = expandedSchema.type[0];
        }
      }

      function retrieveSchema(raml, schemaName) {
        if (!raml.schemas) { return; }

        var object = raml.schemas.filter(function (schema) { return schema[schemaName]; })[0];
        return object ? object[schemaName] : object;
      }

      function expandRaml(raml) {
        dereferenceTypes(raml);
        dereferenceSchemas(raml);
        dereferenceTypesInArrays(raml);
        return inlineSchemaRefs(raml);
      }

    }])
  ;
})();
