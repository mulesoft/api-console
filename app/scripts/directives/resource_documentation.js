(function() {
  'use strict';

  function calculateContainerPosition(container, consoleContainer, rect) {
    container.style.top = consoleContainer.scrollTop + rect.top - consoleContainer.offsetTop + 'px';
    container.style.bottom = consoleContainer.scrollTop + rect.bottom + 'px';
    container.style.height = rect.bottom - rect.top + 'px';
  }

  function calculateContainerHeight(container, consoleContainer) {
    container.css('height', consoleContainer[0].clientHeight - 10 + 'px');
    container[0].style.top = consoleContainer[0].scrollTop + 5 + 'px';
  }

  function createPopover(element) {
    var consoleContainer = angular.element(document.body).find('raml-console').parent(),
        resourceList = angular.element(document.getElementById('raml-console')),
        placeholder = angular.element(element[0].querySelector('.resource-placeholder')),
        container = angular.element(element[0].querySelector('.resource-container')),
        rect;

    return {
      open: function($scope, $resourceEl, resource, method) {
        $scope.resource = resource;

        consoleContainer.css('overflow', 'hidden');
        placeholder.css('height', resourceList[0].scrollHeight + 'px');
        container.addClass('grow-expansion-animation');

        setTimeout(function() {
          rect = $resourceEl[0].getBoundingClientRect();
          calculateContainerPosition(container[0], consoleContainer[0], rect);

          setTimeout(function() {
            placeholder.addClass('masked');
            calculateContainerHeight(container, consoleContainer);
            $scope.selectedMethod = method;
            $scope.$digest();
          });
        });
      },

      close: function($scope) {
        calculateContainerPosition(container[0], consoleContainer[0], rect);
        setTimeout(function() {
          placeholder.removeClass('masked');

          setTimeout(function() {
            container.removeClass('grow-expansion-animation');
            consoleContainer.css('overflow', 'auto');

            $scope.$apply('resource = undefined');
            $scope.$apply('selectedMethod = undefined');
          }, 200);
        });
      },

      resize: function() {
        calculateContainerHeight(container, consoleContainer);
      }
    };
  }

  RAML.Directives.resourceDocumentation = function($rootScope, $window, DataStore) {
    var popover;
    angular.element($window).bind('resize', function() {
      if (popover) {
        popover.resize();
      }
    });
    function prepare($scope, $element, $resourceEl, resource, method) {
      $scope.selectMethod = function(method) {
        DataStore.set(resource.toString() + ':method', method.method);
        $scope.selectedMethod = method;
        $scope.keyBase = resource.toString() +':' + method.method;
      };

      $scope.closePopover = function(e) {
        e.preventDefault();

        DataStore.set(resource.toString() + ':method', undefined);
        popover.close($scope);
        popover = undefined;
      };

      popover = createPopover($element);
      popover.open($scope, $resourceEl, resource, method);
      $scope.selectMethod(method);
    }

    function Controller($scope, $element) {
      var receipt;

      $rootScope.$on('console:resource:destroyed', function(event, resource) {
        if ($scope.resource && $scope.resource.toString() === resource.toString()) {
          receipt = setTimeout(function() {
            popover.close($scope);
            popover = undefined;
          }, 100);
        }
      });

      $rootScope.$on('console:resource:rendered', function(event, resource, $resourceEl) {
        var methodName = DataStore.get(resource.toString() + ':method');
        if (methodName) {
          var method = resource.methods.filter(function(method) {
            return method.method === methodName;
          })[0] || resource.methods[0];

          if (method) {
            if (receipt && $scope.resource && $scope.resource.toString() === resource.toString()) {
              clearTimeout(receipt);
              $scope.resource = resource;
              $scope.selectedMethod = method;
            } else {
              prepare($scope, $element, $resourceEl, resource, method);
            }
          }
        }
      });

      $rootScope.$on('console:expand', function(event, resource, method, $resourceEl) {
        prepare($scope, $element, $resourceEl, resource, method);
      });

    }

    return {
      restrict: 'E',
      templateUrl: 'views/resource_documentation.tmpl.html',
      controller: Controller,
      scope: {
        api: '=',
        ramlConsole: '='
      }
    };
  };
})();
