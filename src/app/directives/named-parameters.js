(function () {
  'use strict';

  RAML.Directives.namedParameters = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/named-parameters.tpl.html',
      replace: true,
      scope: {
        src: '=',
        context: '=',
        type: '@',
        title: '@'
      },
      controller: ['$scope', '$attrs', function ($scope, $attrs) {
        $scope.markedOptions = RAML.Settings.marked;

        if ($attrs.hasOwnProperty('enableCustomParameters')) {
          $scope.enableCustomParameters = true;
        }

        if ($attrs.hasOwnProperty('showBaseUrl')) {
          $scope.showBaseUrl = true;
        }

        $scope.segments = [];

        var baseUri = $scope.$parent.raml.baseUri;

        if (typeof baseUri !== 'undefined' && baseUri.templated) {
          var tokens = baseUri.tokens;

          for (var i = 0; i < tokens.length; i++) {
            $scope.segments.push({
              name: tokens[i],
              templated: typeof baseUri.parameters[tokens[i]] !== 'undefined' ? true : false
            });
          }
        }

        $scope.$parent.resource.pathSegments.map(function (element) {
          var tokens = element.tokens;

          for (var i = 0; i < tokens.length; i++) {
            $scope.segments.push({
              name: tokens[i],
              templated: element.templated && typeof element.parameters[tokens[i]] !== 'undefined' ? true : false
            });
          }
        });

        $scope.addCustomParameter = function () {
          $scope.context.customParameters[$scope.type].push({});
        };

        $scope.removeCutomParam = function (param) {
          $scope.context.customParameters[$scope.type] = $scope.context.customParameters[$scope.type].filter(function (el) {
            return el.name !== param.name;
          });
        };

        $scope.isValueProvided = function isValueProvided(value) {
          if (!value) {
            return false;
          }

          if (typeof value !== 'object') {
            return true;
          }

          return Object.keys(value).filter(function (k) {
            return $scope.isValueProvided(value[k]);
          }).length > 0;
        };

        $scope.stringify = function stringify(value) {
          return JSON.stringify(value);
        };

        $scope.cleanupValue = function cleanupValue(value) {
          if (typeof value !== 'object') {
            return value;
          }
          var cleanedValue = {};
          Object.keys(value).forEach(function (key) {
            cleanedValue[key] = $scope.cleanupValue(value[key] ? value[key][0] : value[key]);
          });

          return cleanedValue;
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('namedParameters', RAML.Directives.namedParameters);
})();
