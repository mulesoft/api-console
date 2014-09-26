RAML.Directives.theme = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/theme-switcher.tpl.html',
    replace: true,
    link: function($scope, $element, attrs) {
      $element.on('click', function(event) {
        var $link = jQuery('head link.theme');
        var theme = $link.attr('href');

        $link.attr('href', 'styles/light-theme.css');
        $element.removeClass('theme-toggle-dark');

        if (theme === 'styles/light-theme.css') {
          $link.attr('href', 'styles/dark-theme.css');
          $element.addClass('theme-toggle-dark');
        }
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('themeSwitcher', ['$window', RAML.Directives.theme]);
