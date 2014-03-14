(function() {
  'use strict';

  RAML.Directives.toggle = function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: RAML.Controllers.toggle,
      templateUrl: 'views/toggle.tmpl.html',
      scope: {
        keyBase: '@',
        toggleModel: '=?'
      }
    };
  };
})();

(function() {
  'use strict';

  var link = function($scope, $element, $attrs, toggleCtrl) {
    toggleCtrl.addToggleItem($scope);
  };

  RAML.Directives.toggleItem = function() {
    return {
      restrict: 'E',
      require: '^toggle',
      replace: true,
      transclude: true,
      link: link,
      templateUrl: 'views/toggle-item.tmpl.html',
      scope: {
        heading: '@',
        active: '=?'
      }
    };
  };
})();
