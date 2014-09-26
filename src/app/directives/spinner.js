RAML.Directives.spinner = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/spinner.tpl.html',
    replace: true,
    link: function($scope, $element, attrs) {
      $scope.$on("loading-started", function(e) {
        $element.css({"display" : ""});
      });

      $scope.$on("loading-complete", function(e) {
        $element.css({"display" : "none"});
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('spinner', ['$window', RAML.Directives.spinner]);
