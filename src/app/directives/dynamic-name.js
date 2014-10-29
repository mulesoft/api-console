(function () {
  'use strict';
  angular.module('RAML.Directives').directive('dynamicName', ['$parse', function($parse) {
    return {
      restrict: 'A',
      controller: function($scope, $element, $attrs){
        var name = $parse($attrs.dynamicName)($scope);

        delete($attrs.dynamicName);
        $element.removeAttr('data-dynamic-name');
        $element.removeAttr('dynamic-name');
        $attrs.$set('name', name);
      }
    };
  }]);
})();
