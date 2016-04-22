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
          var node = angular.copy($scope.body);
          node.type = node.type || node.schema;
          $scope.isType = false;
          $scope.isSchema = false;

          node.type.forEach(function (aType) {
            var isNative = RAML.Inspector.Types.isNativeType(aType);

            if (isNative) {
              $scope.isType = true;
            } else {
              var declaredType = RAML.Inspector.Types.findType(aType, $rootScope.types);
              var declaredSchema = RAML.Inspector.Types.findSchema(aType, $rootScope.schemas);

              if (declaredType) {
                if (RAML.Inspector.Types.isNativeType(declaredType.type[0]) ||
                    RAML.Inspector.Types.findType(declaredType.type[0], $rootScope.types)) {
                  $scope.isType = true;
                } else {
                  $scope.isSchema = true;
                  $scope.definition = declaredType.type[0];
                }
              } else {
                $scope.isSchema = true;
                if (declaredSchema) {
                  if (declaredSchema.type) {
                    $scope.definition = declaredSchema.type[0];
                  } else {
                    $scope.definition = declaredSchema;
                  }
                } else {
                  $scope.definition = aType;
                }
              }
            }
          });
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
