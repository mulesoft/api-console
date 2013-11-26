(function() {
  'use strict';

  var controller = function($scope) {
    $scope.methodView = this;
    this.method = $scope.method;
  };

  controller.prototype.toggleExpansion = function(evt) {
    evt.preventDefault();
    this.expanded = !this.expanded;
  };

  controller.prototype.cssClass = function() {
    if (this.expanded) {
      return 'expanded ' + this.method.method;
    } else {
      return 'collapsed ' + this.method.method;
    }
  };

  RAML.Directives.method = function() {
    return {
      controller: controller,
      require: ['^resource', 'method'],
      restrict: 'E',
      templateUrl: 'views/method.tmpl.html',
      replace: true,
      link: function(scope, element, attrs, controllers) {
        var resourceView = controllers[0],
            methodView   = controllers[1];

        if (resourceView.expandInitially(scope.method)) {
          methodView.expanded = true;
        }
      }
    };
  };
})();
