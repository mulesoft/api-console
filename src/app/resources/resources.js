RAML.Directives.resources = function(ramlParserWrapper) {
  return {
    restrict: 'E',
    templateUrl: 'resources/resources.tpl.html',
    replace: true,
    scope: {
        src: '@'
      },
    controller: function($scope, $element) {
      if ($scope.src) {
        ramlParserWrapper.load($scope.src);
      }

      $scope.toggle = function ($event) {
        var $this = jQuery($event.currentTarget);
        var $section = $this
          .closest('.resource-list-item')
          .find('.resource-list');

        if ($section.hasClass('is-collapsed')) {
          $section.velocity('slideDown', {
            duration: 200
          });
        } else {
          $section.velocity('slideUp', {
            duration: 200
          });
        }

        $section.toggleClass('is-collapsed');
        $this.toggleClass('is-active');
      };
    },
    link: function($scope, $element) {
      ramlParserWrapper.onParseSuccess(function(raml) {
        $scope.raml = RAML.Inspector.create(raml);
        // console.log($scope.raml);
      });

      ramlParserWrapper.onParseError(function(error) {
        // Show errors!!!
        // $scope.parseError = error;
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('ramlResources', RAML.Directives.resources);
