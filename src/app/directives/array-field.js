(function () {
  'use strict';

  RAML.Directives.arrayField = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/array-field.tpl.html',
      require: 'ngModel',
      replace: true,
      link: function(scope, iElement) {
        var ngModelCtrl = iElement.controller('ngModel');

        function getAllMatches(value, regex) {
          var result = [];

          var match;
          do {
            match = regex.exec(value);
            if (match) {
              result.push(match[0]);
            }
          } while (match);

          return result;
        }

        ngModelCtrl.$formatters.push(function(modelValue) {
          var value = Array.isArray(modelValue) ? modelValue : [];
          return '[' + value.join(',') + ']';
        });

        ngModelCtrl.$render = function() {
          iElement.val(ngModelCtrl.$viewValue);
        };

        iElement[0].addEventListener('change', function () {
          ngModelCtrl.$setViewValue(iElement.val());
        });

        ngModelCtrl.$parsers.push(function() {
          if (!ngModelCtrl.$viewValue || ngModelCtrl.$viewValue === '') { return ''; }

          return getAllMatches(ngModelCtrl.$viewValue, /([^\]\[,]+)/g)
            .map(function (value) { return value.replace(/^\s+/g, ''); })
            .map(function (value) { return value.replace(/\s+$/g, ''); });
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('arrayField', [RAML.Directives.arrayField]);
})();
