(function () {
  'use strict';

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
        }

        $scope.mergeType = function (type) {
          if (!$scope.isNestedProperty) {
            return RAML.Inspector.Types.mergeType(type, $rootScope.types);
          }
          return type;
        };

        $scope.isNativeType = RAML.Inspector.Types.isNativeType;

        $scope.isCollapsible = function isCollapsible(property) {
          return $scope.collapsible && !!(property.description || (property.example !== undefined) || property.properties);
        };

        $scope.parameterDocumentation = function (parameter) {
          var result = '';

          if (parameter) {
            if (parameter.required) {
              result += 'required, ';
            }

            if (parameter['enum']) {
              var enumValues = $scope.unique(parameter['enum']);

              if (enumValues.length > 1) {
                result += 'one of ';
              }

              result += '(' + enumValues.filter(function (value) { return value !== ''; }).join(', ') + ')';
            }

            if (parameter.pattern) {
              result += ' matching ' + parameter.pattern;
            }

            if (parameter.minLength && parameter.maxLength) {
              result += ', ' + parameter.minLength + '-' + parameter.maxLength + ' characters';
            } else if (parameter.minLength && !parameter.maxLength) {
              result += ', at least ' + parameter.minLength + ' characters';
            } else if (parameter.maxLength && !parameter.minLength) {
              result += ', at most ' + parameter.maxLength + ' characters';
            }

            if (parameter.minimum && parameter.maximum) {
              result += ' between ' + parameter.minimum + '-' + parameter.maximum;
            } else if (parameter.minimum && !parameter.maximum) {
              result += ' ≥ ' + parameter.minimum;
            } else if (parameter.maximum && !parameter.minimum) {
              result += ' ≤ ' + parameter.maximum;
            }

            if (parameter.repeat) {
              result += ', repeatable';
            }

            if (parameter['default'] !== undefined) {
              result += ', default: ' + parameter['default'];
            }
          }

          return result;
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
