(function () {
  'use strict';

  RAML.Directives.sidebar = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/sidebar.tpl.html',
      replace: true,
      link: function ($scope, $element) {
        var el = angular.element(angular.element($element.children().children()[0]).children()[2]);

        el.bind('scroll', function ($event) {
          var $el = $event.currentTarget;

          if ($el.scrollHeight === $el.offsetHeight + $el.scrollTop) {
            $scope.showMoreEnable = false;
          } else {
            $scope.showMoreEnable = true;
          }

          $scope.$apply.apply($scope, null);
        });
      },
      controller: function ($scope, $location, $anchorScroll) {
        $scope.currentSchemeType = 'anonymous';

        function completeAnimation (element) {
          jQuery(element).removeAttr('style');
        }

        function parseHeaders(headers) {
          var parsed = {}, key, val, i;

          if (!headers) {
            return parsed;
          }

          headers.split('\n').forEach(function(line) {
            i   = line.indexOf(':');
            key = line.substr(0, i).trim().toLowerCase();
            val = line.substr(i + 1).trim();

            if (key) {
              if (parsed[key]) {
                parsed[key] += ', ' + val;
              } else {
                parsed[key] = val;
              }
            }
          });

          return parsed;
        }

        function apply () {
          $scope.$apply.apply($scope, arguments);
        }

        function handleResponse(jqXhr) {
          $scope.response.body    = jqXhr.responseText,
          $scope.response.status  = jqXhr.status,
          $scope.response.headers = parseHeaders(jqXhr.getAllResponseHeaders());

          if ($scope.response.headers['content-type']) {
            $scope.response.contentType = $scope.response.headers['content-type'].split(';')[0];
          }

          $scope.requestEnd     = true;
          $scope.showMoreEnable = true;
          $scope.showSpinner    = false;
          $scope.responseDetails.show();

          $scope.editors.map(function (index) {
            var codeMirror = $scope.editors[index].CodeMirror;
            codeMirror.setOption('mode', $scope.response.contentType);
            setTimeout(function () {
              codeMirror.refresh();
            }, 1);
          });

          var hash = 'request_' + $scope.generateId($scope.resource.pathSegments);
          $location.hash(hash);
          $anchorScroll();

          apply();
        }

        function resolveSegementContexts(pathSegments, uriParameters) {
          var segmentContexts = [];

          pathSegments.forEach(function (element) {
            if (element.templated) {
              var segment = {};
              Object.keys(element.parameters).map(function (key) {
                segment[key] = uriParameters[key];
              });
              segmentContexts.push(segment);
            } else {
              segmentContexts.push({});
            }
          });

          return segmentContexts;
        }

        function validateForm(form) {
          var errors    = form.$error;
          var uriParams = $scope.context.uriParameters.plain;
          var flag      = false;

          Object.keys(form.$error).map(function (key) {
            for (var i = 0; i < errors[key].length; i++) {
              var fieldName = errors[key][i].$name;
              var fieldValue = form[fieldName].$viewValue;

              form[fieldName].$setViewValue(form[fieldName].$viewValue);

              if (typeof uriParams[fieldName] !== 'undefined' && (typeof fieldValue === 'undefined' || fieldValue === '')) {
                flag = true;
                break;
              }
            }
          });

          if (flag) {
            $scope.context.forceRequest = false;
          }
        }

        function getParameters (context, type) {
          var params           = {};
          var customParameters = context.customParameters[type];

          if (!RAML.Utils.isEmpty(context[type].data())) {
            params = context[type].data();
          }

          if (customParameters.length > 0) {
            for(var i = 0; i < customParameters.length; i++) {
              var key = customParameters[i].name;

              params[key] = [];
              params[key].push(customParameters[i].value);
            }
          }

          return params;
        }

        $scope.clearFields = function () {
          $scope.context.uriParameters.clear($scope.resource.uriParametersForDocumentation);
          $scope.context.queryParameters.clear($scope.methodInfo.queryParameters);
          $scope.context.headers.clear($scope.methodInfo.headers.plain);
          if ($scope.context.bodyContent) {
            $scope.context.bodyContent.definitions[$scope.context.bodyContent.selected].value = '';
          }
          $scope.context.forceRequest = false;
        };

        $scope.resetFields = function () {
          $scope.context.uriParameters.reset($scope.resource.uriParametersForDocumentation);
          $scope.context.queryParameters.reset($scope.methodInfo.queryParameters);
          $scope.context.headers.reset($scope.methodInfo.headers.plain);
          if ($scope.context.bodyContent) {
            var current      = $scope.context.bodyContent.selected;
            var definition   = $scope.context.bodyContent.definitions[current];
            if (definition.contentType) {
              $scope.context.bodyContent.definitions[current].value = definition.contentType.example;
            }
          }
          $scope.context.forceRequest = false;
        };

        $scope.toggleBodyType = function ($event, bodyType) {
          var $this  = jQuery($event.currentTarget);
          var $panel = $this.closest('.sidebar-toggle-type').find('button');

          $panel.removeClass('is-active');
          $this.addClass('is-active');
          $scope.context.bodyContent.selected = bodyType;

          var editor = $this.closest('.sidebar-row')
                            .parent()
                            .find('.codemirror-body-editor .CodeMirror')[0]
                            .CodeMirror;
          editor.setOption('mode', bodyType);
          setTimeout(function () {
            editor.refresh();
          }, 1);
        };

        $scope.hasExampleValue = function (value) {
          return typeof value !== 'undefined' ? true : false;
        };

        $scope.context.forceRequest = false;

        $scope.tryIt = function ($event) {
          validateForm($scope.form);

          if (!$scope.context.forceRequest) {
            jQuery($event.currentTarget).closest('form').find('.ng-invalid').first().focus();
          }

          if($scope.context.forceRequest || $scope.form.$valid) {
            var url;
            var context         = $scope.context;
            var segmentContexts = resolveSegementContexts($scope.resource.pathSegments, $scope.context.uriParameters.data());

            $scope.showSpinner = true;
            // $scope.toggleSidebar($event, true);
            $scope.toggleRequestMetadata($event, true);
            $scope.editors = jQuery($event.currentTarget).closest('.sidebar-content-wrapper').find('.CodeMirror');
            $scope.responseDetails = jQuery($event.currentTarget).closest('.sidebar-content-wrapper').find('.side-bar-try-it-description');

            try {
              var pathBuilder = context.pathBuilder;
              var client      = RAML.Client.create($scope.raml, function(client) {
                if ($scope.raml.baseUriParameters) {
                  Object.keys($scope.raml.baseUriParameters).map(function (key) {
                    var uriParameters = $scope.context.uriParameters.data();
                    pathBuilder.baseUriContext[key] = uriParameters[key][0];
                    delete uriParameters[key];
                  });
                }
                client.baseUriParameters(pathBuilder.baseUriContext);
              });
              url = client.baseUri + pathBuilder(segmentContexts);
            } catch (e) {
              $scope.response = {};
              return;
            }

            var request = RAML.Client.Request.create(url, $scope.methodInfo.method);

            $scope.parameters = getParameters(context, 'queryParameters');

            request.queryParams($scope.parameters);
            request.headers(getParameters(context, 'headers'));

            if (context.bodyContent) {
              request.header('Content-Type', context.bodyContent.selected);
              request.data(context.bodyContent.data());
            }

            $scope.requestOptions = request.toOptions();

            var authStrategy;

            try {
              var securitySchemes = $scope.methodInfo.securitySchemes();
              var scheme          = securitySchemes && securitySchemes[$scope.currentSchemeType];

              //// TODO: Make a uniform interface
              if (scheme && scheme.type === 'OAuth 2.0') {
                authStrategy = new RAML.Client.AuthStrategies.Oauth2(scheme, $scope.credentials);
                authStrategy.authenticate($scope.requestOptions, handleResponse);
                return;
              }

              /* jshint es5: true */
              authStrategy = RAML.Client.AuthStrategies.for(scheme, $scope.credentials);
              authStrategy.authenticate().then(function(token) {
                token.sign(request);

                jQuery.ajax($scope.requestOptions).then(
                  function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
                  function(jqXhr) { handleResponse(jqXhr); }
                );
              });
              /* jshint es5: false */
            } catch (e) {
              // custom strategies aren't supported yet.
            }
          } else {
            $scope.context.forceRequest = true;
          }
        };

        $scope.toggleSidebar = function ($event, fullscreenEnable) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.resource-panel');
          var $sidebar     = $panel.find('.sidebar');
          var sidebarWidth = 0;

          if (jQuery(window).width() > 960) {
            sidebarWidth = 430;
          }

          if ($sidebar.hasClass('is-fullscreen') && !fullscreenEnable) {
            $sidebar.velocity(
              { width: sidebarWidth },
              {
                duration: 200,
                complete: completeAnimation
              }
            );
            $sidebar.removeClass('is-fullscreen');
            $panel.removeClass('has-sidebar-fullscreen');
          } else {
            $sidebar.velocity(
              { width: '100%' },
              {
                duration: 200,
                complete: completeAnimation
              }
            );
            $sidebar.addClass('is-fullscreen');
            $panel.addClass('has-sidebar-fullscreen');
          }
        };

        $scope.collapseSidebar = function ($event) {
          var $this         = jQuery($event.currentTarget);
          var $panel        = $this.closest('.resource-panel');
          var $panelContent = $panel.find('.resource-panel-primary');
          var $sidebar      = $panel.find('.sidebar');

          if ($sidebar.hasClass('is-collapsed')) {
            $sidebar.velocity(
              { width: 430 },
              {
                duration: 200,
                complete: completeAnimation
              }
            );

            $panelContent.velocity(
              { 'padding-left': 430 },
              {
                duration: 200,
                complete: completeAnimation
              }
            );
          } else {
            $sidebar.velocity(
              { width: 0 },
              {
                duration: 200,
                complete: completeAnimation
              }
            );

            $panelContent.velocity(
              { 'padding-left': 0 },
              {
                duration: 200,
                complete: completeAnimation
              }
            );
          }

          $sidebar.toggleClass('is-collapsed');
          $panel.toggleClass('has-sidebar-collapsed');
        };

        $scope.toggleRequestMetadata = function (enabled) {
          if ($scope.showRequestMetadata && !enabled) {
            $scope.showRequestMetadata = false;
          } else {
            $scope.showRequestMetadata = true;
          }
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('sidebar', RAML.Directives.sidebar);
})();
