(function() {
  'use strict';
  RAML.Directives.validatedInput = function($parse) {

    var Controller = function($attrs) {
      this.constraints = $parse($attrs.constraints);
    };

    Controller.prototype.validate = function(scope, value) {
      var constraints = this.constraints(scope);
      var validator = RAML.Client.Validator.from(constraints);

      return validator.validate(value);
    };

    var link = function($scope, $el, $attrs, controllers) {
      var modelController    = controllers[0],
          validateController = controllers[1],
          errorClass = $parse($attrs.invalidClass)($scope) || 'warning';

      function validateField() {
        var errors = validateController.validate($scope, modelController.$modelValue);

        if (errors) {
          $el.addClass(errorClass);
        } else {
          $el.removeClass(errorClass);
        }
      }

      $el.bind('blur', function() {
        $scope.$apply(validateField);
      });

      $el.bind('focus', function() {
        $scope.$apply(function() {
          $el.removeClass(errorClass);
        });
      });

      angular.element($el[0].form).bind('submit', function() {
        $scope.$apply(validateField);
      });
    };

    return {
      restrict: 'A',
      require: ['ngModel', 'validatedInput'],
      controller: Controller,
      link: link
    };
  };
})();
