(function() {
  'use strict';

  RAML.Directives.resourceDocumentation = function() {
    function Controller($rootScope, $scope, $element) {
      var consoleContainer = angular.element(document.body).find('raml-console').parent();
      var resourceList = angular.element(document.getElementById('#raml-console'));
      var placeholder = $element[0].querySelector('.resource-placeholder');
      var container = $element[0].querySelector('.resource-container');

      $scope.selectMethod = function(method) {
        $scope.selectedMethod = method;
      };

      $rootScope.$on('console:expand', function(event, resource, method, $resourceEl) {
        var rect;

        $scope.resource = resource;

        consoleContainer.css('overflow', 'hidden');
        angular.element(placeholder).css('height', resourceList.css('height'));
        angular.element(container).addClass('grow-expansion-animation');

        setTimeout(function() {
          rect = $resourceEl[0].getBoundingClientRect();
          container.style.top = consoleContainer[0].scrollTop + rect.top - consoleContainer[0].offsetTop + 'px';
          container.style.bottom = consoleContainer[0].scrollTop + rect.bottom + 'px';
          container.style.height = rect.bottom - rect.top + 'px';

          setTimeout(function() {
            angular.element(placeholder).addClass('masked');
            angular.element(container).css('height', consoleContainer[0].clientHeight - 10 + 'px');
            container.style.top = consoleContainer[0].scrollTop + 5 + 'px';
            $scope.selectedMethod = method;
            $scope.$digest();
          });
        });

        $scope.closePopover = function(e) {
          e.preventDefault();
          container.style.top = consoleContainer[0].scrollTop + rect.top - consoleContainer[0].offsetTop + 'px';
          container.style.bottom = consoleContainer[0].scrollTop + rect.bottom + 'px';
          container.style.height = rect.bottom - rect.top + 'px';
          setTimeout(function() {
            angular.element(placeholder).removeClass('masked');

            setTimeout(function() {
              angular.element(container).removeClass('grow-expansion-animation');
              consoleContainer.css('overflow', 'auto');

              $scope.$apply('resource = undefined');
              $scope.$apply('selectedMethod = undefined');
            }, 200);
          });
        };
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
