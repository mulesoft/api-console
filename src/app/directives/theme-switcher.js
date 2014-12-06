(function () {
  'use strict';

  RAML.Directives.theme = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/theme-switcher.tpl.html',
      replace: true,
      link: function($scope, $element) {
        $element.on('click', function() {
          var $link = jQuery('head link.theme');
          var theme = $link.attr('href');

          $link.attr('href', 'styles/light-theme.css');
          $element.removeClass('raml-console-theme-toggle-dark');

          if (theme === 'styles/light-theme.css') {
            $link.attr('href', 'styles/dark-theme.css');
            $element.addClass('raml-console-theme-toggle-dark');
          }
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('themeSwitcher', RAML.Directives.theme);
})();
