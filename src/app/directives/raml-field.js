(function () {
  'use strict';

  RAML.Directives.ramlField = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-field.tpl.html',
      replace: true,
      scope: {
        model: '=',
        param: '='
      },
      controller: ['$scope', function($scope) {
        var bodyContent = $scope.$parent.context.bodyContent;
        var context     = $scope.$parent.context[$scope.$parent.type];

        if (bodyContent) {
          context = context || bodyContent.definitions[bodyContent.selected];
        }

        $scope.overrideText = 'Override';

        $scope.canOverride = function (definition) {
          return definition.type === 'boolean' ||  typeof definition['enum'] !== 'undefined';
        };

        $scope.overrideField = function ($event, definition) {
          if(!definition.overwritten) {
            definition.overwritten = true;
            $scope.overrideText = 'Cancel override';
          } else {
            definition.overwritten = false;
            $scope.overrideText = 'Override';
            var validValues = (definition.type === 'boolean') ? [true, false, 'true', 'false'] : definition['enum'];
            for (var i = 0; i < $scope.model.length; i++) {
              if(validValues.indexOf($scope.model[i]) === -1) {
                $scope.model[i] = undefined;
              }
            }
          }
        };

        $scope.onChange = function () {
          $scope.$parent.context.forceRequest = false;
        };

        $scope.isDefault = function (definition) {
          return typeof definition['enum'] === 'undefined' && definition.type !== 'boolean';
        };

        $scope.isEnum = function (definition) {
          return typeof definition['enum'] !== 'undefined';
        };

        $scope.isBoolean = function (definition) {
          return definition.type === 'boolean';
        };

        $scope.isDropdown = function (definition) {
          return (typeof definition['enum'] !== 'undefined' || definition.type === 'boolean') && !definition.overwritten;
        };

        $scope.hasExampleValue = function (value) {
          return typeof value.example !== 'undefined';
        };

        $scope.reset = function (param, index) {
          var type = $scope.$parent.type || 'bodyContent';
          var info = {};

          info[param.id] = [param];

          $scope.$parent.context[type].reset(info, param.id, index);
        };

        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };

        $scope.booleanAsEnum = function () {
          if($scope.param.required) {
            return [true, false];
          } else {
            return [undefined, true, false];
          }
        };

        $scope.addRepeatedParameter = function () {
          $scope.model.push(undefined);
        };

        $scope.remove = function (index) {
          if($scope.model.length === 1) {
            $scope.model[0] = undefined;
          } else {
            $scope.model.splice(index, 1);
          }
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlField', RAML.Directives.ramlField);
})();
