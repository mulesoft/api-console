(function() {
  'use strict';

  RAML.Directives.resourceDocumentation = function($window) {
    function Controller($rootScope, $scope, $element) {

      var consoleContainer = $('raml-console').parent();
      var resourceList = $('#raml-console');

      $rootScope.$on('console:expand', function(event, resource, $resourceEl) {
        var placeholder = $element[0].querySelector('.resource-placeholder');
        var container = $element[0].querySelector('.resource-container');
        var rect;

        $scope.resource = resource;
        $window.addEventListener('keydown', closeOnEscape);

        consoleContainer.css('overflow', 'hidden');
        angular.element($element[0].querySelector('.resource-placeholder')).css('height', resourceList.css('height'));
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
          });
        });

        function closeOnEscape(e) {
          if (e.which === 27) {
            e.preventDefault();
            closePopover();
          }
        }

        function closePopover(e) {
          container.style.top = consoleContainer[0].scrollTop + rect.top - consoleContainer[0].offsetTop + 'px';
          container.style.bottom = consoleContainer[0].scrollTop + rect.bottom + 'px';
          container.style.height = rect.bottom - rect.top + 'px';
          setTimeout(function() {
            angular.element(placeholder).removeClass('masked');

            setTimeout(function() {
              angular.element(container).removeClass('grow-expansion-animation');
              consoleContainer.css('overflow', 'auto');

              $window.removeEventListener('keydown', closeOnEscape);
              $scope.$apply('resource = undefined');
            }, 200);
          });
        }
      });
    }

    return {
      restrict: 'E',
      templateUrl: 'views/resource_documentation.tmpl.html',
      controller: Controller,
      scope: { }
    };
  };
})();
