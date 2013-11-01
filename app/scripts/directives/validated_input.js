(function() {
  'use strict';

  var Controller = function($scope) {
    this.model = $scope.bindTo;
    this.name = $scope.name;
    this.invalidClass = $scope.invalidClass || 'warning';
    this.validator = RAML.Client.Validator.from($scope.constraints);

    $scope.input = this;
  };

  Controller.prototype.currentValue = function() {
    return this.model[this.name];
  };

  Controller.prototype.validate = function() {
    var errors = this.validator.validate(this.currentValue());

    if (errors) {
      this.status = this.invalidClass;
    }
  };

  Controller.prototype.reset = function() {
    this.status = null;
  };

  var link = function($scope, $el, $attrs) {
    $scope.type = $attrs.type || 'text';

    var input = $el.find('input');
    input.on('blur', function() {
      $scope.$apply('input.validate()');
    });

    input.on('focus', function() {
      $scope.$apply('input.reset()');
    });

    $el.closest('form').on('submit', function() {
      $scope.$apply('input.validate()');
    });
  };

  RAML.Directives.validatedInput = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/validated_input.tmpl.html',
      replace: true,
      scope: {
        bindTo: '=',
        constraints: '=',
        placeholder: '@',
        invalidClass: '@?',
        name: '@'
      },
      controller: Controller,
      link: link
    };
  };
})();
