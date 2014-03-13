(function() {
  'use strict';

  RAML.Directives.resourceDocumentation = function($window) {
    function Controller($rootScope, $scope, $element) {
      var consoleContainer = $('raml-console').parent();
      var resourceList = $('#raml-console');

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
        $scope.resource = resource;
        $window.addEventListener('keydown', closeOnEscape);
        consoleContainer.css('overflow', 'hidden');
        console.log(resourceList.css('height'));
        angular.element($element[0].querySelector('.resource-placeholder')).css('height', resourceList.css('height'));

        setTimeout(function() {
          console.log(consoleContainer[0].scrollTop);
          //var placeholder = $element[0].querySelector('.resource-placeholder');
          var container = $element[0].querySelector('.resource-container');
          var rect = $resourceEl[0].getBoundingClientRect();

          container.style.top = consoleContainer[0].scrollTop + rect.top + 'px';
          container.style.bottom = consoleContainer[0].scrollTop + rect.bottom + 'px';
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
