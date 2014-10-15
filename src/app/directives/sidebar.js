RAML.Directives.sidebar = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/sidebar.tpl.html',
    replace: true,
    controller: function ($scope) {
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

        apply();
      };

      function resolveSegementContexts(pathSegments, uriParameters) {
        var segmentContexts = [];

        pathSegments.forEach(function (element) {
          if (element.templated) {
            Object.keys(element.parameters).map(function (key) {
              var segment = {};
              segment[key] = uriParameters[key];
              segmentContexts.push(segment);
            });
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

      //// TOOD: Add an spinner to the response tab
      $scope.tryIt = function ($event) {
        var url;
        var context = $scope.context;
        var segmentContexts = resolveSegementContexts($scope.resource.pathSegments, $scope.uriParameters);

        $scope.requestEnd = false;
        $scope.toggleSidebar($event, true);
        $scope.toggleRequestMetadata($event, true);

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

        //// Fix Body
        if (context.bodyContent) {
          request.header('Content-Type', context.bodyContent.selected);
          request.data(context.bodyContent.data());
        }

        $scope.requestOptions = request.toOptions();
        // $scope.request.requestUrl = requestOptions.url;

        jQuery.ajax($scope.requestOptions).then(
          function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
          function(jqXhr) { handleResponse(jqXhr); }
        );
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

      $scope.toggleRequestMetadata = function ($event, enabled) {
        var $this = jQuery($event.currentTarget);
        var $btn = $this.closest('.sidebar-content-wrapper').find('.js-toggle-request-metadata');
        var $panel = $this.closest('.resource-panel');
        var $metadata = $panel.find('.sidebar-request-metadata');

        $metadata.toggleClass('is-active');

        if (!$metadata.hasClass('is-active') && !enabled) {
          $btn.removeClass('is-open');
          $btn.addClass('is-collapsed');
          $metadata.removeClass('is-active');
        } else {
          $btn.removeClass('is-collapsed');
          $btn.addClass('is-open');
          $metadata.addClass('is-active');
        }
      };
    }
  };
};

angular.module('RAML.Directives')
  .directive('sidebar', ['$window', RAML.Directives.sidebar]);
