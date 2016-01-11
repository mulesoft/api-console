(function () {
  'use strict';

  RAML.Directives.methodList = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/method-list.tpl.html',
      replace: true,
      scope: {
        resource: '=',
        handleMethodClickRef: '&handleMethodClick'
      },
      controller: ['$scope', function($scope) {
        $scope.methods = RAML.Transformer.transformMethods($scope.resource.methods());

        $scope.handleMethodClick = function ($event, $index) {
          var $this = jQuery($event.currentTarget);
          jQuery('.raml-console-tab.raml-console-is-active').not($this)
            .removeClass('raml-console-is-active');

          if (!$this.hasClass('raml-console-is-active')) {
            $this.addClass('raml-console-is-active');
          } else {
            $this.removeClass('raml-console-is-active');
          }

          $scope.handleMethodClickRef()($this, $index);
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('methodList', RAML.Directives.methodList);
})();
