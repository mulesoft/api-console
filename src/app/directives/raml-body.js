(function () {
  'use strict';

  RAML.Directives.ramlBody = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-body.tpl.html',
      scope: {
        body: '=',
        getBeatifiedExampleRef: '&'
      },
      controller: ['$scope', '$rootScope', function($scope, $rootScope) {
        $scope.getBeatifiedExample = $scope.getBeatifiedExampleRef();

        $scope.$watch('body', function () {
          $scope.identifyBodyType();
        });

        $scope.identifyBodyType = function () {
          if ($scope.body && $scope.body.schema) {
            var theSchema = Array.isArray($scope.body.schema) ? $scope.body.schema[0] : $scope.body.schema;
            $scope.getContent(theSchema, $scope.body);
          } else if ($scope.body && $scope.body.type) {
            var theType = Array.isArray($scope.body.type) ? $scope.body.type[0] : $scope.body.type;
            $scope.getContent(theType, $scope.body);
          }
        };

        $scope.getContent = function (name, body) {
          var type = RAML.Inspector.Types.findType(name, $rootScope.types);
          var schema = RAML.Inspector.Types.findSchema(name, $rootScope.schemas);
          if ((type && typeof type === 'object') || body.properties) {
            $scope.isType = true;
          } else {
            $scope.isSchema = true;
            $scope.definition = schema || type || name;
          }
        };

        $scope.showSchema = function ($event) {
          var $this   = jQuery($event.currentTarget);
          var $panel  = $this.closest('.raml-console-schema-container');
          var $schema = $panel.find('.raml-console-resource-pre-toggle');

          $this.toggleClass('raml-console-is-active');

          if (!$schema.hasClass('raml-console-is-active')) {
            $this.text('Hide Schema');
            $schema
              .addClass('raml-console-is-active')
              .velocity('slideDown');
          } else {
            $this.text('Show Schema');
            $schema
              .removeClass('raml-console-is-active')
              .velocity('slideUp');
          }
        };

        $scope.identifyBodyType();
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlBody', RAML.Directives.ramlBody);
})();
