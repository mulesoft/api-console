'use strict';

(function() {

  var Controller = function($scope) {
    $scope.parameterFields = this;
  };

  Controller.prototype.inputView = function(parameter) {
    if (parameter.type === 'file') {
      return 'file';
    } else if (!!parameter.enum) {
      return 'enum';
    } else {
      return 'default';
    }
  };

  RAML.Directives.parameterFields = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameter_fields.tmpl.html',
      controller: Controller,
      scope: {
        parameters: '=',
      }
    };
  };
})();
