(function () {
  'use strict';

  RAML.Directives.schemaBody = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/schema-body.tpl.html',
      scope: {
        schema: '=',
        mediaType: '='
      },
      controller: ['$scope', function($scope) {
        $scope.body = RAML.Transformer.transformSchemaBody($scope.schema);

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
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('schemaBody', RAML.Directives.schemaBody);
})();
