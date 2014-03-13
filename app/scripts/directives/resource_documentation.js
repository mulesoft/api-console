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
        angular.element($element[0].querySelector('.resource-placeholder')).css('height', resourceList.css('height'));
        angular.element($element[0].querySelector('.resource-container')).css('transition', 'height 1s, top 1s')
        // console.log(consoleContainer.css('height'));

        setTimeout(function() {
          var placeholder = $element[0].querySelector('.resource-placeholder');
          var container = $element[0].querySelector('.resource-container');
          var rect = $resourceEl[0].getBoundingClientRect();

          container.style.top = consoleContainer[0].scrollTop + rect.top - consoleContainer[0].offsetTop + 'px';
          container.style.bottom = consoleContainer[0].scrollTop + rect.bottom + 'px';
          container.style.height = rect.bottom - rect.top + 'px';
          angular.element(placeholder).addClass('test-thing');

          setTimeout(function() {
           // angular.element(container).addClass('grow-container');
           angular.element(container).css('height', consoleContainer.css('height'));
           console.log(consoleContainer[0].scrollTop);
           container.style.top = consoleContainer[0].scrollTop + 'px';
           // container.style.bottom = '';
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
