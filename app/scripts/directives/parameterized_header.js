(function() {
  'use strict';

  var Controller = function($scope) {
    $scope.headerFactory = this;

    this.headerName = $scope.headerName;
    this.headers = $scope.headers;
  };

  Controller.prototype.open = function($event) {
    $event.preventDefault();
    this.opened = true;
  };

  Controller.prototype.create = function($event) {
    $event.preventDefault();

    try {
      this.headers.create(this.headerName, this.value);
      this.opened = false;
      this.value = this.status = '';
    } catch (e) {
      this.status = 'error';
    }
  };

  RAML.Directives.parameterizedHeader = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameterized_header.tmpl.html',
      replace: true,
      controller: Controller,
      scope: {
        headers: '=',
        headerName: '='
      }
    };
  };
})();
