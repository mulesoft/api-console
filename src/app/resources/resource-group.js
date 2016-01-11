(function () {
  'use strict';

  RAML.Directives.resourceGroup = function() {
    return {
      restrict: 'E',
      templateUrl: 'resources/resource-group.tpl.html',
      scope: {
        baseUri: '=',
        baseUriParameters: '=',
        resourceGroup: '=',
        firstResource: '=',
        generateIdRef: '&generateId',
        index: '=',
        resourceList: '='
      },
      controller: ['$scope', function($scope) {
        $scope.generateId = $scope.generateIdRef();


        $scope.readResourceTraits = function readResourceTraits(traits) {
          var list = [];

          if (traits) {
            traits.map(function (trait) {
              if (trait) {
                if (typeof trait === 'object') {
                  list.push(Object.keys(trait).join(', '));
                } else {
                  list.push(trait);
                }
              }
            });
          }

          return list.join(', ');
        };

        $scope.collapseAll = function ($event, collection, flagKey) {
          var $this = jQuery($event.currentTarget);

          if ($this.hasClass('raml-console-resources-expanded')) {
            $scope[flagKey] = true;
          } else {
            if (flagKey === 'resourcesCollapsed') {
              jQuery('.raml-console-resource-description').removeClass('ng-hide');
            }
            $scope[flagKey] = false;
          }

          jQuery('.raml-console-resources-' + flagKey).find('ol.raml-console-resource-list').toggleClass('raml-console-is-collapsed');

          toggleCollapsed($scope[flagKey], collection);
        };

        function toggleCollapsed (status, collection) {
          for (var i = 0; i < collection.length; i++) {
            collection[i] = collection[i] !== null ? status : collection[i];
          }
        }

        $scope.hasResourcesWithChilds = function () {
          return $scope.resourceGroups.filter(function (el) {
            return el.length > 1;
          }).length > 0;
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('resourceGroup', [RAML.Directives.resourceGroup]);
})();
