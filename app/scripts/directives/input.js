(function() {
  'use strict';

  // enhancement to ng-model for input[type="file"]
  // code for this directive taken from:
  // https://github.com/marcenuc/angular.js/commit/2bfff4668c341ddcfec0120c9a5018b0c2463982
  RAML.Directives.input = function() {
    return {
      restrict: 'E',
      require: '?ngModel',
      link: function(scope, element, attr, ctrl) {
        if (ctrl && attr.type && attr.type.toLowerCase() === 'file') {
          element.bind('change', function() {
            scope.$apply(function() {
              var files = element[0].files;
              var viewValue = attr.multiple ? files : files[0];

              ctrl.$setViewValue(viewValue);
            });
          });
        }
      }
    };
  };
})();
