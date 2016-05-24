(function () {
  'use strict';

  var PATTERN_PATTERN = /^\/[^\/]*\/$/;

  RAML.Directives.properties = function(RecursionHelper) {
    return {
      restrict: 'E',
      templateUrl: 'directives/properties.tpl.html',
      replace: true,
      scope: {
        list: '=',
        collapsible: '=',
        isNestedProperty: '=',
        hideTypeLinks: '=',
        hidePropertyDetails: '='
      },
      controller: function ($scope, $rootScope) {
        if (!Array.isArray($scope.list)) {
          $scope.listArray = Object.keys($scope.list).map(function (key) {
            return $scope.list[key];
          });

          $scope.listArray = RAML.Inspector.Properties.normalizeNamedParameters($scope.list);
        } else {
          $scope.listArray = $scope.list;
        }

        $scope.getType = function (type) {
          var newType = $scope.mergeType(type);
          newType.type = RAML.Inspector.Types.ensureArray(newType.type);

          if (newType.type[0] === 'array') {
            newType.type = newType.items.type.map(function (aType) {
              return aType + '[]';
            });
            newType.properties = newType.items.properties;
          }

          return newType;
        };

        $scope.mergeType = function (type) {
          var newType = angular.copy(type);

          if (!$scope.isNestedProperty && $rootScope.types) {
            return RAML.Inspector.Types.mergeType(newType, $rootScope.types);
          }
          return newType;
        };

        $scope.isNativeType = RAML.Inspector.Types.isNativeType;

        $scope.isPattern = function (propertyName) {
          return propertyName.match(PATTERN_PATTERN);
        };

        $scope.isSchema = RAML.Inspector.Types.isSchema;

        $scope.isCollapsible = function isCollapsible(property) {
          return $scope.collapsible && !!(property.description || property.properties || $scope.isSchema(property.type[0]));
        };

        $scope.parameterDocumentation = function (parameter) {
          var result = [];

          if (parameter) {
            if (parameter.required) {
              result.push('required');
            }

            if (parameter.discriminator) {
              result.push('discriminator');
            }

            if (parameter['enum']) {
              var enumValues = $scope.unique(parameter['enum']);
              var enumDescription = '';

              if (enumValues.length > 1) {
                enumDescription += 'one of ';
              }

              enumDescription += '(' + enumValues.filter(function (value) { return value !== ''; }).join(', ') + ')';

              result.push(enumDescription);
            }

            if (parameter.pattern) {
              result.push(' matching ' + parameter.pattern);
            }

            if (parameter.minLength && parameter.maxLength) {
              result.push(parameter.minLength + '-' + parameter.maxLength + ' characters');
            } else if (parameter.minLength && !parameter.maxLength) {
              result.push('at least ' + parameter.minLength + ' characters');
            } else if (parameter.maxLength && !parameter.minLength) {
              result.push('at most ' + parameter.maxLength + ' characters');
            }

            if (parameter.minimum && parameter.maximum) {
              result.push('between ' + parameter.minimum + '-' + parameter.maximum);
            } else if (parameter.minimum && !parameter.maximum) {
              result.push('≥ ' + parameter.minimum);
            } else if (parameter.maximum && !parameter.minimum) {
              result.push('≤ ' + parameter.maximum);
            }

            if (parameter.repeat) {
              result.push('repeatable');
            }

            if (parameter['default'] !== undefined) {
              result.push('default: ' + parameter['default']);
            }
          }

          return result.join(', ');
        };

        $scope.typeDocumentation = function (type) {
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
        };

        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };
      },
      compile: function (element) {
        return RecursionHelper.compile(element);
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('properties', RAML.Directives.properties);
})();
