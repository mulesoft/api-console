(function () {
  'use strict';

  RAML.Directives.namedParameters = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/named-parameters.tpl.html',
      replace: true,
      scope: {
        context: '=',
        types: '=',
        uploadRequest: '=',
        type: '@',
        title: '@'
      },
      controller: ['$scope', '$attrs', function ($scope, $attrs) {

        $scope.keys = function(obj) {
          return Object.keys(obj);
        };

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
              templated: typeof baseUri.parameters[tokens[i]] !== 'undefined'
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

        $scope.isValueProvided = function isValueProvided(value) {
          if (!value) {
            return false;
          }

          if (typeof value !== 'object') {
            return true;
          }

          return Object.keys(value).filter(function (k) {
            return $scope.isValueProvided(value[k]);
          }).length > 0;
        };

        $scope.cleanupValue = RAML.Inspector.Properties.cleanupPropertyValue;

        function getType(param) {
          if ($scope.types) {
            var paramType = RAML.Inspector.Types.getType(param);
            var rootType = RAML.Inspector.Types.findType(paramType, $scope.types);
            return rootType ? rootType : param;
          } else {
            return param;
          }
        }

        function isArray (param) {
          var type = getType(param);
          return type && type.hasOwnProperty('type') && type.type[0] === 'array';
        }

        function usageExample (param) {
          return isArray(param) ? '[hello, world]' : '';
        }

        $scope.hasUsageExample = function(param) {
          return isArray(param);
        };

        $scope.getDescription = function(param) {
          var description = param.description;
          var usage       = usageExample(param);

          if (!description && !usage) {
            return undefined;
          }

          var separator = (description ? (usage ? '\n Format example: ' : '') : ('') );
          return (description ? description : '') + separator + usage;
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('namedParameters', RAML.Directives.namedParameters);
})();
