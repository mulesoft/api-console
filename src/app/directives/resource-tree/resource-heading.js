(function () {
  'use strict';

  angular.module('RAML.Directives')
    .directive('resourceHeading', [function resourceHeading() {
      return {
        restrict: 'E',
        templateUrl: 'directives/resource-tree/resource-heading.tpl.html',
        replace: true,
        link: function ($scope, element) {
          var segments = $scope.resource.pathSegments;
          segments
            .forEach(function (segment, index) {
              var span = angular.element('<span>' + segment.toString() + '</span>');
              element.append(span);
              if (index === segments.length - 1) {
                span.addClass('raml-console-resource-path-active');
              }
            });
        }
      };
    }]);
}());
