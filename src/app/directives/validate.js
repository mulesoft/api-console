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
          current[validation.id] = value;

          errors = validator(sanitizer(current)).errors;

          if (errors.length > 0) {
            control.$setValidity(errors[0].rule, errors[0].valid);
            // Note: We want to allow invalid errors for testing purposes
            return value;
          } else {
            clear(control, validationRules[validation.id]);
            return value;
          }
        }

        var validation      = $parse($attrs.validate)($scope);
        var sanitationRules = {};
        var validationRules = {};
        var control         = $ctrl;

        sanitationRules[validation.id] = {
          type: validation.type || null,
          repeat: validation.repeat || null
        };

        sanitationRules[validation.id] = RAML.Utils.filterEmpty(sanitationRules[validation.id]);

        validationRules[validation.id] = {
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

        validationRules[validation.id] = RAML.Utils.filterEmpty(validationRules[validation.id]);

        $ctrl.$formatters.unshift(function(value) {
          return validate(checkEnumValue(value));
        });

        $ctrl.$parsers.unshift(function(value) {
          return validate(checkEnumValue(value));
        });

        /**
         * Check if given value is enum. If it's enum then array object should be returned to allow multi enums.
         * 
         * @param  {String}        Form value.
         * @return {String/Array}  Form value or modelValue(Array) if it's enum.
         */
        function checkEnumValue(value) {
          if (validation.hasOwnProperty('enum')) {
            return control.$modelValue;
          } else {
            return value;
          }
        }
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('validate', ['$parse', RAML.Directives.validate]);
})();
