(function () {
  'use strict';

  RAML.Directives.validate = function($parse) {
    return {
      require: 'ngModel',
      link: function ($scope, $element, $attrs, $ctrl) {
        function clear ($ctrl, rules) {
          Object.keys(rules).map(function (key) {
            $ctrl.$setValidity(key, true);
          });
        }

        function validate(value) {
          var sanitizer = (new RAMLSanitize())(sanitationRules);
          var validator = (new RAMLValidate())(validationRules);
          var current   = {};
          var errors;

          value = typeof value !== 'undefined' && value !== null && value.length === 0 ? undefined : value;
          current[validationId] = value;

          errors = validator(sanitizer(current)).errors;

          if (errors.length > 0) {
            control.$setValidity(errors[0].rule, errors[0].valid);
            // Note: We want to allow invalid errors for testing purposes
            return value;
          } else {
            clear(control, validationRules[validationId]);
            return value;
          }
        }

        var validation      = $parse($attrs.validate)($scope);
        var validationId    = validation.id;
        var sanitationRules = {};
        var validationRules = {};
        var control         = $ctrl;

        if (validation && validation.type) {
          var declaredType = RAML.Inspector.Types.findType(validation.type[0], $scope.types);
          if (declaredType) { validation = declaredType; }
        }

        sanitationRules[validationId] = {
          type: validation.type || null,
          repeat: validation.repeat || null
        };

        sanitationRules[validationId] = RAML.Utils.filterEmpty(sanitationRules[validationId]);

        validationRules[validationId] = {
          type: validation.type || null,
          minLength: validation.minLength || null,
          maxLength: validation.maxLength || null,
          required: validation.required || null,
          'enum': validation['enum'] || null,
          pattern: validation.pattern || null,
          minimum: validation.minimum || null,
          maximum: validation.maximum || null,
          repeat: validation.repeat || null
        };

        validationRules[validationId] = RAML.Utils.filterEmpty(validationRules[validationId]);

        $ctrl.$formatters.unshift(function(value) {
          return validate(value);
        });

        $ctrl.$parsers.unshift(function(value) {
          return validate(value);
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('validate', ['$parse', RAML.Directives.validate]);
})();
