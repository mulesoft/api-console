(function () {
  'use strict';

  RAML.Directives.resource = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/resource.tpl.html',
      scope: {
        baseUri: '=',
        baseUriParameters: '=',
        generateIdRef: '&generateId',
        protocols: '=',
        resource: '=',
        resourcesCollapsed: '=',
        resourceGroup: '=',
        resourceList: '=',
        index: '=',
        isFirst: '=',
        singleView: '='
      },
      controller: ['$scope', '$rootScope', function($scope, $rootScope) {
        $scope.showPanel = false;
        $scope.description = RAML.Transformer.getValueIfNotNull($scope.resource.description());
        $scope.traits = RAML.Transformer.transformTraits($scope.resource.is());

        $scope.resource.uriParametersForDocumentation = $scope.resource.pathSegments
          .map(function(segment) { return segment.parameters; })
          .filter(function(params) { return !!params; })
          .reduce(function(accum, parameters) {
            for (var key in parameters) {
              var parameter = parameters[key];
              if (parameter) {
                parameter = (parameter instanceof Array) ? parameter : [ parameter ];
              }
              accum[key] = parameter;
            }
            return accum;
          }, {});

        if (Object.keys($scope.resource.uriParametersForDocumentation).length === 0) {
          $scope.resource.uriParametersForDocumentation = null;
        }

        $scope.generateId = $scope.generateIdRef();

        $scope.$on('openMethod', function(event, $currentScope) {
          if ($scope.$id !== $currentScope.$id) {
            closePanel();
          }
        });

        $scope.handleMethodClick = function (element, selectedMethod) {
          closePanel();

          if ($scope.selectedMethod === undefined || $scope.selectedMethod !== selectedMethod) {
            $rootScope.$broadcast('openMethod', $scope);

            $scope.element = element;
            $scope.selectedMethod = selectedMethod;
            $scope.showPanel = true;
          }
        };

        $scope.handleCloseClick = function () {
          $rootScope.$broadcast('resetData');
          delete $scope.selectedMethod;
          $scope.showPanel = false;
        };

        $scope.toggle = function ($event, index, collection, flagKey) {
          var $this    = jQuery($event.currentTarget);
          var $section = $this
            .closest('.raml-console-resource-list-item')
            .find('.raml-console-resource-list');

          collection[index] = !collection[index];

          $scope[flagKey] = checkItemStatus(false, collection) ? false : $scope[flagKey];
          $scope[flagKey] = checkItemStatus(true, collection) ? true : $scope[flagKey];

          $section.toggleClass('raml-console-is-collapsed');
        };

        function checkItemStatus(status, collection) {
          return collection.filter(function (el) { return el === status || el === null; }).length === collection.length;
        }

        function closePanel() {
          delete $scope.element;
          delete $scope.selectedMethod;
          $scope.showPanel = false;
        }
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('resource', [RAML.Directives.resource]);
})();
