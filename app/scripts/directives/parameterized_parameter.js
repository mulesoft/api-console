(function() {
  'use strict';

  var Controller = function($scope) {
    $scope.parameterFactory = this;

    this.parameterName = $scope.parameterName;
    this.parameters = $scope.parameters;
  };

  Controller.prototype.open = function($event) {
    $event.preventDefault();
    this.opened = true;
  };

  Controller.prototype.create = function($event) {
    $event.preventDefault();

    try {
      this.parameters.create(this.parameterName, this.value);
      this.opened = false;
      this.value = this.status = '';
    } catch (e) {
      this.status = 'error';
    }
  };

  RAML.Directives.parameterizedParameter = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameterized_parameter.tmpl.html',
      replace: true,
      controller: Controller,
      scope: {
        parameters: '=',
        parameterName: '='
      }
    };
  };
})();
