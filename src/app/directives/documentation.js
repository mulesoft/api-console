(function () {
  'use strict';

  RAML.Directives.documentation = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/documentation.tpl.html',
      scope: {
        methodInfo: '=',
        resource: '=',
        securitySchemes: '=',
        selectedMethod: '='
      },
      controller: ['$scope', function($scope) {
        function getResponseInfo() {
          var responseInfo = {};
          var responses    = $scope.methodInfo.responses;

          if (!responses || responses.length === 0) {
            return;
          }

          Object.keys(responses).forEach(function (key) {
            var body = responses[key].body();

            responseInfo[key] = RAML.Transformer.transformBody(body);

            setCurrent(responseInfo[key], 'Type');
          });

          return responseInfo;
        }

        function setCurrent(hash, currentSuffix) {
          hash['current' + currentSuffix] = Object.keys(hash)[0];
        }

        var defaultSchemaKey = Object.keys($scope.securitySchemes).sort()[0];
        var defaultSchema    = $scope.securitySchemes[defaultSchemaKey];

        $scope.markedOptions = RAML.Settings.marked;
        $scope.documentationSchemeSelected = defaultSchema;
        $scope.responseInfo = getResponseInfo();
        $scope.documentationEnabled = true;

        $scope.isSchemeSelected = function isSchemeSelected(scheme) {
          return scheme.id === $scope.documentationSchemeSelected.id;
        };

        $scope.selectDocumentationScheme = function selectDocumentationScheme(scheme) {
          $scope.documentationSchemeSelected = scheme;
        };

        $scope.schemaSettingsDocumentation = function schemaSettingsDocumentation(settings) {
          var doc = settings;

          if (typeof settings === 'object') {
            doc = settings.join(', ');
          }

          return doc;
        };

        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };

        $scope.currentStatusCode = '200';

        if ($scope.methodInfo.responseCodes && $scope.methodInfo.responseCodes.length > 0) {
          $scope.currentStatusCode = $scope.methodInfo.responseCodes[0];
        }

        $scope.currentBodySelected = $scope.responseInfo ?
          $scope.responseInfo[$scope.currentStatusCode].currentType :
          ($scope.methodInfo && $scope.methodInfo.body ? Object.keys($scope.methodInfo.body)[0] : null);

        $scope.$on('resetData', function() {
          if ($scope.methodInfo.responseCodes && $scope.methodInfo.responseCodes.length > 0) {
            $scope.currentStatusCode = $scope.methodInfo.responseCodes[0];
          }
        });

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

            } else {
              result += parameter.type || '';
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

        $scope.$watch('selectedMethod', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            $scope.responseInfo = getResponseInfo();
          }
        });

        $scope.$watch('currentBodySelected', function (value) {
          if (value) {
            var $container = jQuery('.raml-console-request-body-heading');
            var $elements  = $container.find('span');

            $elements.removeClass('raml-console-is-active');
            $container.find('.raml-console-body-' + $scope.getBodyId(value)).addClass('raml-console-is-active');
          }
        });
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('documentation', RAML.Directives.documentation);
})();
