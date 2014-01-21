(function(angular) {
  'use strict';

  var inputOverride = angular.module('fileInputOverride', []);

  // enhancement to ng-model for input[type="file"]
  // code for this directive taken from:
  // https://github.com/marcenuc/angular.js/commit/2bfff4668c341ddcfec0120c9a5018b0c2463982

  // since angular (as of version 1.2.3) breaks our enhancement to the input directive for files
  // we are disabling it (for only file type inputs) with this decorator.

  inputOverride.config(['$provide', function($provide) {
    $provide.decorator('inputDirective', ['$delegate', function($delegate) {
      angular.forEach($delegate, function(inputDirective) {
        var originalCompile = inputDirective.compile;
        inputDirective.compile = function(element, attrs) {
          if (!attrs.type || attrs.type.toLowerCase() !== 'file') {
            return originalCompile.apply(this, arguments);
          } else {
            return function(scope, element, attr, ctrl) {
              element.bind('change', function() {
                scope.$apply(function() {
                  var files = element[0].files;
                  var viewValue = attr.multiple ? files : files[0];

                  ctrl.$setViewValue(viewValue);
                });
              });
            };
          }
        };
      });
      return $delegate;
    }]);
  }]);
})(window.angular);
