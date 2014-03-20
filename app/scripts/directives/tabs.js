(function() {
  'use strict';

  ////////////
  // tabset
  ////////////

  RAML.Directives.consoleTabset = function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: RAML.Controllers.tabset,
      templateUrl: 'views/tabset.tmpl.html',
      scope: {
        keyBase: '@'
      }
    };
  };

  ////////////////
  // tabs
  ///////////////

  var link = function($scope, $element, $attrs, tabsetCtrl) {
    tabsetCtrl.addTab($scope);
  };

  RAML.Directives.consoleTab = function() {
    return {
      restrict: 'E',
      require: '^consoleTabset',
      replace: true,
      transclude: true,
      link: link,
      templateUrl: 'views/tab.tmpl.html',
      scope: {
        heading: '@',
        active: '=?',
        disabled: '=?'
      }
    };
  };
})();
