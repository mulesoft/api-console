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

        $scope.getTopSchema = function (name) {
          return RAML.Inspector.Types.findSchema(name, $rootScope.schemas);
        };

        $scope.getTopType = function (name) {
          name = Array.isArray(name) ? name[0] : name;
          return RAML.Inspector.Types.findType(name, $rootScope.types);
        };

        $scope.identifyBodyType = function () {
          var node = $scope.body;
          var topType;

          if (node && node.schema && $scope.getTopSchema(node.schema)) {
            $scope.isSchema = true;
            $scope.definition = $scope.getTopSchema(node.schema);
          } else if (node && node.type && $scope.getTopSchema(node.type)) {
            $scope.isSchema = true;
            $scope.definition = $scope.getTopSchema(node.type);
          } else if (node && node.schema && $scope.getTopType(node.schema)) {
            if (node.schemaContent) {
              $scope.isSchema = true;
              $scope.definition = node.schemaContent;
            } else {
              $scope.isType = true;
            }
          } else if (node && node.type && $scope.getTopType(node.type)) {
            if (node.schemaContent) {
              $scope.isSchema = true;
              $scope.definition = node.schemaContent;
            } else {
              $scope.isType = true;
            }
          } else if (node && node.type && node.properties) {
            $scope.isType = true;
          } else if (node.schema) {
            $scope.isSchema = true;
            $scope.definition = node.schema;
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
