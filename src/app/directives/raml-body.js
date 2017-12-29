(function () {
  'use strict';

  RAML.Directives.ramlBody = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-body.tpl.html',
      scope: {
        body: '=',
        showExamples: '=',
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

          function cleanType(type) {
            var cleanedAttributes = ['properties', 'required', 'items', 'type'];
            Object.keys(type).forEach(function (attribute) {
              if (cleanedAttributes.indexOf(attribute) === -1) {
                delete type[attribute];
              }

              switch (attribute) {
                case cleanedAttributes[0]:
                  Object.keys(type[attribute]).forEach(function (a) {
                    type[attribute][a] = cleanType(type[attribute][a]);
                  });
                  return;
                case cleanedAttributes[2]:
                  type[attribute] = cleanType(type[attribute]);
                  return;
                case cleanedAttributes[3]:
                  if (Array.isArray(type[attribute])) {
                    type[attribute] = type[attribute][0];
                  } else {
                    type[attribute] = cleanType(type[attribute]);
                  }
                  return;
                default:
                  return;
              }
            });
            return type;
          }

          if (node.type) {
            node.type = Array.isArray(node.type) ? node.type : [node.type];
            node.type.forEach(function (aType) {
              if (typeof aType !== 'object') {
                var isNative = RAML.Inspector.Types.isNativeType(aType);

                if (isNative) {
                  $scope.isType = true;
                } else {
                  var declaredType = RAML.Inspector.Types.findType(aType, $rootScope.types);
                  var declaredSchema = RAML.Inspector.Types.findSchema(aType, $rootScope.schemas);

                  if (declaredType) {
                    var typeParts = declaredType.type[0].split('|');
                    var firstType = RAML.Inspector.Types.cleanupTypeName(typeParts[0]);

                    if (RAML.Inspector.Types.isNativeType(firstType) ||
                        RAML.Inspector.Types.findType(firstType, $rootScope.types)) {
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
                      try {
                        JSON.parse(aType);
                        $scope.definition = aType;
                      } catch (e) {
                        if (aType.indexOf('|') !== -1) {
                          $scope.isSchema = false;
                          $scope.isType = true;
                        } else {
                          $scope.definition = aType;
                        }
                      }
                    }
                  }
                }
              } else {
                $scope.isSchema = true;

                var cleanedType = cleanType(aType);
                $scope.definition = JSON.stringify(cleanedType, null, 2);
              }
            });
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
