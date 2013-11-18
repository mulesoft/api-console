(function() {
  'use strict';

  var Controller = function($scope, $attrs, $parse) {
    var constraints = $parse($attrs.constraints)($scope);
    this.validator = RAML.Client.Validator.from(constraints);
  };

  Controller.prototype.validate = function(value) {
    return this.validator.validate(value);
  };

  var link = function($scope, $el, $attrs, controllers) {
    var modelController    = controllers[0],
        validateController = controllers[1],
        errorClass = $attrs.invalidClass || 'warning';

    function validateField() {
      var errors = validateController.validate(modelController.$modelValue);

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

  RAML.Directives.validatedInput = function() {
    return {
      restrict: 'A',
      require: ['ngModel', 'validatedInput'],
      controller: Controller,
      link: link
    };
  };
})();
