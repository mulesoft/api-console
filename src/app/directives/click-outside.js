(function () {
  'use strict';

  RAML.Directives.clickOutside = function ($document) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        function onClick (e) {
          if ($element[0] === e.target || $element.has(e.target).length) {
            return;
          }

          $scope.$apply($attrs.clickOutside);
        }

        $document.on('click', onClick);

        $scope.$on('$destroy', function () {
          $document.off('click', onClick);
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('clickOutside', RAML.Directives.clickOutside);
})();
