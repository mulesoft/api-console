(function () {
  'use strict';

  angular.module('RAML.Directives')
    .factory('showResource', ['$timeout', '$rootScope', 'resourceId', function($timeout, $rootScope, resourceId) {
        function loadExamples ($scope, resource) {
          $scope.context.uriParameters.reset(resource.uriParametersForDocumentation);
          $scope.context.queryParameters.reset($scope.methodInfo.queryParameters);
          $scope.context.headers.reset($scope.methodInfo.headers.plain);

          function beautify(body, contentType) {
            if(contentType.indexOf('json') !== -1) {
              body = vkbeautify.json(body, 2);
            }

            if(contentType.indexOf('xml') !== -1) {
              body = vkbeautify.xml(body, 2);
            }

            return body;
          }

          $scope.getBeatifiedExample = function (value) {
            var result = value;

            try {
              result = beautify(value, $scope.currentBodySelected);
            }
            catch (e) { }

            return result;
          };

          if ($scope.context.bodyContent) {
            var definitions = $scope.context.bodyContent.definitions;

            Object.keys(definitions).map(function (key) {
              if (typeof definitions[key].reset !== 'undefined') {
                //Reset formParameters or properties depending on RAML version
                var body = $scope.methodInfo.body[key];
                var parameters = body.formParameters ? body.formParameters : body.properties;
                definitions[key].reset(parameters);
              } else {
                definitions[key].fillWithExample();
                if (definitions[key].value) {
                  definitions[key].value = $scope.getBeatifiedExample(definitions[key].value);
                }
              }
            });
          }
        }

        function getResponseInfo($scope) {
          var responseInfo = {};
          var responses    = $scope.methodInfo.responses;

          if (responses) {
            Object.keys(responses).map(function (key) {
              if(responses[key] && typeof responses[key].body !== 'undefined' && responses[key].body) {
                responseInfo[key] = {};

                Object.keys(responses[key].body).sort().reverse().map(function (type) {
                  responseInfo[key][type] = responses[key].body[type];
                  responseInfo[key].currentType = type;
                });
              }
            });
          }

          return responseInfo;
        }

        function toUIModel ($scope, collection) {
          if(collection) {
            Object.keys(collection).forEach(function (key) {
              collection[key][0].id = key;
              if (collection[key][0].properties) {
                toUIModel($scope, collection[key][0].properties);
              }
            });
          }
        }

        function beautifyCustomSecuritySchemeName (name) {
          return (name.charAt(0).toUpperCase() + name.slice(1)).replace(/_/g, ' ');
        }

      function expandBodyExamples($scope, methodInfo) {
        function expandExamples(body) {
          Object.keys(body).forEach(function (key) {
            var info = body[key];
            var type = info.type ? RAML.Inspector.Types.findType(info.type[0], $scope.types) : undefined;
            if (!body.example && type && type.example) {
              info.example = type.example;
            }

            if (info.properties) {
              expandExamples(info.properties);
            }
          });
        }

        if (methodInfo.body) {
          expandExamples(methodInfo.body);
        }
        return methodInfo;
      }

        return function showResource($scope, resource, $event, $index) {
          var methodInfo        = $index === null ? $scope.methodInfo : resource.methods[$index];
          var oldId             = $rootScope.currentId;

          var id = resourceId(resource);
          var isDifferentMethod = $rootScope.currentId !== id || $scope.currentMethod !== methodInfo.method;

          $scope.currentId               = id;
          $rootScope.currentId           = id;
          $scope.currentMethod           = methodInfo.method;
          $scope.resource                = resource;

          $scope.methodInfo               = expandBodyExamples($scope, methodInfo);
          $scope.responseInfo             = getResponseInfo($scope);
          $scope.context                  = new RAML.Services.TryIt.Context($scope.raml.baseUriParameters, resource, $scope.methodInfo, $scope.types);
          $scope.requestUrl               = '';
          $scope.response                 = {};
          $scope.requestOptions           = {};
          $scope.requestEnd               = false;
          $scope.showRequestMetadata      = false;
          $scope.showMoreEnable           = true;
          $scope.showSpinner              = false;
          $scope.securitySchemes          = $scope.methodInfo.securitySchemes();
          $scope.traits                   = $scope.readTraits($scope.methodInfo.is);
          $scope.context.customParameters = { headers: [], queryParameters: [] };
          $scope.currentBodySelected      = methodInfo.body ? Object.keys(methodInfo.body)[0] : 'application/json';

          toUIModel($scope, $scope.methodInfo.queryParameters);
          toUIModel($scope, $scope.methodInfo.headers.plain);
          toUIModel($scope, resource.uriParametersForDocumentation);

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

          loadExamples($scope, resource);

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

          if (isDifferentMethod) {
            var hash = id;

            $scope.showPanel = true;
            $rootScope.$broadcast('methodClick', id, oldId !== id ? oldId : null);

            $timeout(function () {
              jQuery('html, body').animate({
                scrollTop: jQuery('#'+hash).offset().top + 'px'
              }, 'fast');
            }, 10);

          } else {
            $rootScope.$broadcast('methodClick', null, oldId);
            $scope.showPanel = false;
            $scope.traits = null;
            $scope.methodInfo = {};
            $scope.currentId = null;
            $scope.currentMethod = null;
            $rootScope.currentId = null;
          }
        };
      }]);
})();
