(function () {
  'use strict';

  RAML.Directives.namedParameters = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/named-parameters.tpl.html',
      replace: true,
      scope: {
        src: '=',
        context: '=',
        type: '@',
        title: '@'
      },
      controller: function ($scope, $attrs) {
        $scope.markedOptions = RAML.Settings.marked;

        if ($attrs.hasOwnProperty('enableCustomParameters')) {
          $scope.enableCustomParameters = true;
        }

        if ($attrs.hasOwnProperty('showBaseUrl')) {
          $scope.showBaseUrl = true;
        }

        $scope.segments = [];

        var baseUri = $scope.$parent.raml.baseUri;

        if (typeof baseUri !== 'undefined' && baseUri.templated) {
          var tokens = baseUri.tokens;

          for (var i = 0; i < tokens.length; i++) {
            $scope.segments.push({
              name: tokens[i],
              templated: typeof baseUri.parameters[tokens[i]] !== 'undefined' ? true : false
            });
          }
        }

        $scope.$parent.resource.pathSegments.map(function (element) {
          var tokens = element.tokens;

          for (var i = 0; i < tokens.length; i++) {
            $scope.segments.push({
              name: tokens[i],
              templated: element.templated && typeof element.parameters[tokens[i]] !== 'undefined' ? true : false
            });
          }
        });

        $scope.addCustomParameter = function () {
          $scope.context.customParameters[$scope.type].push({});
        };

        $scope.removeCutomParam = function (param) {
          $scope.context.customParameters[$scope.type] = $scope.context.customParameters[$scope.type].filter(function (el) {
            return el.name !== param.name;
          });
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('namedParameters', RAML.Directives.namedParameters);
})();
