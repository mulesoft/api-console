(function () {
  'use strict';

  RAML.Directives.documentation = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/documentation.tpl.html',
      controller: ['$scope', function($scope) {
        $scope.markedOptions = RAML.Settings.marked;

        $scope.$watch('securitySchemes', function() {
          var defaultSchemaKey = Object.keys($scope.securitySchemes).sort()[0];
          var defaultSchema    = $scope.securitySchemes[defaultSchemaKey];

          $scope.documentationSchemeSelected = defaultSchema;

          if (defaultSchema.describedBy && defaultSchema.describedBy.responses) {
            $scope.schemaResponses = defaultSchema.describedBy.responses;
          }
        });

        $scope.changeSchemaType = function ($event, type, code) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.raml-console-resource-body-heading');
          var $eachContent = $panel.find('span');

          $eachContent.removeClass('raml-console-is-active');
          $this.addClass('raml-console-is-active');

          if (!$scope.schemaResponses[code]) {
            $scope.schemaResponses[code] = {};
          }
          $scope.schemaResponses[code].currentType = type;
        };

        function mergeResponseCodes(methodCodes, schemas) {
          var extractSchema = function (key) { return schemas.hasOwnProperty(key) ? schemas[key] : undefined; };
          var isValidSchema = function (schema) { return schema.describedBy && schema.describedBy.responses; };

          var codes = {};

          // Copy all method codes
          Object.keys(methodCodes).forEach(function (code) {
            if (methodCodes.hasOwnProperty(code)) { codes[code] = methodCodes[code]; }
          });

          // Copy schema's code that are not present in the method
          Object.keys(schemas)
            .map(extractSchema)
            .filter(isValidSchema)
            .forEach(function (schema) {
              copyToCodesIfNotPresent(codes, schema.describedBy.responses);
            });

          return codes;
        }

        function copyToCodesIfNotPresent(codes, schemaCodes) {
          if (Array.isArray(schemaCodes)) {
            schemaCodes.forEach(function (response) {
              if (!codes.hasOwnProperty(response.code)) {
                codes[response.code] = response.code;
              }
            });
          } else {
            Object.keys(schemaCodes).forEach(function (code) {
              if (schemaCodes.hasOwnProperty(code) && !codes.hasOwnProperty(code)) {
                codes[code] = schemaCodes[code];
              }
            });
          }
        }
        $scope.$watch('methodInfo', function () {
          if ($scope.methodInfo.responses && $scope.methodInfo.securitySchemes) {
            $scope.fullResponses = mergeResponseCodes($scope.methodInfo.responses || {}, $scope.methodInfo.securitySchemes());
            $scope.fullResponseCodes = Object.keys($scope.fullResponses);
          }
        });

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

        if ($scope.fullResponseCodes && $scope.fullResponseCodes.length > 0) {
          $scope.currentStatusCode = $scope.fullResponseCodes[0];
        }

        $scope.$on('resetData', function() {
          if ($scope.fullResponseCodes && $scope.fullResponseCodes.length > 0) {
            $scope.currentStatusCode = $scope.fullResponseCodes[0];
          }
        });

        function beautify(body, contentType) {
          if(contentType.indexOf('json') !== -1) {
            body = vkbeautify.json(body, 2);
          }

          if(contentType.indexOf('xml') !== -1) {
            body = vkbeautify.xml(body, 2);
          }

          return body;
        }

        $scope.getBeatifiedExample = function (value) {
          var result = value;

          try {
            result = beautify(value, $scope.currentBodySelected);
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

            if (parameter['default'] !== undefined) {
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

        $scope.$watch('currentBodySelected', function (value) {
          var $container = jQuery('.raml-console-request-body-heading');
          var $elements  = $container.find('span');

          $elements.removeClass('raml-console-is-active');
          $container.find('.raml-console-body-' + $scope.getBodyId(value)).addClass('raml-console-is-active');
        });

        $scope.$watch('methodInfo.responses', function (responses) {
          $scope.methodInfo.responses = responses;
          $scope.methodInfo.securitySchemes && ($scope.fullResponses = mergeResponseCodes($scope.methodInfo.responses || {}, $scope.methodInfo.securitySchemes()));
          $scope.fullResponseCodes = Object.keys($scope.fullResponses);
          if ($scope.fullResponseCodes && $scope.fullResponseCodes.length > 0) {
            $scope.currentStatusCode = $scope.fullResponseCodes[0];
          }
        });

      }],
      replace: true
    };
  };

  angular.module('RAML.Directives')
    .directive('documentation', RAML.Directives.documentation);
})();
