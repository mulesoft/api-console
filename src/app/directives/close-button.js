(function () {
  'use strict';

  RAML.Directives.closeButton = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/close-button.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.close = function ($event) {
          var $this             = jQuery($event.currentTarget);
          var $inactiveElements = jQuery('.tab').add('.resource').add('li');
          var $resource         = $this.closest('.resource');
          var $resourceListItem = $resource.parent('li');

          $resourceListItem
            .children('.resource-panel')
            .velocity('slideUp');

          $inactiveElements.removeClass('is-active');
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('closeButton', RAML.Directives.closeButton);
})();
