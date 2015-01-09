(function () {
  'use strict';

  RAML.Directives.theme = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/theme-switcher.tpl.html',
      replace: true,
      link: function($scope, $element) {
        $element.on('click', function() {
          // var $link = jQuery('head link.theme');
          var $theme = jQuery('head').find('#raml-console-theme-dark');

          // $link.attr('href', 'styles/light-theme.css');
          // $element.removeClass('raml-console-theme-toggle-dark');

          if ($theme.length === 0) {
            jQuery.ajax({
              url: 'styles/api-console-dark-theme.css'
            }).done(function (data) {
              jQuery('head').append('<style id="raml-console-theme-dark">' + data + '</style>');
              jQuery('head').find('#raml-console-theme-light').remove();
            });
          } else {
            jQuery.ajax({
              url: 'styles/api-console-light-theme.css'
            }).done(function (data) {
              jQuery('head').append('<style id="raml-console-theme-light">' + data + '</style>');
              jQuery('head').find('#raml-console-theme-dark').remove();
            });
          }
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('themeSwitcher', RAML.Directives.theme);
})();
