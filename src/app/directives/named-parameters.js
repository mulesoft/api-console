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

        Object.keys($scope.context[$scope.type].plain).map(function (key) {
          var definition = $scope.context[$scope.type].plain[key].definitions[0];

          if (typeof definition.enum !== 'undefined') {
            $scope.context[$scope.type].values[definition.id][0] = definition.enum[0];
          }
        });

        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };

        $scope.canOverride = function (definition) {
          return definition.type === 'boolean' ||  typeof definition.enum !== 'undefined';
        };

        $scope.overrideField = function ($event, definition) {
          var $this      = jQuery($event.currentTarget);
          var $container = $this.closest('p');
          var $el        = $container.find('#' + definition.id);
          var $checkbox  = $container.find('#checkbox_' + definition.id);
          var $select    = $container.find('#select_' + definition.id);

          $el.toggleClass('sidebar-override-show');
          $checkbox.toggleClass('sidebar-override-hide');
          $select.toggleClass('sidebar-override-hide');

          $this.text('Override');

          if($el.hasClass('sidebar-override-show')) {
            $this.text('Cancel override');
          } else {
            $scope.context[$scope.type].values[definition.id][0] = definition.enum[0];
          }
        };

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
