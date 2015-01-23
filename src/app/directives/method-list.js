(function () {
  'use strict';

  RAML.Directives.methodList = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/method-list.tpl.html',
      replace: true,
      controller: function($scope, $location, $anchorScroll, $rootScope) {
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

        function getResponseInfo() {
          var responseInfo = {};
          var responses    = $scope.methodInfo.responses;

          if (responses) {
            Object.keys(responses).map(function (key) {
              if(responses[key] && typeof responses[key].body !== 'undefined') {
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

        function toUIModel (collection) {
          if(collection) {
            Object.keys(collection).map(function (key) {
              collection[key][0].id = key;
            });
          }
        }

        $scope.readTraits = function (traits) {
          var list = [];

          if (traits) {
            traits.map(function (trait) {
              if (typeof trait === 'string') {
                list.push(trait);
              } else if (typeof trait === 'object') {
                list.push(Object.keys(trait).join(', '));
              }
            });
          }

          return list.join(', ');
        };

        $scope.generateId = function (path) {
          return jQuery.trim(path.toString().replace(/\W/g, ' ')).replace(/\s+/g, '_');
        };

        var $inactiveElements = jQuery('.raml-console-tab').add('.raml-console-resource').add('li');

        $scope.$on('openMethod', function(event, $currentScope) {
          if ($scope.$id !== $currentScope.$id) {
            $inactiveElements.removeClass('is-active');
            $scope.showPanel = false;
          }
        });

        $scope.showResource = function ($event, $index) {
          var $this             = jQuery($event.currentTarget);
          var $resource         = $this.closest('.raml-console-resource');
          var $inactiveElements = jQuery('.raml-console-tab').add('.raml-console-resource').add('li');
          var methodInfo        = $scope.resource.methods[$index];

          $scope.methodInfo               = methodInfo;
          $scope.responseInfo             = getResponseInfo();
          $scope.context                  = new RAML.Services.TryIt.Context($scope.raml.baseUriParameters, $scope.resource, $scope.methodInfo);
          $scope.requestUrl               = '';
          $scope.response                 = {};
          $scope.requestOptions           = {};
          $scope.requestEnd               = false;
          $scope.showRequestMetadata      = false;
          $scope.showMoreEnable           = true;
          $scope.showSpinner              = false;
          $scope.securitySchemes          = $scope.methodInfo.securitySchemes();
          $scope.credentials              = {};
          $scope.traits                   = $scope.readTraits($scope.methodInfo.is);
          $scope.context.customParameters = { headers: [], queryParameters: [] };
          $scope.currentBodySelected      = methodInfo.body ? Object.keys(methodInfo.body)[0] : 'application/json';

          toUIModel($scope.methodInfo.queryParameters);
          toUIModel($scope.methodInfo.headers.plain);
          toUIModel($scope.resource.uriParametersForDocumentation);

          $scope.securitySchemes.anonymous = {
            type: 'Anonymous'
          };

          /*jshint camelcase: false */
          // Digest Authentication is not supported
          delete $scope.securitySchemes.digest_auth;
          /*jshint camelcase: true */

          loadExamples();

          var defaultScheme = Object.keys($scope.securitySchemes).sort()[0];
          $scope.currentScheme = {
            type: $scope.securitySchemes[defaultScheme].type,
            name: defaultScheme
          };

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

            $rootScope.$broadcast('openMethod', $scope);
            jQuery($this).addClass('raml-console-is-active');
            $scope.showPanel = true;

            $location.hash(hash);
            $anchorScroll();
          } else if (jQuery($this).hasClass('raml-console-is-active')) {
            $scope.showPanel = false;
            $inactiveElements.removeClass('raml-console-is-active');
          } else {
            jQuery($this).addClass('raml-console-is-active');
            jQuery($this).siblings('.raml-console-tab').removeClass('raml-console-is-active');
          }
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('methodList', RAML.Directives.methodList);
})();
