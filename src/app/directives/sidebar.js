RAML.Directives.sidebar = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/sidebar.tpl.html',
    replace: true,
    link: function ($scope, $element) {
      var el = angular.element(angular.element($element.children().children()[0]).children()[2]);

      el.bind('scroll', function ($event) {
        var $el = $event.srcElement;

        if ($el.scrollHeight === $el.offsetHeight + $el.scrollTop) {
          $scope.showMoreEnable = false;
        } else {
          $scope.showMoreEnable = true;
        }

        $scope.$apply.apply($scope, null);
      });
    },
    controller: function ($scope, $element) {
      function completeAnimation (element) {
        jQuery(element).removeAttr('style');
      };

      function parseHeaders(headers) {
        var parsed = {}, key, val, i;

        if (!headers) {
          return parsed;
        }

        headers.split('\n').forEach(function(line) {
          i = line.indexOf(':');
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
      };

      function apply () {
        $scope.$apply.apply($scope, arguments);
      };

      function handleResponse(jqXhr) {
        $scope.response.body = jqXhr.responseText,
        $scope.response.status = jqXhr.status,
        $scope.response.headers = parseHeaders(jqXhr.getAllResponseHeaders());

        if ($scope.response.headers['content-type']) {
          $scope.response.contentType = $scope.response.headers['content-type'].split(';')[0];
        }

        $scope.requestEnd = true;
        $scope.showMoreEnable = true;
        $scope.showSpinner = false;

        $scope.editors.map(function (index) {
          var codeMirror = $scope.editors[index].CodeMirror;
          codeMirror.setOption('mode', $scope.response.contentType);
          setTimeout(function () {
            codeMirror.refresh();
          }, 1);
        });

        apply();
      };

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
      };

      $scope.clearFields = function () {
        $scope.uriParameters = {};
        $scope.context.queryParameters.clear();
        $scope.context.headers.clear();

        if ($scope.context.bodyContent) {
          $scope.context.bodyContent.definitions[$scope.context.bodyContent.selected].value = '';
        }
      };

      $scope.resetFields = function () {
        var uriParameters = $scope.resource.uriParametersForDocumentation;

        if (uriParameters) {
          Object.keys(uriParameters).map(function (key) {
            var param = uriParameters[key][0];
            $scope.uriParameters[param.displayName] = param['default'];
          });
        }

        $scope.context.queryParameters.reset($scope.methodInfo.queryParameters);
        $scope.context.headers.reset($scope.methodInfo.headers.plain);
      };

      $scope.resetQueryParam = function (queryParam) {
        $scope.context.queryParameters.reset($scope.methodInfo.queryParameters, queryParam[0].displayName);
      };

      $scope.resetHeader = function (header) {
        $scope.context.headers.reset($scope.methodInfo.headers.plain, header[0].displayName);
      };

      $scope.resetUriParameter = function (uriParam) {
        var uriParameters = $scope.resource.uriParametersForDocumentation;

        if (uriParameters) {
          Object.keys(uriParameters).filter(function (key) {
            return key === uriParam[0].displayName;
          }).map(function (key) {
            var param = uriParameters[key][0];
            $scope.uriParameters[param.displayName] = param['default'];
          });
        }
      };

      $scope.toggleBodyType = function ($event, bodyType) {
        var $this = jQuery($event.currentTarget);
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

      $scope.toggleSecurity = function ($event, schemaType, name) {
        var $this = jQuery($event.currentTarget);
        var $panel = $this.closest('.sidebar-toggle-group').find('button');

        $panel.removeClass('is-active');
        $this.addClass('is-active');
        $scope.currentScheme = {
          type: schemaType,
          name: name
        };
      };

      $scope.prefillBody = function (current) {
        var definition = $scope.context.bodyContent.definitions[current];
        definition.value = definition.contentType.example;
      };

      //// TODO: Scroll to request when make a try-it
      //// TODO: Add search plug-in for response body -> if greater than 1000 lines
      //// TODO: Show required errors!
      //// TODO: Add support for form-parameters
      //// TODO: Add an spinner for RAML loading
      //// TODO: Scroll to the current window when open a resource-method (display-name is optional :()
      //// TODO: Fix open/close resource
      //// TODO: Remove jQuery code as much as possible
      //// TODO: Make Fonts locals
      $scope.tryIt = function ($event) {
        var url;
        var context = $scope.context;
        var segmentContexts = resolveSegementContexts($scope.resource.pathSegments, $scope.uriParameters);

        $scope.showSpinner = true;
        $scope.toggleSidebar($event, true);
        $scope.toggleRequestMetadata($event, true);
        $scope.editors = jQuery($event.currentTarget).closest('.sidebar-content-wrapper').find('.CodeMirror');

        try {
          var pathBuilder = context.pathBuilder;
          var client = RAML.Client.create($scope.raml, function(client) {
            client.baseUriParameters(pathBuilder.baseUriContext);
          });
          url = client.baseUri + pathBuilder(segmentContexts);
        } catch (e) {
          $scope.response = {};
          return;
        }

        var request = RAML.Client.Request.create(url, $scope.methodInfo.method);

        if (!RAML.Utils.isEmpty(context.queryParameters.data())) {
          request.queryParams(context.queryParameters.data());
        }

        if (!RAML.Utils.isEmpty(context.headers.data())) {
          request.headers(context.headers.data());
        }

        if (context.bodyContent) {
          request.header('Content-Type', context.bodyContent.selected);
          request.data(context.bodyContent.data());
        }

        $scope.requestOptions = request.toOptions();

         var authStrategy;

        try {
          var securitySchemes = $scope.methodInfo.securitySchemes();

          var scheme = securitySchemes && securitySchemes[$scope.currentScheme.name];
          authStrategy = RAML.Client.AuthStrategies.for(scheme, $scope.credentials);
        } catch (e) {
          // custom strategies aren't supported yet.
        }

        authStrategy.authenticate().then(function(token) {
          token.sign(request);

          jQuery.ajax($scope.requestOptions).then(
            function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
            function(jqXhr) { handleResponse(jqXhr); }
          );
        });
      };

      $scope.toggleSidebar = function ($event, fullscreenEnable) {
        var $this = jQuery($event.currentTarget);
        var $panel = $this.closest('.resource-panel');
        var $sidebar = $panel.find('.sidebar');
        var $sidebarContent = $panel.find('.sidebar-content');
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
        var $this = jQuery($event.currentTarget);
        var $panel = $this.closest('.resource-panel');
        var $panelContent = $panel.find('.resource-panel-primary');
        var $sidebar = $panel.find('.sidebar');
        var $sidebarContent = $panel.find('.sidebar-content');

        if ($sidebar.hasClass('is-collapsed')) {
          $sidebar.velocity(
            { width: 430 },
            {
              duration: 200,
              complete: completeAnimation
            }
          );

          $panelContent.velocity(
            { "padding-left": 430 },
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
            { "padding-left": 0 },
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
  .directive('sidebar', ['$window', RAML.Directives.sidebar]);
