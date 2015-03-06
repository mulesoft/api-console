(function () {
  'use strict';

  RAML.Directives.sidebar = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/sidebar.tpl.html',
      replace: true,
      controller: function ($scope, $location, $anchorScroll) {
        var defaultSchemaKey = Object.keys($scope.securitySchemes).sort()[0];
        var defaultSchema    = $scope.securitySchemes[defaultSchemaKey];

        $scope.markedOptions     = RAML.Settings.marked;
        $scope.currentSchemeType = defaultSchema.type;
        $scope.currentScheme     = defaultSchema.id;
        $scope.responseDetails   = false;

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

        function beautify(body, contentType) {
          if(contentType.indexOf('json')) {
            body = vkbeautify.json(body, 2);
          }

          if(contentType.indexOf('xml')) {
            body = vkbeautify.xml(body, 2);
          }

          return body;
        }

        function handleResponse(jqXhr, err) {
          $scope.response.status = jqXhr ? jqXhr.status : err ? err.status : 0;

          if (jqXhr) {
            $scope.response.headers = parseHeaders(jqXhr.getAllResponseHeaders());

            if ($scope.response.headers['content-type']) {
              $scope.response.contentType = $scope.response.headers['content-type'].split(';')[0];
            }

            $scope.currentStatusCode = jqXhr.status.toString();

            try {
              $scope.response.body = beautify(jqXhr.responseText, $scope.response.contentType);
            }
            catch (e) {
              $scope.response.body = jqXhr.responseText;
            }
          }

          $scope.requestEnd      = true;
          $scope.showMoreEnable  = true;
          $scope.showSpinner     = false;
          $scope.responseDetails = true;

          var hash = 'request_' + $scope.generateId($scope.resource.pathSegments);
          $location.hash(hash);
          $anchorScroll();

          // If the response fails because of CORS, responseText is null
          var editorHeight = 50;

          if (jqXhr && jqXhr.responseText) {
            var lines = $scope.response.body.split('\n').length;
            editorHeight = lines > 100 ? 2000 : 25*lines;
          }

          $scope.editorStyle = {
            height: editorHeight + 'px'
          };

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
          // var uriParams = $scope.context.uriParameters.plain;
          var flag      = false;

          Object.keys(form.$error).map(function (key) {
            for (var i = 0; i < errors[key].length; i++) {
              var fieldName = errors[key][i].$name;
              // var fieldValue = form[fieldName].$viewValue;

              form[fieldName].$setViewValue(form[fieldName].$viewValue);

              // Enforce request without URI parameters
              // if (typeof uriParams[fieldName] !== 'undefined' && (typeof fieldValue === 'undefined' || fieldValue === '')) {
              //   flag = true;
              //   break;
              // }
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

        function clearCustomFields (types) {
          types.map(function (type) {
            var custom = $scope.context.customParameters[type];

            for (var i = 0; i < custom.length; i++) {
              custom[i].value = '';
            }
          });
        }

        $scope.$on('resetData', function() {
          var defaultSchemaKey = Object.keys($scope.securitySchemes).sort()[0];
          var defaultSchema    = $scope.securitySchemes[defaultSchemaKey];

          $scope.currentSchemeType = defaultSchema.type;
          $scope.currentScheme     = defaultSchema.id;
        });

        $scope.cancelRequest = function () {
          $scope.showSpinner = false;
        };

        $scope.prefillBody = function (current) {
          var definition   = $scope.context.bodyContent.definitions[current];
          definition.value = definition.contentType.example;
        };

        $scope.clearFields = function () {
          $scope.context.uriParameters.clear($scope.resource.uriParametersForDocumentation);
          $scope.context.queryParameters.clear($scope.methodInfo.queryParameters);
          $scope.context.headers.clear($scope.methodInfo.headers.plain);
          if ($scope.context.bodyContent) {
            $scope.context.bodyContent.definitions[$scope.context.bodyContent.selected].value = '';
          }
          $scope.context.forceRequest = false;

          if ($scope.credentials) {
            Object.keys($scope.credentials).map(function (key) {
              $scope.credentials[key] = '';
            });
          }

          clearCustomFields(['headers', 'queryParameters']);

          if ($scope.context.bodyContent) {
            var current    = $scope.context.bodyContent.selected;
            var definition = $scope.context.bodyContent.definitions[current];

            if (typeof definition.clear !== 'undefined') {
              definition.clear($scope.methodInfo.body[current].formParameters);
            } else {
              definition.value = '';
            }
          }
        };

        $scope.resetFormParameter = function (param) {
          var current    = $scope.context.bodyContent.selected;
          var definition = $scope.context.bodyContent.definitions[current];

          definition.reset($scope.methodInfo.body[current].formParameters, param.id);
        };

        $scope.resetFields = function () {
          $scope.context.uriParameters.reset($scope.resource.uriParametersForDocumentation);
          $scope.context.queryParameters.reset($scope.methodInfo.queryParameters);
          $scope.context.headers.reset($scope.methodInfo.headers.plain);

          if ($scope.context.bodyContent) {
            var current    = $scope.context.bodyContent.selected;
            var definition = $scope.context.bodyContent.definitions[current];

            if (typeof definition.reset !== 'undefined') {
              definition.reset($scope.methodInfo.body[current].formParameters);
            } else {
              definition.value = definition.contentType.example;
            }
          }

          $scope.context.forceRequest = false;
        };

        $scope.requestBodySelectionChange = function (bodyType) {
          $scope.currentBodySelected = bodyType;
        };

        $scope.toggleBodyType = function ($event, bodyType) {
          var $this  = jQuery($event.currentTarget);
          var $panel = $this.closest('.raml-console-sidebar-toggle-type').find('button');

          $panel.removeClass('raml-console-is-active');
          $this.addClass('raml-console-is-active');

          $scope.context.bodyContent.selected = bodyType;
        };

        $scope.getHeaderValue = function (header) {
          if (typeof header === 'string') {
            return header;
          }

          return header[0];
        };

        $scope.hasExampleValue = function (value) {
          return typeof value !== 'undefined' ? true : false;
        };

        $scope.context.forceRequest = false;

        function cleanSchemeMetadata(collection, context) {
          Object.keys(collection).map(function (key) {
            if (collection[key][0].isFromSecurityScheme) {
              delete collection[key];
            }

            if (context.plain[key].definitions[0].isFromSecurityScheme) {
              delete context.plain[key];
            }
          });
        }

        function updateContextData (type, scheme, collection, context) {
          var details         = $scope.securitySchemes[scheme].describedBy || {};
          var securityHeaders = details[type] || {};

          if (securityHeaders) {
            Object.keys(securityHeaders).map(function (key) {
              if (!securityHeaders[key]) {
                securityHeaders[key] = {
                  id: key,
                  type: 'string'
                };
              }

              securityHeaders[key].displayName             = key;
              securityHeaders[key].isFromSecurityScheme    = true;
              collection[key] = [securityHeaders[key]];

              context.plain[key] = {
                definitions: [securityHeaders[key]],
                selected: securityHeaders[key].type
              };
              context.values[key] = [undefined];
            });
          }
        }

        $scope.securitySchemeChanged = function (scheme) {
          var info            = scheme.split('|');
          var type            = info[0];
          var name            = info[1];

          $scope.currentSchemeType = type;

          cleanSchemeMetadata($scope.methodInfo.headers.plain, $scope.context.headers);
          cleanSchemeMetadata($scope.methodInfo.queryParameters, $scope.context.queryParameters);

          if (type === 'x-custom') {
            if (!$scope.methodInfo.headers.plain) {
              $scope.methodInfo.headers.plain = {};
            }

            updateContextData('headers', name, $scope.methodInfo.headers.plain, $scope.context.headers);
            updateContextData('queryParameters', name, $scope.methodInfo.queryParameters, $scope.context.queryParameters);
          }
        };

        $scope.tryIt = function ($event) {
          $scope.requestOptions  = null;
          $scope.responseDetails = false;
          $scope.response        = {};

          validateForm($scope.form);

          if (!$scope.context.forceRequest) {
            jQuery($event.currentTarget).closest('form').find('.ng-invalid').first().focus();
          }

          if($scope.context.forceRequest || $scope.form.$valid) {
            var url;
            var context         = $scope.context;
            var segmentContexts = resolveSegementContexts($scope.resource.pathSegments, $scope.context.uriParameters.data());

            $scope.showSpinner = true;
            $scope.toggleRequestMetadata($event, true);

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

            var authStrategy;

            try {
              var securitySchemes = $scope.methodInfo.securitySchemes();
              var scheme;

              Object.keys(securitySchemes).map(function(key) {
                if (securitySchemes[key].type === $scope.currentSchemeType) {
                  scheme = securitySchemes && securitySchemes[key];
                  return;
                }
              });

              //// TODO: Make a uniform interface
              if (scheme && scheme.type === 'OAuth 2.0') {
                authStrategy = new RAML.Client.AuthStrategies.Oauth2(scheme, $scope.credentials);
                authStrategy.authenticate(request.toOptions(), function (jqXhr, err) {
                  $scope.requestOptions = request.toOptions();
                  handleResponse(jqXhr, err);
                });
                return;
              }

              authStrategy = RAML.Client.AuthStrategies.for(scheme, $scope.credentials);
              authStrategy.authenticate().then(function(token) {
                token.sign(request);
                $scope.requestOptions = request.toOptions();
                jQuery.ajax(request.toOptions()).then(
                  function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
                  function(jqXhr) { handleResponse(jqXhr); }
                );
              });

              $scope.requestOptions = request.toOptions();
            } catch (e) {
              // custom strategies aren't supported yet.
            }
          } else {
            $scope.context.forceRequest = true;
          }
        };

        $scope.documentationEnabled = true;

        $scope.toggleSidebar = function ($event) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.raml-console-resource-panel');
          var $sidebar     = $panel.find('.raml-console-sidebar');
          var sidebarWidth = 0;

          if (jQuery(window).width() > 960) {
            sidebarWidth = 430;
          }

          if ($sidebar.hasClass('raml-console-is-fullscreen')) {
            $scope.documentationEnabled = true;
            $sidebar.velocity(
              { width: $scope.singleView ? 0 : sidebarWidth },
              {
                duration: 200,
                complete: function (element) {
                  jQuery(element).removeAttr('style');
                  $sidebar.removeClass('raml-console-is-fullscreen');
                }
              }
            );
            $sidebar.removeClass('raml-console-is-responsive');
            $panel.removeClass('raml-console-has-sidebar-fullscreen');
          } else {
            $sidebar.velocity(
              { width: '100%' },
              {
                duration: 200,
                complete: function (element) {
                  jQuery(element).removeAttr('style');
                  $scope.documentationEnabled = false;
                  apply();
                }
              }
            );

            $sidebar.addClass('raml-console-is-fullscreen');
            $sidebar.addClass('raml-console-is-responsive');
            $panel.addClass('raml-console-has-sidebar-fullscreen');
          }

          if ($scope.singleView) {
            $sidebar.toggleClass('raml-console-is-collapsed');
            $panel.toggleClass('raml-console-has-sidebar-collapsed');
          }
        };

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

        $scope.toggleRequestMetadata = function (enabled) {
          if ($scope.showRequestMetadata && !enabled) {
            $scope.showRequestMetadata = false;
          } else {
            $scope.showRequestMetadata = true;
          }
        };

        $scope.showResponseMetadata = true;

        $scope.toggleResponseMetadata = function () {
          $scope.showResponseMetadata = !$scope.showResponseMetadata;
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('sidebar', RAML.Directives.sidebar);
})();
