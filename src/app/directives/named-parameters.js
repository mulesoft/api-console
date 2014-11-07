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
      controller: function ($scope, $attrs) {
        if ($attrs.hasOwnProperty('enableCustomParameters')) {
          $scope.enableCustomParameters = true;
        }

        if ($attrs.hasOwnProperty('showBaseUrl')) {
          $scope.showBaseUrl = true;
        }

        $scope.reset = function (param) {
          $scope.context[$scope.type].reset($scope.src, param[0].id);
        };

        $scope.hasExampleValue = function (value) {
          return value.type === 'boolean' ? false : typeof value.enum !== 'undefined' ? false : typeof value.example !== 'undefined' ? true : false;
        };

        $scope.addCustomParameter = function () {
          $scope.context.customParameters[$scope.type].push({});
        };

        $scope.removeCutomParam = function (param) {
          $scope.context.customParameters[$scope.type] = $scope.context.customParameters[$scope.type].filter(function (el) {
            return el.name !== param.name;
          });
        };

        $scope.isDefault = function (definition) {
          return typeof definition.enum === 'undefined' && definition.type !== 'boolean';
        };

        $scope.isEnum = function (definition) {
          return typeof definition.enum !== 'undefined';
        };

        $scope.isBoolean = function (definition) {
          return definition.type === 'boolean';
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('namedParameters', RAML.Directives.namedParameters);
})();
