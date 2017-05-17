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
        param: '=',
        uploadRequest: '='
      },
      controller: ['$scope', function($scope) {
        function getParamType(definition) {
          if ($scope.types) {
            var type = RAML.Inspector.Types.findType(definition.type[0], $scope.types);
            return type ? type : definition;
          } else {
            return definition;
          }
        }

        $scope.isEnum = function (definition) {
          var paramType = getParamType(definition);
          return paramType.hasOwnProperty('enum');
        };

        $scope.getEnum = function (definition) {
          var paramType = getParamType(definition);
          return paramType['enum'];
        };

        var bodyContent = $scope.context.bodyContent;
        var context     = $scope.context[$scope.type];

        if (bodyContent) {
          context = context || bodyContent.definitions[bodyContent.selected];
        }

        Object.keys(context.plain).map(function (key) {
          var definition = context.plain[key].definitions[0];

          if ($scope.isEnum(definition)) {
            context.values[definition.id][0] =  getParamType(definition)['enum'][0];
          }
        });

        $scope.isFile = function (param) {
          return param.type === 'file';
        };

        $scope.isArray = function (param) {
          var paramType = getParamType(param);
          return paramType.type[0] === 'array';
        };

        $scope.canOverride = function (definition) {
          return definition.type === 'boolean' || $scope.isEnum(definition);
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
            $scope.context[$scope.type].values[definition.id][0] = $scope.getEnum(definition)[0];
          }
        };

        $scope.onChange = function () {
          $scope.context.forceRequest = false;
          if ($scope.uploadRequest) {
            $scope.uploadRequest();
          }
        };

        $scope.isDefault = function (definition) {
          return !$scope.isEnum(definition) && definition.type !== 'boolean' && !$scope.isFile(definition);
        };

        $scope.isBoolean = function (definition) {
          return definition.type === 'boolean';
        };

        $scope.hasExampleValue = function (value) {
          var hasExample = $scope.isEnum(value) ? false : value.type === 'boolean' ? false : typeof value['enum'] !== 'undefined' ? false : (typeof value.example !== 'undefined' || typeof value.examples !== 'undefined');
          if (hasExample && $scope.uploadRequest) {
            $scope.uploadRequest();
          }
          return hasExample;
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

        $scope.uploadFile = function (event) {
          $scope.$apply(function() {
            $scope.model[0] = event.files[0];
          });
        };

        $scope.$on('clearBody', function () {
          angular.element('raml-console-sidebar-input-file').val(null);
          $scope.model[0] = undefined;
        });
      }],
      compile: function (element) {
        return RecursionHelper.compile(element);
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlField', ['RecursionHelper', RAML.Directives.ramlField]);
})();
