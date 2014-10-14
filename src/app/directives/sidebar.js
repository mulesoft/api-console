RAML.Directives.sidebar = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/sidebar.tpl.html',
    replace: true,
    controller: function ($scope) {
      $scope.toggleSidebar = function ($event) {
        var $this = jQuery($event.currentTarget);
        var $panel = $this.closest('.resource-panel');
        var $sidebar = $panel.find('.sidebar');
        var $sidebarContent = $panel.find('.sidebar-content');
        var sidebarWidth = 0;

        if (jQuery(window).width() > 960) {
          sidebarWidth = 430;
        }

        if ($sidebar.hasClass('is-fullscreen')) {
          $sidebar.velocity(
            { width: sidebarWidth },
            {
              duration: 200,
              complete: completeAnimation
            }
          );
        } else {
          $sidebar.velocity(
            { width: '100%' },
            {
              duration: 200,
              complete: completeAnimation
            }
          );
        }

        $sidebar.toggleClass('is-fullscreen');
        $panel.toggleClass('has-sidebar-fullscreen');
      };

      $scope.collapseSidebar = function ($event) {
        var $this = jQuery($event.currentTarget);
        var $panel = $this.closest('.resource-panel');
        var $panelContent = $panel.find('.resource-panel-primary');
        var $sidebar = $panel.find('.sidebar');
        var $sidebarContent = $panel.find('.sidebar-content');

        if ($sidebar.hasClass('is-collapsed')) {
          $sidebar.velocity(
            { width: 430 },
            {
              duration: 200,
              complete: completeAnimation
            }
          );

          $panelContent.velocity(
            { "padding-left": 430 },
            {
              duration: 200,
              complete: completeAnimation
            }
          );
        } else {
          $sidebar.velocity(
            { width: 0 },
            {
              duration: 200,
              complete: completeAnimation
            }
          );

          $panelContent.velocity(
            { "padding-left": 0 },
            {
              duration: 200,
              complete: completeAnimation
            }
          );
        }

        $sidebar.toggleClass('is-collapsed');
        $panel.toggleClass('has-sidebar-collapsed');
      };

      $scope.toggleRequestMetadata = function ($event) {
        var $this = jQuery($event.currentTarget);
        var $panel = $this.closest('.resource-panel');
        var $metadata = $panel.find('.sidebar-request-metadata');

        $metadata.toggleClass('is-active');

        if (!$metadata.hasClass('is-active')) {
          $this.removeClass('is-open');
          $this.addClass('is-collapsed');
        } else {
          $this.removeClass('is-collapsed');
          $this.addClass('is-open');
        }
      };
    }
  };
};

angular.module('RAML.Directives')
  .directive('sidebar', ['$window', RAML.Directives.sidebar]);
