(function () {
  'use strict';

  RAML.Directives.ramlField = function(RecursionHelper) {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-field.tpl.html',
      replace: true,
      scope: {
        context: '=',
        type: '=',
        types: '=',
        model: '=',
        param: '='
      },
      controller: ['$scope', function($scope) {
        var bodyContent = $scope.context.bodyContent;
        var context     = $scope.context[$scope.type];

        if (bodyContent) {
          context = context || bodyContent.definitions[bodyContent.selected];
        }

        Object.keys(context.plain).map(function (key) {
          var definition = context.plain[key].definitions[0];

          if (typeof definition['enum'] !== 'undefined') {
            context.values[definition.id][0] = definition['enum'][0];
          }
        });

        $scope.isArray = function (param) {
          return param.type[0].indexOf('[]') !== -1;
        };

        $scope.addArrayElement = function (model) {
          model.push([undefined]);
        };

        $scope.removeArrayElement = function (model, index) {
          model.splice(index, 1);
        };

        $scope.canOverride = function (definition) {
          return definition.type === 'boolean' ||  typeof definition['enum'] !== 'undefined';
        };

        $scope.overrideField = function ($event, definition) {
          var $this      = jQuery($event.currentTarget);
          var $container = $this.closest('p');
          var $el        = $container.find('#' + definition.id);
          var $checkbox  = $container.find('#checkbox_' + definition.id);
          var $select    = $container.find('#select_' + definition.id);

          $el.toggleClass('raml-console-sidebar-override-show');
          $checkbox.toggleClass('raml-console-sidebar-override-hide');
          $select.toggleClass('raml-console-sidebar-override-hide');

          $this.text('Override');

          if($el.hasClass('raml-console-sidebar-override-show')) {
            definition.overwritten = true;
            $this.text('Cancel override');
          } else {
            definition.overwritten = false;
            $scope.context[$scope.type].values[definition.id][0] = definition['enum'][0];
          }
        };

        $scope.onChange = function () {
          $scope.context.forceRequest = false;
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

        $scope.hasExampleValue = function (value) {
          return $scope.isEnum(value) ? false : value.type === 'boolean' ? false : typeof value['enum'] !== 'undefined' ? false : (typeof value.example !== 'undefined' || typeof value.examples !== 'undefined') ? true : false;
        };

        $scope.reset = function (param) {
          var type = $scope.type || 'bodyContent';
          var info = {};

          info[param.id] = [param];

          $scope.context[type].reset(info, param.id);
        };

        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };

        $scope.toString = function toString(value) {
          return Array.isArray(value) ? value.join(', ') : value;
        };
      }],
      compile: function (element) {
        return RecursionHelper.compile(element);
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlField', ['RecursionHelper', RAML.Directives.ramlField]);
})();
