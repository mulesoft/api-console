(function () {
  'use strict';

  RAML.Directives.resourcePanel = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/resource-panel.tpl.html',
      scope: {
        baseUri: '=',
        baseUriParameters: '=',
        resource: '=',
        element: '=',
        generateIdRef: '&generateId',
        protocols: '=',
        selectedMethod: '=',
        singleView: '='
      },
      replace: true,
      controller: ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
        $scope.methods = RAML.Transformer.transformMethods($scope.resource.methods());

        $scope.generateId = $scope.generateIdRef();

        $scope.$watch('selectedMethod', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            $scope.displayPanel();
          }
        });

        $scope.displayPanel = function () {
          var $resource         = $scope.element.closest('.raml-console-resource');
          var methodInfo        = $scope.methods[$scope.selectedMethod];
          methodInfo.headers = RAML.Transformer.transformHeaders(
            methodInfo.headers ? methodInfo.headers : []);
          methodInfo.queryParameters = methodInfo.queryParameters ?
            RAML.Transformer.transformNamedParameters(methodInfo.queryParameters) : null;

          $scope.methodInfo               = methodInfo;
          $scope.context                  = new RAML.Services.TryIt.Context($scope.baseUriParameters, $scope.resource, $scope.methodInfo);
          $scope.requestUrl               = '';
          $scope.response                 = {};
          $scope.requestOptions           = {};
          $scope.securitySchemes          = $scope.methodInfo.securitySchemes;
          $scope.traits                   = $scope.readTraits($scope.methodInfo.is);
          $scope.context.customParameters = { headers: [], queryParameters: [] };

          toUIModel($scope.methodInfo.queryParameters);
          toUIModel($scope.methodInfo.headers.plain);
          toUIModel($scope.resource.uriParametersForDocumentation);

          Object.keys($scope.securitySchemes).map(function (key) {
            var type = $scope.securitySchemes[key].type;

            $scope.securitySchemes[key].name = type;
            $scope.securitySchemes[key].id = type + '|' + key;

            if (type === 'x-custom') {
              $scope.securitySchemes[key].name = beautifyCustomSecuritySchemeName(key);
              $scope.securitySchemes[key].id = type + '|' + key;
            }
          });

          $rootScope.$broadcast('resetData');

          /*jshint camelcase: false */
          // Digest Authentication is not supported
          delete $scope.securitySchemes.digest_auth;
          /*jshint camelcase: true */

          loadExamples();

          // Hack for codemirror
          setTimeout(function () {
            var editors = jQuery('.raml-console-sidebar-content-wrapper #sidebar-body .raml-console-codemirror-body-editor .CodeMirror');

            editors.map(function (index) {
              var bodyEditor = editors[index].CodeMirror;

              if (bodyEditor && $scope.context.bodyContent) {
                bodyEditor.setOption('mode', $scope.context.bodyContent.selected);
                bodyEditor.refresh();
              }
            });
          }, 10);

          if (!$resource.hasClass('raml-console-is-active')) {
            var hash = $scope.generateId($scope.resource.pathSegments);

            $timeout(function () {
              jQuery('html, body').animate({
                scrollTop: jQuery('#'+hash).offset().top + 'px'
              }, 'fast');
            }, 10);
          }
        };

        function loadExamples () {
          $scope.context.uriParameters.reset($scope.resource.uriParametersForDocumentation);
          $scope.context.queryParameters.reset($scope.methodInfo.queryParameters);
          $scope.context.headers.reset($scope.methodInfo.headers.plain);

          if ($scope.context.bodyContent) {
            var definitions = $scope.context.bodyContent.definitions;

            Object.keys(definitions).map(function (key) {
              if (typeof definitions[key].reset !== 'undefined') {
                definitions[key].reset($scope.methodInfo.body[key].formParameters);
              } else {
                definitions[key].value = definitions[key].contentType.example;
              }
            });
          }
        }

        function toUIModel (collection) {
          if(collection) {
            Object.keys(collection).map(function (key) {
              collection[key][0].id = key;
            });
          }
        }

        function beautifyCustomSecuritySchemeName (name) {
          return (name.charAt(0).toUpperCase() + name.slice(1)).replace(/_/g, ' ');
        }

        $scope.collapseSidebar = function ($event) {
          var $this         = jQuery($event.currentTarget);
          var $panel        = $this.closest('.raml-console-resource-panel');
          var $panelContent = $panel.find('.raml-console-resource-panel-primary');
          var $sidebar      = $panel.find('.raml-console-sidebar');
          var animation     = 430;
          var speed         = 200;

          if ((!$sidebar.hasClass('raml-console-is-fullscreen') && !$sidebar.hasClass('raml-console-is-collapsed')) || $sidebar.hasClass('raml-console-is-responsive')) {
            animation = 0;
          }

          if ($scope.singleView) {
            $panel.toggleClass('raml-console-has-sidebar-fullscreen');
            speed = 0;
          }

          $sidebar.velocity(
            { width: animation },
            {
              duration: speed,
              complete: function (element) {
                jQuery(element).removeAttr('style');
                if ($scope.singleView) {
                  $scope.documentationEnabled = false;
                }
                apply();
              }
            }
          );

          $panelContent.velocity(
            { 'padding-right': animation },
            {
              duration: speed,
              complete: completeAnimation
            }
          );

          $sidebar.toggleClass('raml-console-is-collapsed');
          $sidebar.removeClass('raml-console-is-responsive');
          $panel.toggleClass('raml-console-has-sidebar-collapsed');

          if ($sidebar.hasClass('raml-console-is-fullscreen') || $scope.singleView) {
            $sidebar.toggleClass('raml-console-is-fullscreen');
          }
        };

        function completeAnimation (element) {
          jQuery(element).removeAttr('style');
        }

        function apply () {
          $scope.$apply.apply($scope, arguments);
        }

        $scope.readTraits = function (traits) {
          var list = [];
          var traitList = traits || [];

          traitList = traitList.concat($scope.resource.traits);

          traitList.map(function (trait) {
            if (trait) {
              if (typeof trait === 'object') {
              trait = Object.keys(trait).join(', ');
              }

              if (list.indexOf(trait) === -1) {
                list.push(trait);
              }
            }
          });

          return list.join(', ');
        };

        $scope.displayPanel();
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('resourcePanel', RAML.Directives.resourcePanel);
})();
