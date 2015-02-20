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
      controller: function($scope) {
        var bodyContent = $scope.$parent.context.bodyContent;
        var context     = $scope.$parent.context[$scope.$parent.type];

        if (bodyContent) {
          context = context || bodyContent.definitions[bodyContent.selected];
        }

        Object.keys(context.plain).map(function (key) {
          var definition = context.plain[key].definitions[0];

          if (typeof definition.enum !== 'undefined') {
            context.values[definition.id][0] = definition.enum[0];
          }
        });

        $scope.canOverride = function (definition) {
          return definition.type === 'boolean' ||  typeof definition.enum !== 'undefined';
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
            $scope.context[$scope.type].values[definition.id][0] = definition.enum[0];
          }
        };

        $scope.onChange = function () {
          $scope.$parent.context.forceRequest = false;
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

        $scope.hasExampleValue = function (value) {
          return $scope.isEnum(value) ? false : value.type === 'boolean' ? false : typeof value.enum !== 'undefined' ? false : typeof value.example !== 'undefined' ? true : false;
        };

        $scope.reset = function (param) {
          var type = $scope.$parent.type || 'bodyContent';
          var info = {};

          info[param.id] = [param];

          $scope.$parent.context[type].reset(info, param.id);
        };

        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlField', RAML.Directives.ramlField);
})();
