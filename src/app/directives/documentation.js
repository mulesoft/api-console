RAML.Directives.documentation = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/documentation.tpl.html',
    replace: true,
    controller: function($rootScope, $scope, $element) {
      $scope.toggleTab = function ($event) {
        var $this = jQuery($event.currentTarget);
        var $eachTab = $this.children('.toggle-tab');
        var $panel = $this.closest('.resource-panel');
        var $eachContent = $panel.find('.resource-panel-content');

        $eachTab.toggleClass('is-active');
        $eachContent.toggleClass('is-active');
      };

      $scope.changeType = function ($event, type) {
        var $this = jQuery($event.currentTarget);
        var $panel = $this.closest('.resource-body-heading');
        var $eachContent = $panel.find('span');

        $eachContent.removeClass('isActive');
        $this.addClass('isActive');

        $scope.responseInfo.currentType = type;
      };

      $scope.showSchema = function ($event) {
        var $this = jQuery($event.currentTarget);
        var $panel = $this.closest('.resource-panel');
        var $schema = $panel.find('.resource-pre-toggle');

        $this.toggleClass('is-active');

        if (!$schema.hasClass('is-active')) {
          $schema
            .addClass('is-active')
            .velocity('slideDown');
        } else {
          $schema
            .removeClass('is-active')
            .velocity('slideUp');
        }
      };
    }
  };
};

angular.module('RAML.Directives')
  .directive('documentation', ['$window', RAML.Directives.documentation]);
