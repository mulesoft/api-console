(function () {
  'use strict';

  RAML.Directives.documentation = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/documentation.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };

        $scope.currentStatusCode = '200';

        if ($scope.methodInfo.responseCodes && $scope.methodInfo.responseCodes.length > 0) {
          $scope.currentStatusCode = $scope.methodInfo.responseCodes[0];
        }

        function beautify(body, contentType) {
          if(contentType.indexOf('json')) {
            body = vkbeautify.json(body, 2);
          }

          if(contentType.indexOf('xml')) {
            body = vkbeautify.xml(body, 2);
          }

          return body;
        }

        $scope.getBeatifiedExample = function (value) {
          var result = value;

          try {
            beautify(value, $scope.currentBodySelected);
          }
          catch (e) { }

          return result;
        };

        $scope.getColorCode = function (code) {
          return code[0] + 'xx';
        };

        $scope.showCodeDetails = function (code) {
          $scope.currentStatusCode = code;
        };

        $scope.isActiveCode = function (code) {
          return $scope.currentStatusCode === code;
        };

        $scope.showRequestDocumentation = true;
        $scope.toggleRequestDocumentation = function () {
          $scope.showRequestDocumentation = !$scope.showRequestDocumentation;
        };

        $scope.showResponseDocumentation = true;
        $scope.toggleResponseDocumentation = function () {
          $scope.showResponseDocumentation = !$scope.showResponseDocumentation;
        };

        $scope.parameterDocumentation = function (parameter) {
          var result = '';

          if (parameter.required) {
            result += 'required, ';
          }

          if (parameter.enum) {
            var enumValues = $scope.unique(parameter.enum);

            if (enumValues.length > 1) {
              result += 'one of ';
            }

            result += '(' + enumValues.join(', ') + ')';

          } else {
            result += parameter.type;
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

          if (parameter['default']) {
            result += ', default: ' + parameter['default'];
          }

          return result;
        };

        $scope.toggleTab = function ($event) {
          var $this        = jQuery($event.currentTarget);
          var $eachTab     = $this.parent().children('.raml-console-toggle-tab');
          var $panel       = $this.closest('.raml-console-resource-panel');
          var $eachContent = $panel.find('.raml-console-resource-panel-content');

          if (!$this.hasClass('raml-console-is-active')) {
            $eachTab.toggleClass('raml-console-is-active');
            $eachContent.toggleClass('raml-console-is-active');
          }
        };

        $scope.changeType = function ($event, type, code) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.raml-console-resource-body-heading');
          var $eachContent = $panel.find('span');

          $eachContent.removeClass('raml-console-is-active');
          $this.addClass('raml-console-is-active');

          $scope.responseInfo[code].currentType = type;
        };

        $scope.changeResourceBodyType = function ($event, type) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.raml-console-request-body-heading');
          var $eachContent = $panel.find('span');

          $eachContent.removeClass('raml-console-is-active');
          $this.addClass('raml-console-is-active');

          $scope.currentBodySelected = type;
        };

        $scope.getBodyId = function (bodyType) {
          return jQuery.trim(bodyType.toString().replace(/\W/g, ' ')).replace(/\s+/g, '_');
        };

        $scope.bodySelected = function (value) {
          return value === $scope.currentBodySelected;
        };

        $scope.$watch('currentBodySelected', function (value) {
          var $container = jQuery('.raml-console-request-body-heading');
          var $elements  = $container.find('span');

          $elements.removeClass('raml-console-is-active');
          $container.find('.raml-console-body-' + $scope.getBodyId(value)).addClass('raml-console-is-active');
        });

        $scope.showSchema = function ($event) {
          var $this   = jQuery($event.currentTarget);
          var $panel  = $this.closest('.raml-console-schema-container');
          var $schema = $panel.find('.raml-console-resource-pre-toggle');

          $this.toggleClass('raml-console-is-active');

          if (!$schema.hasClass('raml-console-is-active')) {
            $this.text('Hide Schema');
            $schema
              .addClass('raml-console-is-active')
              .velocity('slideDown');
          } else {
            $this.text('Show Schema');
            $schema
              .removeClass('raml-console-is-active')
              .velocity('slideUp');
          }
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('documentation', RAML.Directives.documentation);
})();
