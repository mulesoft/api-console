(function() {
  'use strict';

  RAML.Directives.resourceDocumentation = function($window) {
    function Controller($rootScope, $scope, $element) {
      var consoleContainer = $('raml-console').parent();

      function closeOnEscape(e) {
        if (e.which === 27) {
          e.preventDefault();
          $scope.resource = undefined;
          $window.removeEventListener('keydown', closeOnEscape);
          $scope.$digest();
          consoleContainer.css('overflow', 'auto');
        }
      }

      $rootScope.$on('console:expand', function(event, resource, $resourceEl) {
        //$scope.resource = resource;
        $window.addEventListener('keydown', closeOnEscape);
        consoleContainer.css('overflow', 'hidden');

        setTimeout(function() {
          //console.log(consoleContainer[0].scrollTop);
          //var placeholder = $element[0].querySelector('.resource-placeholder');
          //var container = $element[0].querySelector('.resource-container');
          //var rect = $resourceEl[0].getBoundingClientRect();

          //container.style.top = rect.top + 'px';
          //container.style.bottom = rect.bottom + 'px';
          //angular.element(placeholder).addClass('test-thing');

          setTimeout(function() {
            //angular.element(container).addClass('grow-container');
            //container.style.top = '';
            //container.style.bottom = '';
          });
        });
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
