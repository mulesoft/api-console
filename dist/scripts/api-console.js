(function (window) {
  'use strict';

  // Namespaces
  RAML.Directives     = {};
  RAML.Services       = {};
  RAML.Filters        = {};
  RAML.Services.TryIt = {};
  RAML.Security       = {};
  RAML.Settings       = RAML.Settings || {};

  // Angular Modules
  angular.module('RAML.Directives', []);
  angular.module('RAML.Services', ['raml']);
  angular.module('RAML.Security', []);
  angular.module('ramlConsoleApp', ['RAML.Directives', 'RAML.Services', 'RAML.Security', 'hc.marked', 'ui.codemirror']);

  var renderer = new window.marked.Renderer();
  var loc      = window.location;
  var uri      = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/$/, '');

  // Marked Settings
  renderer.paragraph = function (text) {
    return text;
  };

  window.marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  });

  // Settings
  RAML.Settings.proxy             = RAML.Settings.proxy || false;
  RAML.Settings.oauth2RedirectUri = RAML.Settings.oauth2RedirectUri || uri + '/authentication/oauth2.html';
  RAML.Settings.oauth1RedirectUri = RAML.Settings.oauth1RedirectUri || uri + '/authentication/oauth1.html';
})(window);

(function () {
  'use strict';

  RAML.Directives.closeButton = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/close-button.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.close = function ($event) {
          var $this             = jQuery($event.currentTarget);
          var $inactiveElements = jQuery('.tab').add('.resource').add('li');
          var $resource         = $this.closest('.resource');
          var $resourceListItem = $resource.parent('li');

          $resourceListItem
            .children('.resource-panel')
            .velocity('slideUp');

          $inactiveElements.removeClass('is-active');
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('closeButton', RAML.Directives.closeButton);
})();

(function () {
  'use strict';

  RAML.Directives.documentation = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/documentation.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.toggleTab = function ($event) {
          var $this        = jQuery($event.currentTarget);
          var $eachTab     = $this.children('.toggle-tab');
          var $panel       = $this.closest('.resource-panel');
          var $eachContent = $panel.find('.resource-panel-content');

          $eachTab.toggleClass('is-active');
          $eachContent.toggleClass('is-active');
        };

        $scope.changeType = function ($event, type, code) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.resource-body-heading');
          var $eachContent = $panel.find('span');

          $eachContent.removeClass('isActive');
          $this.addClass('isActive');

          $scope.responseInfo[code].currentType = type;
        };

        $scope.showSchema = function ($event) {
          var $this   = jQuery($event.currentTarget);
          var $panel  = $this.closest('.resource-panel');
          var $schema = $panel.find('.resource-pre-toggle');

          $this.toggleClass('is-active');

          if (!$schema.hasClass('is-active')) {
            $schema
              .addClass('is-active')
              .velocity('slideDown');
          } else {
            $schema
              .removeClass('is-active')
              .velocity('slideUp');
          }
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('documentation', RAML.Directives.documentation);
})();

(function () {
  'use strict';

  RAML.Directives.methodList = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/method-list.tpl.html',
      replace: true,
      controller: function($scope) {
        function getResponseInfo() {
          var responseInfo = {};
          var responses    = $scope.methodInfo.responses;

          if (responses) {
            Object.keys(responses).map(function (key) {
              if(typeof responses[key].body !== 'undefined') {
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

        $scope.showResource = function ($event, $index) {
          var $this             = jQuery($event.currentTarget);
          var $inactiveElements = jQuery('.tab').add('.resource').add('li');
          var $resource         = $this.closest('.resource');
          var $resourceListItem = $resource.parent('li');
          var $closingEl;

          $scope.methodInfo          = $scope.resource.methods[$index];
          $scope.responseInfo        = getResponseInfo();
          $scope.context             = new RAML.Services.TryIt.Context($scope.resource, $scope.methodInfo);
          $scope.requestUrl          = '';
          $scope.response            = {};
          $scope.requestOptions      = {};
          $scope.resetFields();
          $scope.requestEnd          = false;
          $scope.showRequestMetadata = false;
          $scope.showMoreEnable      = true;
          $scope.showSpinner         = false;
          $scope.securitySchemes     = $scope.methodInfo.securitySchemes();
          $scope.credentials         = {};
          $scope.traits              = $scope.readTraits($scope.methodInfo.is);

          toUIModel($scope.methodInfo.queryParameters);
          toUIModel($scope.methodInfo.headers.plain);
          toUIModel($scope.resource.uriParametersForDocumentation);

          if ($scope.methodInfo.allowsAnonymousAccess()) {
            $scope.securitySchemes.anonymous = {
              type: 'Anonymous'
            };
          }

          var defaultScheme = Object.keys($scope.securitySchemes).sort()[0];
          $scope.currentScheme = {
            type: $scope.securitySchemes[defaultScheme].type,
            name: defaultScheme
          };

          // Hack for codemirror
          setTimeout(function () {
            var editors = jQuery('.sidebar-content-wrapper #sidebar-body .codemirror-body-editor .CodeMirror');

            editors.map(function (index) {
              var bodyEditor = editors[index].CodeMirror;

              if (bodyEditor && $scope.context.bodyContent) {
                bodyEditor.setOption('mode', $scope.context.bodyContent.selected);
                bodyEditor.refresh();
              }
            });
          }, 10);

          if (!$resource.hasClass('is-active')) {
            $closingEl = $inactiveElements
              .filter('.is-active')
              .children('.resource-panel');

            $closingEl.velocity('slideUp');

            $resourceListItem
              .children('.resource-panel')
              .velocity('slideDown');

            $inactiveElements.removeClass('is-active');

            $resource
              .add($resourceListItem)
              .add($this)
              .addClass('is-active');
          } else if (jQuery($this).hasClass('is-active')) {
            $resourceListItem.children('.resource-panel')
              .velocity('slideUp');
            $inactiveElements.removeClass('is-active');
          } else {
            jQuery($this).addClass('is-active');
            jQuery($this).siblings('.tab').removeClass('is-active');
          }
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('methodList', RAML.Directives.methodList);
})();

(function () {
  'use strict';

  RAML.Directives.ramlInitializer = function(ramlParserWrapper) {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-initializer.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.ramlLoaded = false;
        $scope.ramlUrl    = '';

        $scope.onKeyPressRamlUrl = function ($event) {
          if ($event.keyCode === 13) {
            $scope.loadFromUrl();
          }
        };

        $scope.loadFromUrl = function () {
          if ($scope.ramlUrl) {
            ramlParserWrapper.load($scope.ramlUrl);
            $scope.ramlLoaded = true;
          }
        };

        $scope.loadRaml = function() {
          if ($scope.raml) {
            ramlParserWrapper.parse($scope.raml);
            $scope.ramlLoaded = true;
          }
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlInitializer', RAML.Directives.ramlInitializer);
})();

(function () {
  'use strict';

  RAML.Directives.resourcePanel = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/resource-panel.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.uriParameters = {};
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('resourcePanel', RAML.Directives.resourcePanel);
})();

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
      controller: function ($scope) {
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

          $scope.editors.map(function (index) {
            var codeMirror = $scope.editors[index].CodeMirror;
            codeMirror.setOption('mode', $scope.response.contentType);
            setTimeout(function () {
              codeMirror.refresh();
            }, 1);
          });

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
          var errors = form.$error;
          Object.keys(form.$error).map(function (key) {
            for (var i = 0; i < errors[key].length; i++) {
              var fieldName = errors[key][i].$name;
              form[fieldName].$setViewValue(form[fieldName].$viewValue);
            }
          });
        }

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
              $scope.uriParameters[param.displayName] = param.example;
            });
          }

          $scope.context.queryParameters.reset($scope.methodInfo.queryParameters);
          $scope.context.headers.reset($scope.methodInfo.headers.plain);
        };

        $scope.resetQueryParam = function (queryParam) {
          $scope.context.queryParameters.reset($scope.methodInfo.queryParameters, queryParam[0].id);
        };

        $scope.resetHeader = function (header) {
          $scope.context.headers.reset($scope.methodInfo.headers.plain, header[0].id);
        };

        $scope.resetUriParameter = function (uriParam) {
          var uriParameters = $scope.resource.uriParametersForDocumentation;

          if (uriParameters) {
            Object.keys(uriParameters).filter(function (key) {
              return key === uriParam[0].displayName;
            }).map(function (key) {
              var param = uriParameters[key][0];
              $scope.uriParameters[param.displayName] = param.example;
            });
          }
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

        $scope.toggleSecurity = function ($event, schemaType, name) {
          var $this  = jQuery($event.currentTarget);
          var $panel = $this.closest('.sidebar-toggle-group').find('button');

          $panel.removeClass('is-active');
          $this.addClass('is-active');
          $scope.currentScheme = {
            type: schemaType,
            name: name
          };
        };

        $scope.prefillBody = function (current) {
          var definition   = $scope.context.bodyContent.definitions[current];
          definition.value = definition.contentType.example;
        };

        $scope.hasExampleValue = function (value) {
          return typeof value !== 'undefined' ? true : false;
        };

        $scope.tryIt = function ($event) {
          var url;
          var context         = $scope.context;
          var segmentContexts = resolveSegementContexts($scope.resource.pathSegments, $scope.uriParameters);

          validateForm($scope.form);

          $scope.showSpinner = true;
          $scope.toggleSidebar($event, true);
          $scope.toggleRequestMetadata($event, true);
          $scope.editors     = jQuery($event.currentTarget).closest('.sidebar-content-wrapper').find('.CodeMirror');

          try {
            var pathBuilder = context.pathBuilder;
            var client      = RAML.Client.create($scope.raml, function(client) {
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
            var scheme          = securitySchemes && securitySchemes[$scope.currentScheme.name];

            /* jshint es5: true */
            authStrategy = RAML.Client.AuthStrategies.for(scheme, $scope.credentials);
            /* jshint es5: false */
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

(function () {
  'use strict';

  RAML.Directives.spinner = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/spinner.tpl.html',
      replace: true,
      link: function($scope, $element) {
        $scope.$on('loading-started', function() {
          $element.css({ 'display': ''});
        });

        $scope.$on('loading-complete', function() {
          $element.css({ 'display': 'none' });
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('spinner', RAML.Directives.spinner);
})();

(function () {
  'use strict';

  RAML.Directives.theme = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/theme-switcher.tpl.html',
      replace: true,
      link: function($scope, $element) {
        $element.on('click', function() {
          var $link = jQuery('head link.theme');
          var theme = $link.attr('href');

          $link.attr('href', 'styles/light-theme.css');
          $element.removeClass('theme-toggle-dark');

          if (theme === 'styles/light-theme.css') {
            $link.attr('href', 'styles/dark-theme.css');
            $element.addClass('theme-toggle-dark');
          }
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('themeSwitcher', RAML.Directives.theme);
})();

(function () {
  'use strict';

  angular.module('raml', [])
    .factory('ramlParser', function () {
      return RAML.Parser;
    });
})();

(function () {
  'use strict';

  RAML.Directives.resourceType = function() {
    return {
      restrict: 'E',
      templateUrl: 'resources/resource-type.tpl.html',
      replace: true,
      controller: function ($scope) {
        var resourceType = $scope.resource.resourceType;

        if (typeof resourceType === 'object') {
          $scope.resource.resourceType = Object.keys(resourceType).join();
        }
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('resourceType', RAML.Directives.resourceType);
})();

(function () {
  'use strict';

  RAML.Directives.resources = function(ramlParserWrapper) {
    return {
      restrict: 'E',
      templateUrl: 'resources/resources.tpl.html',
      replace: true,
      scope: {
        src: '@'
      },
      controller: function($scope, $window, $attrs) {
        $scope.proxy = $window.RAML.Settings.proxy;

        if ($attrs.hasOwnProperty('withTryItOnFullscreen')) {
          $scope.withTryItOnFullscreen = true;
        }

        if ($attrs.hasOwnProperty('disableThemeSwitcher')) {
          $scope.disableThemeSwitcher = true;
        }

        if ($scope.src) {
          ramlParserWrapper.load($scope.src);
        }

        $scope.updateProxyConfig = function (status) {
          $window.RAML.Settings.disableProxy = status;
        };

        $scope.toggle = function ($event) {
          var $this    = jQuery($event.currentTarget);
          var $section = $this
            .closest('.resource-list-item')
            .find('.resource-list');

          if ($section.hasClass('is-collapsed')) {
            $section.velocity('slideDown', {
              duration: 200
            });
          } else {
            $section.velocity('slideUp', {
              duration: 200
            });
          }

          $section.toggleClass('is-collapsed');
          $this.toggleClass('is-active');
        };
      },
      link: function($scope) {
        $scope.loaded     = false;
        $scope.parseError = null;

        ramlParserWrapper.onParseSuccess(function(raml) {
          $scope.raml = RAML.Inspector.create(raml);
          $scope.parseError = null;
          $scope.loaded = true;
        });

        ramlParserWrapper.onParseError(function(error) {
          /*jshint camelcase: false */
          var context = error.context_mark || error.problem_mark;
          /*jshint camelcase: true */
          $scope.parseError = { message: error.message };

          if (context) {
            /*jshint camelcase: false */
            var snippet = context.get_snippet(0, 10000).replace('^', '').trim();
            /*jshint camelcase: true */

            $scope.cmModel = context.buffer;

            $scope.parseError = {
              column: context.column + 1,
              line: context.line + 1,
              message: error.message,
              snippet: snippet,
              raml: context.buffer,
              fileName: context.name
            };

            // Hack to update codemirror
            setTimeout(function () {
              var editor = jQuery('.error-codemirror-container .CodeMirror')[0].CodeMirror;
              editor.doc.addLineClass(context.line, 'background', 'line-error');
              editor.doc.setCursor(context.line);
            }, 10);
          }

          $scope.$apply.apply($scope, null);
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlConsole', RAML.Directives.resources);
})();

(function () {
  'use strict';

  RAML.Security.basicAuth = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/basic_auth.tpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };

  angular.module('RAML.Security')
    .directive('basicAuth', RAML.Security.basicAuth);
})();

(function () {
  'use strict';

  RAML.Security.oauth1 = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/oauth1.tpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };

  angular.module('RAML.Security')
    .directive('oauth1', RAML.Security.oauth1);
})();

(function () {
  'use strict';

  RAML.Security.oauth2 = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/oauth2.tpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };

  angular.module('RAML.Security')
    .directive('oauth2', RAML.Security.oauth2);
})();

(function () {
  'use strict';

  RAML.Services.RAMLParserWrapper = function($rootScope, ramlParser, $q) {
    var ramlProcessor, errorProcessor, whenParsed, PARSE_SUCCESS = 'event:raml-parsed';

    var load = function(file) {
      setPromise(ramlParser.loadFile(file));
    };

    var parse = function(raml) {
      setPromise(ramlParser.load(raml));
    };

    var onParseSuccess = function(cb) {
      ramlProcessor = function() {
        cb.apply(this, arguments);
        if (!$rootScope.$$phase) {
          // handle aggressive digesters!
          $rootScope.$digest();
        }
      };

      if (whenParsed) {
        whenParsed.then(ramlProcessor);
      }
    };

    var onParseError = function(cb) {
      errorProcessor = function() {
        cb.apply(this, arguments);
        if (!$rootScope.$$phase) {
          // handle aggressive digesters!
          $rootScope.$digest();
        }
      };

      if (whenParsed) {
        whenParsed.then(undefined, errorProcessor);
      }

    };

    var setPromise = function(promise) {
      whenParsed = promise;

      if (ramlProcessor || errorProcessor) {
        whenParsed.then(ramlProcessor, errorProcessor);
      }
    };

    $rootScope.$on(PARSE_SUCCESS, function(e, raml) {
      setPromise($q.when(raml));
    });

    return {
      load: load,
      parse: parse,
      onParseSuccess: onParseSuccess,
      onParseError: onParseError
    };
  };

  angular.module('RAML.Services')
    .service('ramlParserWrapper', RAML.Services.RAMLParserWrapper);
})();

'use strict';

(function() {
  var Client = function(configuration) {
    this.baseUri = configuration.getBaseUri();
  };

  function createConfiguration(parsed) {
    var config = {
      baseUriParameters: {}
    };

    return {
      baseUriParameters: function(baseUriParameters) {
        config.baseUriParameters = baseUriParameters || {};
      },

      getBaseUri: function() {
        var template = RAML.Client.createBaseUri(parsed);
        config.baseUriParameters.version = parsed.version;

        return template.render(config.baseUriParameters);
      }
    };
  }

  RAML.Client = {
    create: function(parsed, configure) {
      var configuration = createConfiguration(parsed);

      if (configure) {
        configure(configuration);
      }

      return new Client(configuration);
    },

    createBaseUri: function(rootRAML) {
      var baseUri = rootRAML.baseUri.toString().replace(/\/+$/, '');

      return new RAML.Client.ParameterizedString(baseUri, rootRAML.baseUriParameters, { parameterValues: {version: rootRAML.version} });
    },

    createPathSegment: function(resourceRAML) {
      return new RAML.Client.ParameterizedString(resourceRAML.relativeUri, resourceRAML.uriParameters);
    }
  };
})();

(function() {
  'use strict';

  /* jshint es5: true */
  RAML.Client.AuthStrategies = {
    for: function(scheme, credentials) {
      if (!scheme) {
        return RAML.Client.AuthStrategies.anonymous();
      }

      switch(scheme.type) {
      case 'Basic Authentication':
        return new RAML.Client.AuthStrategies.Basic(scheme, credentials);
      case 'OAuth 2.0':
        return new RAML.Client.AuthStrategies.Oauth2(scheme, credentials);
      case 'OAuth 1.0':
        return new RAML.Client.AuthStrategies.Oauth1(scheme, credentials);
      default:
        throw new Error('Unknown authentication strategy: ' + scheme.type);
      }
    }
  };
  /* jshint es5: false */
})();

'use strict';

(function() {
  var NO_OP_TOKEN = {
    sign: function() {}
  };

  var Anonymous = function() {};

  Anonymous.prototype.authenticate = function() {
    return {
      then: function(success) { success(NO_OP_TOKEN); }
    };
  };

  var anonymous = new Anonymous();

  RAML.Client.AuthStrategies.Anonymous = Anonymous;
  RAML.Client.AuthStrategies.anonymous = function() {
    return anonymous;
  };
})();

'use strict';

(function() {
  var Basic = function(scheme, credentials) {
    this.token = new Basic.Token(credentials);
  };

  Basic.prototype.authenticate = function() {
    var token = this.token;

    return {
      then: function(success) { success(token); }
    };
  };

  Basic.Token = function(credentials) {
    var words = CryptoJS.enc.Utf8.parse(credentials.username + ':' + credentials.password);
    this.encoded = CryptoJS.enc.Base64.stringify(words);
  };

  Basic.Token.prototype.sign = function(request) {
    request.header('Authorization', 'Basic ' + this.encoded);
  };

  RAML.Client.AuthStrategies.Basic = Basic;
})();

(function() {
  'use strict';

  var Oauth1 = function(scheme, credentials) {
    var signerFactory = RAML.Client.AuthStrategies.Oauth1.Signer.createFactory(scheme.settings, credentials);
    this.requestTemporaryCredentials = RAML.Client.AuthStrategies.Oauth1.requestTemporaryCredentials(scheme.settings, signerFactory);
    this.requestAuthorization = RAML.Client.AuthStrategies.Oauth1.requestAuthorization(scheme.settings);
    this.requestTokenCredentials = RAML.Client.AuthStrategies.Oauth1.requestTokenCredentials(scheme.settings, signerFactory);
  };

  Oauth1.parseUrlEncodedData = function(data) {
    var result = {};

    data.split('&').forEach(function(param) {
      var keyAndValue = param.split('=');
      result[keyAndValue[0]] = keyAndValue[1];
    });

    return result;
  };

  Oauth1.prototype.authenticate = function() {
    return this.requestTemporaryCredentials().then(this.requestAuthorization).then(this.requestTokenCredentials);
  };

  RAML.Client.AuthStrategies.Oauth1 = Oauth1;
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  var WINDOW_NAME = 'raml-console-oauth1';

  RAML.Client.AuthStrategies.Oauth1.requestAuthorization = function(settings) {
    return function requestAuthorization(temporaryCredentials) {
      var authorizationUrl = settings.authorizationUri + '?oauth_token=' + temporaryCredentials.token,
      deferred = jQuery.Deferred();

      window.RAML.authorizationSuccess = function(authResult) {
        temporaryCredentials.verifier = authResult.verifier;
        deferred.resolve(temporaryCredentials);
      };
      window.open(authorizationUrl, WINDOW_NAME);
      return deferred.promise();
    };
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth1.requestTemporaryCredentials = function(settings, signerFactory) {
    return function requestTemporaryCredentials() {
      var request = RAML.Client.Request.create(settings.requestTokenUri, 'post');

      signerFactory().sign(request);

      return jQuery.ajax(request.toOptions()).then(function(rawFormData) {
        var data = RAML.Client.AuthStrategies.Oauth1.parseUrlEncodedData(rawFormData);

        return {
          token: data.oauth_token,
          tokenSecret: data.oauth_token_secret
        };
      });
    };
  };

})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth1.requestTokenCredentials = function(settings, signerFactory) {
    return function requestTokenCredentials(temporaryCredentials) {
      var request = RAML.Client.Request.create(settings.tokenCredentialsUri, 'post');

      signerFactory(temporaryCredentials).sign(request);

      return jQuery.ajax(request.toOptions()).then(function(rawFormData) {
        var credentials = RAML.Client.AuthStrategies.Oauth1.parseUrlEncodedData(rawFormData);

        return signerFactory({
          token: credentials.oauth_token,
          tokenSecret: credentials.oauth_token_secret
        });
      });
    };
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  var Signer = RAML.Client.AuthStrategies.Oauth1.Signer = {};

  Signer.createFactory = function(settings, consumerCredentials) {
    settings = settings || {};

    return function createSigner(tokenCredentials) {
      var type = settings.signatureMethod === 'PLAINTEXT' ? 'Plaintext' : 'Hmac';
      var mode = tokenCredentials === undefined ? 'Temporary' : 'Token';

      return new Signer[type][mode](consumerCredentials, tokenCredentials);
    };
  };

  function baseParameters(consumerCredentials) {
    return {
      oauth_consumer_key: consumerCredentials.consumerKey,
      oauth_version: '1.0'
    };
  }

  Signer.generateTemporaryCredentialParameters = function(consumerCredentials) {
    var result = baseParameters(consumerCredentials);
    result.oauth_callback = RAML.Settings.oauth1RedirectUri;

    return result;
  };

  Signer.generateTokenCredentialParameters = function(consumerCredentials, tokenCredentials) {
    var result = baseParameters(consumerCredentials);

    result.oauth_token = tokenCredentials.token;
    if (tokenCredentials.verifier) {
      result.oauth_verifier = tokenCredentials.verifier;
    }

    return result;
  };

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  Signer.rfc3986Encode = function(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, window.escape).replace(/\*/g, '%2A');
  };

  Signer.setRequestHeader = function(params, request) {
    var header = Object.keys(params).map(function(key) {
      return key + '="' + Signer.rfc3986Encode(params[key]) + '"';
    }).join(', ');

    request.header('Authorization', 'OAuth ' + header);
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  var generateTemporaryCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Signer.generateTemporaryCredentialParameters,
      generateTokenCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Signer.generateTokenCredentialParameters,
      rfc3986Encode = RAML.Client.AuthStrategies.Oauth1.Signer.rfc3986Encode,
      setRequestHeader = RAML.Client.AuthStrategies.Oauth1.Signer.setRequestHeader;

  function generateSignature(params, request, key) {
    params.oauth_signature_method = 'HMAC-SHA1';
    params.oauth_timestamp = Math.floor(Date.now() / 1000);
    params.oauth_nonce = CryptoJS.lib.WordArray.random(16).toString();

    var data = Hmac.constructHmacText(request, params);
    var hash = CryptoJS.HmacSHA1(data, key);
    params.oauth_signature = hash.toString(CryptoJS.enc.Base64);
  }

  var Hmac = {
    constructHmacText: function(request, oauthParams) {
      var options = request.toOptions();

      return [
        options.type.toUpperCase(),
        this.encodeURI(options.url),
        rfc3986Encode(this.encodeParameters(request, oauthParams))
      ].join('&');
    },

    encodeURI: function(uri) {
      var parser = document.createElement('a');
      parser.href = uri;

      var hostname = '';
      if (parser.protocol === 'https:' && parser.port === 443 || parser.protocol === 'http:' && parser.port === 80) {
        hostname = parser.hostname.toLowerCase();
      } else {
        hostname = parser.host.toLowerCase();
      }

      return rfc3986Encode(parser.protocol + '//' + hostname + parser.pathname);
    },

    encodeParameters: function(request, oauthParameters) {
      var params = request.queryParams();
      var formParams = {};
      if (request.toOptions().contentType === 'application/x-www-form-urlencoded') {
        formParams = request.data();
      }

      var result = [];
      for (var key in params) {
        result.push([rfc3986Encode(key), rfc3986Encode(params[key])]);
      }

      for (var formKey in formParams) {
        result.push([rfc3986Encode(formKey), rfc3986Encode(formParams[formKey])]);
      }

      for (var oauthKey in oauthParameters) {
        result.push([rfc3986Encode(oauthKey), rfc3986Encode(oauthParameters[oauthKey])]);
      }

      result.sort(function(a, b) {
        return (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]));
      });

      return result.map(function(tuple) { return tuple.join('='); }).join('&');
    }
  };

  Hmac.Temporary = function(consumerCredentials) {
    this.consumerCredentials = consumerCredentials;
  };

  Hmac.Temporary.prototype.sign = function(request) {
    var params = generateTemporaryCredentialParameters(this.consumerCredentials);
    var key = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&';

    generateSignature(params, request, key);
    setRequestHeader(params, request);
  };

  Hmac.Token = function(consumerCredentials, tokenCredentials) {
    this.consumerCredentials = consumerCredentials;
    this.tokenCredentials = tokenCredentials;
  };

  Hmac.Token.prototype.sign = function(request) {
    var params = generateTokenCredentialParameters(this.consumerCredentials, this.tokenCredentials);
    var key = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&' + rfc3986Encode(this.tokenCredentials.tokenSecret);

    generateSignature(params, request, key);
    setRequestHeader(params, request);
  };

  RAML.Client.AuthStrategies.Oauth1.Signer.Hmac = Hmac;
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  var generateTemporaryCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Signer.generateTemporaryCredentialParameters,
      generateTokenCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Signer.generateTokenCredentialParameters,
      rfc3986Encode = RAML.Client.AuthStrategies.Oauth1.Signer.rfc3986Encode,
      setRequestHeader = RAML.Client.AuthStrategies.Oauth1.Signer.setRequestHeader;

  var Plaintext = {};

  Plaintext.Temporary = function(consumerCredentials) {
    this.consumerCredentials = consumerCredentials;
  };

  Plaintext.Temporary.prototype.sign = function(request) {
    var params = generateTemporaryCredentialParameters(this.consumerCredentials);
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&';
    params.oauth_signature_method = 'PLAINTEXT';

    setRequestHeader(params, request);
  };

  Plaintext.Token = function(consumerCredentials, tokenCredentials) {
    this.consumerCredentials = consumerCredentials;
    this.tokenCredentials = tokenCredentials;
  };

  Plaintext.Token.prototype.sign = function(request) {
    var params = generateTokenCredentialParameters(this.consumerCredentials, this.tokenCredentials);
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&' + rfc3986Encode(this.tokenCredentials.tokenSecret);
    params.oauth_signature_method = 'PLAINTEXT';

    setRequestHeader(params, request);
  };

  RAML.Client.AuthStrategies.Oauth1.Signer.Plaintext = Plaintext;
})();

(function() {
  'use strict';

  var Oauth2 = function(scheme, credentials) {
    this.grant = RAML.Client.AuthStrategies.Oauth2.Grant.create(scheme.settings, credentials);
    this.tokenFactory = RAML.Client.AuthStrategies.Oauth2.Token.createFactory(scheme);
  };

  Oauth2.prototype.authenticate = function() {
    return this.grant.request().then(Oauth2.createToken(this.tokenFactory));
  };

  RAML.Client.AuthStrategies.Oauth2 = Oauth2;
})();

(function() {
  'use strict';

  RAML.Client.AuthStrategies.Oauth2.createToken = function(tokenFactory) {
    return function(token) {
      return tokenFactory(token);
    };
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth2.credentialsManager = function(credentials, responseType) {
    return {
      authorizationUrl : function(baseUrl) {
        return baseUrl +
          '?client_id=' + credentials.clientId +
          '&response_type=' + responseType +
          '&redirect_uri=' + RAML.Settings.oauth2RedirectUri;
      },

      accessTokenParameters: function(code) {
        return {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: RAML.Settings.oauth2RedirectUri
        };
      }
    };
  };
})();

(function() {
  'use strict';

  var GRANTS = [ 'code', 'token' ], IMPLICIT_GRANT = 'token';
  var Oauth2 = RAML.Client.AuthStrategies.Oauth2;

  function grantTypeFrom(settings) {
    var authorizationGrants = settings.authorizationGrants || [];
    var filtered = authorizationGrants.filter(function(grant) { return grant === IMPLICIT_GRANT; });
    var specifiedGrant = filtered[0] || authorizationGrants[0];

    if (!GRANTS.some(function(grant) { return grant === specifiedGrant; })) {
      throw new Error('Unknown grant type: ' + specifiedGrant);
    }

    return specifiedGrant;
  }

  var Grant = {
    create: function(settings, credentials) {
      var type = grantTypeFrom(settings);
      var credentialsManager = Oauth2.credentialsManager(credentials, type);

      var className = type.charAt(0).toUpperCase() + type.slice(1);
      return new this[className](settings, credentialsManager);
    }
  };

  Grant.Code = function(settings, credentialsManager) {
    this.settings = settings;
    this.credentialsManager = credentialsManager;
  };

  Grant.Code.prototype.request = function() {
    var requestAuthorization = Oauth2.requestAuthorization(this.settings, this.credentialsManager);
    var requestAccessToken = Oauth2.requestAccessToken(this.settings, this.credentialsManager);

    return requestAuthorization.then(requestAccessToken);
  };

  Grant.Token = function(settings, credentialsManager) {
    this.settings = settings;
    this.credentialsManager = credentialsManager;
  };

  Grant.Token.prototype.request = function() {
    return Oauth2.requestAuthorization(this.settings, this.credentialsManager);
  };

  Oauth2.Grant = Grant;
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  function accessTokenFromObject(data) {
    return data.access_token;
  }

  function accessTokenFromString(data) {
    var vars = data.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === 'access_token') {
        return decodeURIComponent(pair[1]);
      }
    }

    return undefined;
  }

  RAML.Client.AuthStrategies.Oauth2.requestAccessToken = function(settings, credentialsManager) {
    return function(code) {
      var request = RAML.Client.Request.create(settings.accessTokenUri, 'post');

      request.data(credentialsManager.accessTokenParameters(code));

      return jQuery.ajax(request.toOptions()).then(function(data) {
        var extract = accessTokenFromString;

        if (typeof data === 'object') {
          extract = accessTokenFromObject;
        }

        return extract(data);
      });
    };
  };
})();

(function() {
  'use strict';

  var WINDOW_NAME = 'raml-console-oauth2';

  RAML.Client.AuthStrategies.Oauth2.requestAuthorization = function(settings, credentialsManager) {
    var authorizationUrl = credentialsManager.authorizationUrl(settings.authorizationUri),
        deferred = jQuery.Deferred();

    window.RAML.authorizationSuccess = function(code) { deferred.resolve(code); };
    window.open(authorizationUrl, WINDOW_NAME);
    return deferred.promise();
  };
})();

(function() {
  /* jshint camelcase: false */
  'use strict';

  function tokenConstructorFor(scheme) {
    var describedBy = scheme.describedBy || {},
        headers = describedBy.headers || {},
        queryParameters = describedBy.queryParameters || {};

    if (headers.Authorization) {
      return Header;
    }

    if (queryParameters.access_token) {
      return QueryParameter;
    }

    return Header;
  }

  var Header = function(accessToken) {
    this.accessToken = accessToken;
  };

  Header.prototype.sign = function(request) {
    request.header('Authorization', 'Bearer ' + this.accessToken);
  };

  var QueryParameter = function(accessToken) {
    this.accessToken = accessToken;
  };

  QueryParameter.prototype.sign = function(request) {
    request.queryParam('access_token', this.accessToken);
  };

  RAML.Client.AuthStrategies.Oauth2.Token = {
    createFactory: function(scheme) {
      var TokenConstructor = tokenConstructorFor(scheme);

      return function createToken(value) {
        return new TokenConstructor(value);
      };
    }
  };
})();

(function() {
  'use strict';

  var templateMatcher = /\{([^}]*)\}/g;

  function tokenize(template) {
    var tokens = template.split(templateMatcher);

    return tokens.filter(function(token) {
      return token.length > 0;
    });
  }

  function rendererFor(template, uriParameters) {
    var requiredParameters = Object.keys(uriParameters || {}).filter(function(name) {
      return uriParameters[name].required;
    });

    return function renderer(context) {
      context = context || {};

      requiredParameters.forEach(function(name) {
        if (!context[name]) {
          throw new Error('Missing required uri parameter: ' + name);
        }
      });

      var templated = template.replace(templateMatcher, function(match, parameterName) {
        return context[parameterName] || '';
      });

      return templated;
    };
  }

  RAML.Client.ParameterizedString = function(template, uriParameters, options) {
    options = options || {parameterValues: {} };
    template = template.replace(templateMatcher, function(match, parameterName) {
      if (options.parameterValues[parameterName]) {
        return options.parameterValues[parameterName];
      }
      return '{' + parameterName + '}';
    });

    this.parameters = uriParameters;
    this.templated = Object.keys(this.parameters || {}).length > 0;
    this.tokens = tokenize(template);
    this.render = rendererFor(template, uriParameters);
    this.toString = function() { return template; };
  };
})();

(function() {
  'use strict';

  RAML.Client.PathBuilder = {
    create: function(pathSegments) {
      return function pathBuilder(contexts) {
        contexts = contexts || [];

        return pathSegments.map(function(pathSegment, index) {
          return pathSegment.render(contexts[index]);
        }).join('');
      };
    }
  };
})();

(function() {
  'use strict';

  var CONTENT_TYPE = 'content-type';
  var FORM_DATA = 'multipart/form-data';

  var RequestDsl = function(options) {
    var rawData;
    var queryParams;
    var isMultipartRequest;

    this.data = function(data) {
      if (data === undefined) {
        return RAML.Utils.clone(rawData);
      } else {
        rawData = data;
      }
    };

    this.queryParams = function(parameters) {
      if (parameters === undefined) {
        return RAML.Utils.clone(queryParams);
      } else {
        queryParams = parameters;
      }
    };

    this.queryParam = function(name, value) {
      queryParams = queryParams || {};
      queryParams[name] = value;
    };

    this.header = function(name, value) {
      options.headers = options.headers || {};

      if (name.toLowerCase() === CONTENT_TYPE) {
        if (value === FORM_DATA) {
          isMultipartRequest = true;
          return;
        } else {
          isMultipartRequest = false;
          options.contentType = value;
        }
      }

      options.headers[name] = value;
    };

    this.headers = function(headers) {
      options.headers = {};
      isMultipartRequest = false;
      options.contentType = false;

      for (var name in headers) {
        this.header(name, headers[name]);
      }
    };

    this.toOptions = function() {
      var o = RAML.Utils.copy(options);
      o.traditional = true;

      if (rawData) {
        if (isMultipartRequest) {
          var data = new FormData();

          var appendValueForKey = function(key) {
            return function(value) {
              data.append(key, value);
            };
          };

          for (var key in rawData) {
            rawData[key].forEach(appendValueForKey(key));
          }

          o.processData = false;
          o.data = data;
        } else {
          o.processData = true;
          o.data = rawData;
        }
      }

      if (!RAML.Utils.isEmpty(queryParams)) {
        var separator = (options.url.match('\\?') ? '&' : '?');
        o.url = options.url + separator + jQuery.param(queryParams, true);
      }

      if (!RAML.Settings.disableProxy && RAML.Settings.proxy) {
        o.url = RAML.Settings.proxy + o.url;
      }

      return o;
    };
  };

  RAML.Client.Request = {
    create: function(url, method) {
      return new RequestDsl({ url: url, type: method, contentType: false });
    }
  };
})();

(function() {
  'use strict';

  // number regular expressions from http://yaml.org/spec/1.2/spec.html#id2804092

  var RFC1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;

  function isEmpty(value) {
    return value === null || value === undefined || value === '';
  }

  var VALIDATIONS = {
    required: function(value) { return !isEmpty(value); },
    boolean: function(value) { return isEmpty(value) || value === 'true' || value === 'false'; },
    enum: function(enumeration) {
      return function(value) {
        return isEmpty(value) || enumeration.some(function(item) { return item === value; });
      };
    },
    integer: function(value) { return isEmpty(value) || !!/^-?(0|[1-9][0-9]*)$/.exec(value); },
    number: function(value) { return isEmpty(value) || !!/^-?(0|[1-9][0-9]*)(\.[0-9]*)?([eE][-+]?[0-9]+)?$/.exec(value); },
    minimum: function(minimum) {
      return function(value) {
        return isEmpty(value) || value >= minimum;
      };
    },
    maximum: function(maximum) {
      return function(value) {
        return isEmpty(value) || value <= maximum;
      };
    },
    minLength: function(minimum) {
      return function(value) {
        return isEmpty(value) || value.length >= minimum;
      };
    },
    maxLength: function(maximum) {
      return function(value) {
        return isEmpty(value) || value.length <= maximum;
      };
    },
    pattern: function(pattern) {
      var regex = new RegExp(pattern);

      return function(value) {
        return isEmpty(value) || !!regex.exec(value);
      };
    },
    date: function(value) { return isEmpty(value) || !!RFC1123.exec(value); }
  };

  function baseValidations(definition) {
    var validations = {};

    if (definition.required) {
      validations.required = VALIDATIONS.required;
    }

    return validations;
  }

  function numberValidations(validations, definition) {
    if (definition.minimum) {
      validations.minimum = VALIDATIONS.minimum(definition.minimum);
    }

    if (definition.maximum) {
      validations.maximum = VALIDATIONS.maximum(definition.maximum);
    }
  }

  // function copyValidations(validations, types) {
  //   Object.keys(types).forEach(function(type) {
  //     validations[type] = VALIDATIONS[type](types[type]);
  //   });
  // }

  var VALIDATIONS_FOR_TYPE = {
    string: function(definition) {
      var validations = baseValidations(definition);
      if (definition.enum) {
        validations.enum = VALIDATIONS.enum(definition.enum);
      }
      if (definition.minLength) {
        validations.minLength = VALIDATIONS.minLength(definition.minLength);
      }
      if (definition.maxLength) {
        validations.maxLength = VALIDATIONS.maxLength(definition.maxLength);
      }
      if (definition.pattern) {
        validations.pattern = VALIDATIONS.pattern(definition.pattern);
      }
      return validations;
    },

    integer: function(definition) {
      var validations = baseValidations(definition);
      validations.integer = VALIDATIONS.integer;
      numberValidations(validations, definition);
      return validations;
    },

    number: function(definition) {
      var validations = baseValidations(definition);
      validations.number = VALIDATIONS.number;
      numberValidations(validations, definition);
      return validations;
    },

    boolean: function(definition) {
      var validations = baseValidations(definition);
      validations.boolean = VALIDATIONS.boolean;
      return validations;
    },

    date: function(definition) {
      var validations = baseValidations(definition);
      validations.date = VALIDATIONS.date;
      return validations;
    }
  };

  function Validator(validations) {
    this.validations = validations;
  }

  Validator.prototype.validate = function(value) {
    var errors;

    for (var validation in this.validations) {
      if (!this.validations[validation](value)) {
        errors = errors || [];
        errors.push(validation);
      }
    }

    return errors;
  };

  Validator.from = function(definition) {
    if (!definition) {
      throw new Error('definition is required!');
    }

    var validations;

    if (VALIDATIONS_FOR_TYPE[definition.type]) {
      validations = VALIDATIONS_FOR_TYPE[definition.type](definition);
    } else {
      validations = {};
    }

    return new Validator(validations);
  };

  RAML.Client.Validator = Validator;
})();

(function() {
  'use strict';

  RAML.Filters.nameFromParameterizable = function() {
    return function(input) {
      if (typeof input === 'object' && input !== null) {
        return Object.keys(input)[0];
      } else if (input) {
        return input;
      } else {
        return undefined;
      }
    };
  };
})();

RAML.Inspector = (function() {
  'use strict';

  var exports = {};

  var METHOD_ORDERING = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];

  function extractResources(basePathSegments, api, securitySchemes) {
    var resources = [], apiResources = api.resources || [];

    apiResources.forEach(function(resource) {
      var resourcePathSegments = basePathSegments.concat(RAML.Client.createPathSegment(resource));
      var overview = exports.resourceOverviewSource(resourcePathSegments, resource);

      overview.methods = overview.methods.map(function(method) {
        return RAML.Inspector.Method.create(method, securitySchemes);
      });


      resources.push(overview);

      if (resource.resources) {
        var extracted = extractResources(resourcePathSegments, resource, securitySchemes);
        extracted.forEach(function(resource) {
          resources.push(resource);
        });
      }
    });

    return resources;
  }

  function groupResources(resources) {
    var currentPrefix, resourceGroups = [];

    (resources || []).forEach(function(resource) {
      var prefix = resource.pathSegments[0].toString();
      if (prefix === currentPrefix || prefix.indexOf(currentPrefix + '/') === 0) {
        resourceGroups[resourceGroups.length-1].push(resource);
      } else {
        currentPrefix = resource.pathSegments[0].toString();
        resourceGroups.push([resource]);
      }
    });

    return resourceGroups;
  }

  exports.resourceOverviewSource = function(pathSegments, resource) {
    var clone = RAML.Utils.clone(resource);

    clone.traits = resource.is;
    clone.resourceType = resource.type;
    clone.type = clone.is = undefined;
    clone.pathSegments = pathSegments;

    clone.methods = (resource.methods || []);

    clone.methods.sort(function(a, b) {
      var aOrder = METHOD_ORDERING.indexOf(a.method.toUpperCase());
      var bOrder = METHOD_ORDERING.indexOf(b.method.toUpperCase());

      return aOrder > bOrder ? 1 : -1;
    });

    clone.uriParametersForDocumentation = pathSegments
      .map(function(segment) { return segment.parameters; })
      .filter(function(params) { return !!params; })
      .reduce(function(accum, parameters) {
        for (var key in parameters) {
          var parameter = parameters[key];
          if (parameter) {
            parameter = (parameter instanceof Array) ? parameter : [ parameter ];
          }
          accum[key] = parameter;
        }
        return accum;
      }, {});

    if (Object.keys(clone.uriParametersForDocumentation).length === 0) {
      clone.uriParametersForDocumentation = null;
    }

    clone.toString = function() {
      return this.pathSegments.map(function(segment) { return segment.toString(); }).join('');
    };

    return clone;
  };

  exports.create = function(api) {
    if (api.baseUri) {
      api.baseUri = RAML.Client.createBaseUri(api);
    }

    api.resources = extractResources([], api, api.securitySchemes);
    api.resourceGroups = groupResources(api.resources);

    return api;
  };

  return exports;
})();

(function() {
  'use strict';

  var PARAMETER = /\{\*\}/;

  function ensureArray(value) {
    if (value === undefined || value === null) {
      return;
    }

    return (value instanceof Array) ? value : [ value ];
  }

  function normalizeNamedParameters(parameters) {
    Object.keys(parameters || {}).forEach(function(key) {
      parameters[key] = ensureArray(parameters[key]);
    });
  }

  function wrapWithParameterizedHeader(name, definitions) {
    return definitions.map(function(definition) {
      return RAML.Inspector.ParameterizedHeader.fromRAML(name, definition);
    });
  }

  function filterHeaders(headers) {
    var filtered = {
      plain: {},
      parameterized: {}
    };

    Object.keys(headers || {}).forEach(function(key) {
      if (key.match(PARAMETER)) {
        filtered.parameterized[key] = wrapWithParameterizedHeader(key, headers[key]);
      } else {
        filtered.plain[key] = headers[key];
      }
    });

    if(Object.keys(filtered.plain).length === 0) {
      filtered.plain = null;
    }

    return filtered;
  }

  function processBody(body) {
    var content = body['application/x-www-form-urlencoded'];
    if (content) {
      normalizeNamedParameters(content.formParameters);
    }

    content = body['multipart/form-data'];
    if (content) {
      normalizeNamedParameters(content.formParameters);
    }
  }

  function processResponses(responses) {
    Object.keys(responses).forEach(function(status) {
      var response = responses[status];
      if (response) {
        normalizeNamedParameters(response.headers);
      }
    });
  }

  function securitySchemesExtractor(securitySchemes) {
    securitySchemes = securitySchemes || [];

    return function() {
      var securedBy = this.securedBy || [],
          selectedSchemes = {};

      securedBy = securedBy.filter(function(name) {
        return name !== null && typeof name !== 'object';
      });

      securitySchemes.forEach(function(scheme) {
        securedBy.forEach(function(name) {
          if (scheme[name]) {
            selectedSchemes[name] = scheme[name];
          }
        });
      });

      return selectedSchemes;
    };
  }

  function allowsAnonymousAccess() {
    /*jshint validthis: true */
    var securedBy = this.securedBy || [null];
    return securedBy.some(function(name) { return name === null; });
  }

  RAML.Inspector.Method = {
    create: function(raml, securitySchemes) {
      var method = RAML.Utils.clone(raml);

      method.responseCodes = Object.keys(method.responses || {});
      method.securitySchemes = securitySchemesExtractor(securitySchemes);
      method.allowsAnonymousAccess = allowsAnonymousAccess;
      normalizeNamedParameters(method.headers);
      normalizeNamedParameters(method.queryParameters);

      method.headers = filterHeaders(method.headers);
      processBody(method.body || {});
      processResponses(method.responses || {});

      method.plainAndParameterizedHeaders = RAML.Utils.copy(method.headers.plain);
      Object.keys(method.headers.parameterized).forEach(function(parameterizedHeader) {
        method.plainAndParameterizedHeaders[parameterizedHeader] = method.headers.parameterized[parameterizedHeader].map(function(parameterized) {
          return parameterized.definition();
        });
      });

      return method;
    }
  };
})();

(function () {
  'use strict';

  function validate(value) {
    value = value ? value.trim() : '';

    if (value === '') {
      throw new Error();
    }

    return value;
  }

  function fromRAML(name, definition) {
    var parameterizedString = new RAML.Client.ParameterizedString(name, definition);

    return {
      create: function(value) {
        value = validate(value);

        var header = RAML.Utils.clone(definition);
        header.displayName = parameterizedString.render({'*': value});

        return header;
      },
      definition: function() {
        return definition;
      }
    };
  }

  RAML.Inspector.ParameterizedHeader = {
    fromRAML: fromRAML
  };
})();

(function() {
  'use strict';

  var FORM_URLENCODED = 'application/x-www-form-urlencoded';
  var FORM_DATA = 'multipart/form-data';

  var BodyContent = function(contentTypes) {
    this.contentTypes = Object.keys(contentTypes).sort();
    this.selected = this.contentTypes[0];

    var definitions = this.definitions = {};
    this.contentTypes.forEach(function(contentType) {
      var definition = contentTypes[contentType] || {};

      switch (contentType) {
      case FORM_URLENCODED:
      case FORM_DATA:
        definitions[contentType] = new RAML.Services.TryIt.NamedParameters(definition.formParameters);
        break;
      default:
        definitions[contentType] = new RAML.Services.TryIt.BodyType(definition);
      }
    });
  };

  BodyContent.prototype.isForm = function(contentType) {
    return contentType === FORM_URLENCODED || contentType === FORM_DATA;
  };

  BodyContent.prototype.isSelected = function(contentType) {
    return contentType === this.selected;
  };

  BodyContent.prototype.fillWithExample = function($event) {
    $event.preventDefault();
    this.definitions[this.selected].fillWithExample();
  };

  BodyContent.prototype.hasExample = function(contentType) {
    return this.definitions[contentType].hasExample();
  };

  BodyContent.prototype.data = function() {
    if (this.selected) {
      return this.definitions[this.selected].data();
    }
  };

  BodyContent.prototype.copyFrom = function(oldContent) {
    var content = this;

    oldContent.contentTypes.forEach(function(contentType) {
      if (content.definitions[contentType]) {
        content.definitions[contentType].copyFrom(oldContent.definitions[contentType]);
      }
    });

    if (this.contentTypes.some(function(contentType) { return contentType === oldContent.selected; })) {
      this.selected = oldContent.selected;
    }
  };

  RAML.Services.TryIt.BodyContent = BodyContent;
})();

(function() {
  'use strict';

  var BodyType = function(contentType) {
    this.contentType = contentType || {};
    this.value = undefined;
  };

  BodyType.prototype.fillWithExample = function() {
    this.value = this.contentType.example;
  };

  BodyType.prototype.hasExample = function() {
    return !!this.contentType.example;
  };

  BodyType.prototype.data = function() {
    return this.value;
  };

  BodyType.prototype.copyFrom = function(oldBodyType) {
    this.value = oldBodyType.value;
  };

  RAML.Services.TryIt.BodyType = BodyType;
})();

(function() {
  'use strict';

  var Context = function(resource, method) {
    this.headers = new RAML.Services.TryIt.NamedParameters(method.headers.plain, method.headers.parameterized);
    this.queryParameters = new RAML.Services.TryIt.NamedParameters(method.queryParameters);
    if (method.body) {
      this.bodyContent = new RAML.Services.TryIt.BodyContent(method.body);
    }

    this.pathBuilder = new RAML.Client.PathBuilder.create(resource.pathSegments);
    this.pathBuilder.baseUriContext = {};
    this.pathBuilder.segmentContexts = resource.pathSegments.map(function() {
      return {};
    });
  };

  Context.prototype.merge = function(oldContext) {
    this.headers.copyFrom(oldContext.headers);
    this.queryParameters.copyFrom(oldContext.queryParameters);
    if (this.bodyContent && oldContext.bodyContent) {
      this.bodyContent.copyFrom(oldContext.bodyContent);
    }

    this.pathBuilder.baseUriContext = oldContext.pathBuilder.baseUriContext;
    this.pathBuilder.segmentContexts = oldContext.pathBuilder.segmentContexts;
  };

  RAML.Services.TryIt.Context = Context;
})();

(function() {
  'use strict';

  var NamedParameter = function(definitions) {
    this.definitions = definitions;
    this.selected = definitions[0].type;
  };

  NamedParameter.prototype.hasMultipleTypes = function() {
    return this.definitions.length > 1;
  };

  NamedParameter.prototype.isSelected = function(definition) {
    return this.selected === definition.type;
  };

  RAML.Services.TryIt.NamedParameter = NamedParameter;
})();

(function() {
  'use strict';

  function copy(object) {
    var shallow = {};
    Object.keys(object || {}).forEach(function(key) {
      shallow[key] = new RAML.Services.TryIt.NamedParameter(object[key]);
    });

    return shallow;
  }

  function filterEmpty(object) {
    var copy = {};

    Object.keys(object).forEach(function(key) {
      var values = object[key].filter(function(value) {
        return value !== undefined && value !== null && (typeof value !== 'string' || value.trim().length > 0);
      });

      if (values.length > 0) {
        copy[key] = values;
      }
    });

    return copy;
  }

  var NamedParameters = function(plain, parameterized) {
    this.plain = copy(plain);
    this.parameterized = parameterized;

    Object.keys(parameterized || {}).forEach(function(key) {
      parameterized[key].created = [];
    });

    this.values = {};
    Object.keys(this.plain).forEach(function(key) {
      this.values[key] = [undefined];
    }.bind(this));
  };

  NamedParameters.prototype.clear = function () {
    var that = this;
    Object.keys(this.values).map(function (key) {
      that.values[key] = [''];
    });
  };

  NamedParameters.prototype.reset = function (info, field) {
    var that = this;
    if (info) {
      Object.keys(info).map(function (key) {
        if (typeof field === 'undefined' || field === key) {
          that.values[key][0] = info[key][0].example;
        }
      });
    }
  };

  NamedParameters.prototype.create = function(name, value) {
    var parameters = this.parameterized[name];

    var definition = parameters.map(function(parameterizedHeader) {
      return parameterizedHeader.create(value);
    });

    var parameterizedName = definition[0].displayName;

    parameters.created.push(parameterizedName);
    this.plain[parameterizedName] = new RAML.Services.TryIt.NamedParameter(definition);
    this.values[parameterizedName] = [undefined];
  };

  NamedParameters.prototype.remove = function(name) {
    delete this.plain[name];
    delete this.values[name];
    return;
  };

  NamedParameters.prototype.data = function() {
    return filterEmpty(this.values);
  };

  NamedParameters.prototype.copyFrom = function(oldParameters) {
    var parameters = this;

    Object.keys(oldParameters.parameterized || {}).forEach(function(key) {
      if (parameters.parameterized[key]) {
        oldParameters.parameterized[key].created.forEach(function(createdParam) {
          parameters.plain[createdParam] = oldParameters.plain[createdParam];
        });
      }
    });

    var keys = Object.keys(oldParameters.plain || {}).filter(function(key) {
      return parameters.plain[key];
    });

    keys.forEach(function(key) {
      parameters.values[key] = oldParameters.values[key];
    });
  };

  RAML.Services.TryIt.NamedParameters = NamedParameters;
})();

(function() {
  'use strict';

  function Clone() {}

  RAML.Utils = {
    clone: function(object) {
      Clone.prototype = object;
      return new Clone();
    },

    copy: function(object) {
      var copiedObject = {};
      for (var key in object) {
        copiedObject[key] = object[key];
      }
      return copiedObject;
    },

    isEmpty: function(object) {
      if (object) {
        return Object.keys(object).length === 0;
      } else {
        return true;
      }
    }
  };
})();

angular.module('ramlConsoleApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('directives/close-button.tpl.html',
    "<button class=\"resource-close-btn\" ng-click=\"close($event)\">\n" +
    "  Close\n" +
    "</button>\n"
  );


  $templateCache.put('directives/documentation.tpl.html',
    "<div class=\"resource-panel-primary\">\n" +
    "  <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "    <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "      <li class=\"flag\" ng-if=\"resource.resourceType\"><b>Type:</b> {{resource.resourceType}}</li>\n" +
    "      <li class=\"flag\" ng-if=\"methodInfo.is\"><b>Trait:</b> {{traits}}</li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "    <div class=\"toggle-tabs resource-panel-toggle-tabs\" ng-click=\"toggleTab($event)\">\n" +
    "      <a class=\"toggle-tab is-active\">Request</a><a class=\"toggle-tab\">Response</a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Request -->\n" +
    "  <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "    <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "    <p marked=\"methodInfo.description\"></p>\n" +
    "\n" +
    "    <section class=\"resource-section\" id=\"docs-uri-parameters\" ng-if=\"resource.uriParametersForDocumentation\">\n" +
    "      <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "      <div class=\"resource-param\" id=\"docs-uri-parameters-{{uriParam[0].displayName}}\" ng-repeat=\"uriParam in resource.uriParametersForDocumentation\">\n" +
    "        <h4 class=\"resource-param-heading\">{{uriParam[0].displayName}} <span class=\"resource-param-instructional\" ng-if=\"uriParam[0].required\">required</span></h4>\n" +
    "        <p marked=\"uriParam[0].description\"></p>\n" +
    "\n" +
    "        <p>\n" +
    "          <span class=\"resource-param-example\" ng-if=\"uriParam[0].example\"><b>Example:</b> {{uriParam[0].example}}</span>\n" +
    "        </p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section class=\"resource-section\" id=\"docs-headers\" ng-if=\"methodInfo.headers.plain\">\n" +
    "      <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "      <div class=\"resource-param\" ng-repeat=\"header in methodInfo.headers.plain\">\n" +
    "        <h4 class=\"resource-param-heading\">{{header[0].displayName}} <span class=\"resource-param-instructional\">{{header[0].type}}</span></h4>\n" +
    "\n" +
    "        <p marked=\"header[0].description\"></p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section class=\"resource-section\" id=\"docs-query-parameters\" ng-if=\"methodInfo.queryParameters\">\n" +
    "      <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "      <div class=\"resource-param\" ng-repeat=\"queryParam in methodInfo.queryParameters\">\n" +
    "        <h4 class=\"resource-param-heading\">{{queryParam[0].displayName}} <span class=\"resource-param-instructional\">{{queryParam[0].type}}</span></h4>\n" +
    "\n" +
    "        <p marked=\"queryParam[0].description\"></p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Response -->\n" +
    "  <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "    <div class=\"resource-response-jump\">\n" +
    "      <p>\n" +
    "        Jump to status\n" +
    "        <span class=\"resource-btns\">\n" +
    "          <a class=\"resource-btn\" href=\"#code{{code}}\" ng-repeat=\"code in methodInfo.responseCodes\">{{code}}</a>\n" +
    "        </span>\n" +
    "      </p>\n" +
    "    </div>\n" +
    "\n" +
    "    <section class=\"resource-section resource-response-section\" ng-repeat=\"code in methodInfo.responseCodes\">\n" +
    "      <a name=\"code{{code}}\"></a>\n" +
    "      <h3 class=\"resource-heading-a\">Status {{code}}</h3>\n" +
    "\n" +
    "      <div class=\"resource-response\">\n" +
    "        <p marked=\"methodInfo.responses[code].description\"></p>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"resource-response\" ng-if=\"methodInfo.responses[code].body\">\n" +
    "        <h4 class=\"resource-body-heading\">\n" +
    "          Body\n" +
    "          <span ng-click=\"changeType($event, key, code)\" ng-class=\"{isActive: $first}\" class=\"flag\" ng-repeat=\"(key, value) in methodInfo.responses[code].body\">{{key}}</span>\n" +
    "        </h4>\n" +
    "\n" +
    "        <span>Example:</span>\n" +
    "        <pre ng-if=\"responseInfo[code][responseInfo[code].currentType].example\" class=\"resource-pre\"><code >{{responseInfo[code][responseInfo[code].currentType].example}}</code></pre>\n" +
    "        <pre ng-if=\"!responseInfo[code][responseInfo[code].currentType].example\" class=\"resource-pre\"><code>Example not defined</code></pre>\n" +
    "\n" +
    "        <p><button ng-click=\"showSchema($event)\" class=\"resource-btn js-schema-toggle\">Show Schema</button></p>\n" +
    "        <pre ng-if=\"responseInfo[code][responseInfo[code].currentType].schema\" class=\"resource-pre resource-pre-toggle\"><code>{{responseInfo[code][responseInfo[code].currentType].schema}}</code></pre>\n" +
    "        <pre ng-if=\"!responseInfo[code][responseInfo[code].currentType].schema\" class=\"resource-pre resource-pre-toggle\"><code>Schema not defined</code></pre>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/method-list.tpl.html',
    "<div class=\"tab-list\">\n" +
    "  <a class=\"tab\" href=\"#\" ng-repeat=\"method in resource.methods\" ng-click=\"showResource($event, $index)\">\n" +
    "    <svg class=\"tab-image tab-{{method.method}}\">\n" +
    "      <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "    </svg>\n" +
    "\n" +
    "    <span class=\"tab-label\">{{method.method.toLocaleUpperCase()}}</span>\n" +
    "  </a>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/raml-initializer.tpl.html',
    "<div ng-switch=\"ramlLoaded\">\n" +
    "  <div class=\"initializer-container initializer-primary\" ng-switch-when=\"false\">\n" +
    "    <h1 class=\"title\">RAML Console</h1>\n" +
    "\n" +
    "    <div class=\"initializer-content-wrapper\">\n" +
    "      <section>\n" +
    "        <header class=\"initializer-row initializer-subheader\">\n" +
    "          <h4 class=\"initializer-subhead\">Initialize from the URL of a RAML file</h4>\n" +
    "        </header>\n" +
    "\n" +
    "        <div class=\"initializer-row\">\n" +
    "          <p class=\"initializer-input-container\">\n" +
    "            <input autofocus class=\"initializer-input initializer-raml-field\" ng-model=\"$parent.ramlUrl\" ng-keypress=\"onKeyPressRamlUrl($event)\">\n" +
    "          </p>\n" +
    "\n" +
    "          <div class=\"initializer-action-group\" align=\"right\">\n" +
    "            <button class=\"initializer-action initializer-action-btn\" ng-click=\"loadFromUrl()\">Load from URL</button>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "\n" +
    "      <section>\n" +
    "        <header class=\"initializer-row initializer-subheader\">\n" +
    "          <h4 class=\"initializer-subhead\">or parse RAML in here</h4>\n" +
    "        </header>\n" +
    "\n" +
    "        <div class=\"initializer-row\">\n" +
    "          <p class=\"initializer-input-container\">\n" +
    "            <textarea ui-codemirror=\"{\n" +
    "              lineNumbers: true,\n" +
    "              lineWrapping : true,\n" +
    "              tabSize: 2,\n" +
    "              mode: 'yaml'\n" +
    "            }\" ng-model=\"$parent.raml\"></textarea>\n" +
    "          </p>\n" +
    "          <div class=\"initializer-action-group\" align=\"right\">\n" +
    "            <button class=\"initializer-action initializer-action-btn\" ng-click=\"loadRaml()\">Load RAML</button>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <raml-console ng-switch-when=\"true\"></raml-console>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/resource-panel.tpl.html',
    "<div class=\"resource-panel\" ng-class=\"{ 'has-sidebar-fullscreen': withTryItOnFullscreen }\">\n" +
    "  <div class=\"resource-panel-wrapper\">\n" +
    "    <sidebar></sidebar>\n" +
    "\n" +
    "    <documentation></documentation>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/sidebar.tpl.html',
    "  <form name=\"form\" class=\"sidebar\" novalidate ng-class=\"{ 'is-fullscreen': withTryItOnFullscreen }\">\n" +
    "    <div class=\"sidebar-flex-wrapper\">\n" +
    "      <div class=\"sidebar-content\">\n" +
    "        <header class=\"sidebar-row sidebar-header\">\n" +
    "          <h3 class=\"sidebar-head\">\n" +
    "            Try it\n" +
    "            <a class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\" ng-click=\"toggleSidebar($event)\">\n" +
    "              <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "              <span class=\"visuallyhidden\">Expand</span>\n" +
    "            </a>\n" +
    "          </h3>\n" +
    "        </header>\n" +
    "\n" +
    "        <!-- Show more -->\n" +
    "        <div class=\"sidebar-show-more\" ng-show=\"showMoreEnable\">\n" +
    "          <p>\n" +
    "            more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "          </p>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"sidebar-content-wrapper\">\n" +
    "          <section>\n" +
    "            <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "              <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                <button ng-click=\"toggleSecurity($event, scheme.type, key)\" class=\"toggle toggle-mini\" ng-class=\"{'is-active': $first}\" ng-repeat=\"(key, scheme) in securitySchemes\">{{scheme.type}}</button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-switch=\"currentScheme.type\">\n" +
    "              <basic-auth ng-switch-when=\"Basic Authentication\" credentials='credentials'></basic-auth>\n" +
    "              <oauth1 ng-switch-when=\"OAuth 1.0\" credentials='credentials'></oauth1>\n" +
    "              <oauth2 ng-switch-when=\"OAuth 2.0\" credentials='credentials'></oauth2>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"sidebar-uri-parameters\" ng-if=\"resource.uriParametersForDocumentation\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <p class=\"sidebar-input-container\" ng-repeat=\"uriParam in resource.uriParametersForDocumentation\">\n" +
    "                <span class=\"sidebar-input-tooltip-container sidebar-input-left\" ng-if=\"hasExampleValue(uriParam[0].example)\">\n" +
    "                  <button tabindex=\"-1\" class=\"sidebar-input-reset\" ng-click=\"resetUriParameter(uriParam)\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout-left\">\n" +
    "                    <span>Use example value</span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "                <span class=\"sidebar-input-tooltip-container\" ng-if=\"uriParam[0].description\">\n" +
    "                  <button tabindex=\"-1\" class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout\">\n" +
    "                    <span marked=\"uriParam[0].description\"></span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "                <label for=\"{{uriParam[0].id}}\" class=\"sidebar-label\">{{uriParam[0].displayName}} <span class=\"side-bar-required-field\" ng-if=\"uriParam[0].required\">*</span></label>\n" +
    "                <input name=\"{{uriParam[0].id}}\" ng-required=\"{{uriParam[0].required}}\" class=\"sidebar-input\" ng-model=\"uriParameters[uriParam[0].id]\" ng-class=\"{'sidebar-field-no-default': !hasExampleValue(uriParam[0].example)}\">\n" +
    "                <span class=\"field-validation-error\"></span>\n" +
    "              </p>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"sidebar-headers\" ng-if=\"methodInfo.headers.plain\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <p class=\"sidebar-input-container\" ng-repeat=\"header in methodInfo.headers.plain\">\n" +
    "                <span class=\"sidebar-input-tooltip-container sidebar-input-left\" ng-if=\"hasExampleValue(header[0].example)\">\n" +
    "                  <button tabindex=\"-1\" class=\"sidebar-input-reset\" ng-click=\"resetHeader(header)\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout-left\">\n" +
    "                    <span>Use example value</span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "\n" +
    "                <span class=\"sidebar-input-tooltip-container\" ng-if=\"header[0].description\">\n" +
    "                  <button tabindex=\"-1\" class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout\">\n" +
    "                    <span marked=\"header[0].description\"></span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "                <label for=\"{{header[0].id}}\" class=\"sidebar-label\">{{header[0].displayName}} <span class=\"side-bar-required-field\" ng-if=\"header[0].required\">*</span></label>\n" +
    "                <input name=\"{{header[0].id}}\" ng-required=\"{{header[0].required}}\" class=\"sidebar-input\" ng-model=\"context.headers.values[header[0].id][0]\" ng-class=\"{'sidebar-field-no-default': !hasExampleValue(header[0].example)}\">\n" +
    "                <span class=\"field-validation-error\"></span>\n" +
    "              </p>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"sidebar-query-parameters\" ng-if=\"methodInfo.queryParameters\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\" ng-repeat=\"queryParam in methodInfo.queryParameters\">\n" +
    "                <span class=\"sidebar-input-tooltip-container\" ng-if=\"queryParam[0].description\">\n" +
    "                  <button tabindex=\"-1\" class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout\">\n" +
    "                    <span marked=\"queryParam[0].description\"></span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "                <label for=\"{{queryParam[0].id}}\" class=\"sidebar-label\">{{queryParam[0].displayName}} <span class=\"side-bar-required-field\" ng-if=\"queryParam[0].required\">*</span></label>\n" +
    "\n" +
    "                <span class=\"sidebar-input-tooltip-container sidebar-input-left\" ng-if=\"hasExampleValue(queryParam[0].example)\">\n" +
    "                  <button tabindex=\"-1\" class=\"sidebar-input-reset\" ng-click=\"resetQueryParam(queryParam)\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout-left\">\n" +
    "                    <span>Use example value</span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "                <input name=\"{{queryParam[0].id}}\" ng-required=\"{{queryParam[0].required}}\"  class=\"sidebar-input\" ng-model=\"context.queryParameters.values[queryParam[0].id][0]\" ng-class=\"{'sidebar-field-no-default': !hasExampleValue(queryParam[0].example)}\" />\n" +
    "                <span class=\"field-validation-error\"></span>\n" +
    "\n" +
    "              </p>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"sidebar-body\" ng-if=\"methodInfo.body\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">Body</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"toggle-group sidebar-toggle-group sidebar-toggle-type\">\n" +
    "                <button class=\"toggle toggle-mini\" ng-click=\"toggleBodyType($event, key)\" ng-class=\"{'is-active': $first}\" ng-repeat=\"(key, value) in methodInfo.body\">{{key}}</button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"codemirror-body-editor\" ui-codemirror=\"{ lineNumbers: true, tabSize: 2 }\" ng-model=\"context.bodyContent.definitions[context.bodyContent.selected].value\"></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"sidebar-prefill sidebar-row\" align=\"right\" ng-if=\"context.bodyContent.definitions[context.bodyContent.selected].hasExample()\">\n" +
    "              <button class=\"sidebar-action-prefill\" ng-click=\"prefillBody(context.bodyContent.selected)\">Prefill with example</button>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section>\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"sidebar-action-group\">\n" +
    "                <button type=\"submit\" class=\"sidebar-action sidebar-action-{{methodInfo.method}}\" ng-click=\"tryIt($event)\">{{methodInfo.method.toUpperCase()}}\n" +
    "                </button>\n" +
    "                <button class=\"sidebar-action sidebar-action-clear\" ng-click=\"clearFields()\">Clear</button>\n" +
    "                <button class=\"sidebar-action sidebar-action-reset\" ng-click=\"resetFields()\">Reset</button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section>\n" +
    "            <header class=\"sidebar-row sidebar-header\">\n" +
    "              <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                <button ng-class=\"{'is-open':showRequestMetadata, 'is-collapsed':!showRequestMetadata}\" class=\"sidebar-expand-btn js-toggle-request-metadata\" ng-click=\"toggleRequestMetadata()\">\n" +
    "                  Request\n" +
    "                </button>\n" +
    "              </h3>\n" +
    "              <img src=\"img/spinner.gif\" style=\"height: 21px; width: 21px; float: right; margin-right: 10px; margin-top: 3px;\" ng-if=\"showSpinner\"/>\n" +
    "            </header>\n" +
    "            <div class=\"sidebar-request-metadata\" ng-class=\"{'is-active':showRequestMetadata}\">\n" +
    "\n" +
    "              <div class=\"sidebar-row\">\n" +
    "                <div ng-if=\"requestOptions.url\">\n" +
    "                  <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Request URI</h3>\n" +
    "                  <div class=\"sidebar-response-item\">\n" +
    "                    <p class=\"sidebar-response-metadata\">{{requestOptions.url}}</p>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-if=\"requestOptions.headers\">\n" +
    "                  <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                  <div class=\"sidebar-response-item\">\n" +
    "                    <p class=\"sidebar-response-metadata\" ng-repeat=\"(key, value) in requestOptions.headers\">\n" +
    "                      <b>{{key}}:</b> <br>{{value}}\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-if=\"requestOptions.data\">\n" +
    "                  <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                  <pre class=\"sidebar-pre sidebar-request-body\"><code ui-codemirror=\"{ readOnly: 'nocursor', tabSize: 2, lineNumbers: true }\" ng-model=\"requestOptions.data\"></code></pre>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section>\n" +
    "            <header class=\"sidebar-row sidebar-header\">\n" +
    "              <h3 class=\"sidebar-head\">Response</h3>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row sidebar-response\" ng-class=\"{'is-active':requestEnd}\">\n" +
    "              <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "              <p class=\"sidebar-response-item\">{{response.status}}</p>\n" +
    "\n" +
    "              <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "              <div class=\"sidebar-response-item\">\n" +
    "                <p class=\"sidebar-response-metadata\" ng-repeat=\"(key, value) in response.headers\">\n" +
    "                  <b>{{key}}:</b> <br>{{value}}\n" +
    "                </p>\n" +
    "              </p>\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"response.body\">\n" +
    "              <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "              <pre class=\"sidebar-pre\"><code ui-codemirror=\"{ readOnly: true, tabSize: 2, lineNumbers: true, lineWrapping : true }\" ng-model=\"response.body\"></code></pre>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </section>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Sidebar control to intermediate view -->\n" +
    "    <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\" ng-click=\"collapseSidebar($event)\">\n" +
    "      <button class=\"collapse\">\n" +
    "        <span class=\"discoverable\">Try it</span>\n" +
    "        <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "      </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Sidebar control to full-screen/full-width view -->\n" +
    "    <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "      <button class=\"collapse\">\n" +
    "        <span class=\"discoverable\">Try it</span>\n" +
    "        <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('directives/spinner.tpl.html',
    "<img src=\"img/spinner.gif\">\n"
  );


  $templateCache.put('directives/theme-switcher.tpl.html',
    "<a class=\"theme-toggle\" href=\"#\">Switch Theme</a>\n"
  );


  $templateCache.put('resources/resource-type.tpl.html',
    "<span ng-if=\"resource.resourceType\" class=\"flag resource-heading-flag\"><b>Type:</b> {{resource.resourceType}}</span>\n"
  );


  $templateCache.put('resources/resources.tpl.html',
    "<main class=\"error-container error-primary\">\n" +
    "\n" +
    "  <div ng-if=\"!parseError\">\n" +
    "    <div ng-if=\"!loaded\">\n" +
    "      <div class=\"spinner\">\n" +
    "        <div class=\"rect1\"></div>\n" +
    "        <div class=\"rect2\"></div>\n" +
    "        <div class=\"rect3\"></div>\n" +
    "        <div class=\"rect4\"></div>\n" +
    "        <div class=\"rect5\"></div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"error-content\" ng-if=\"parseError\">\n" +
    "    <h3 class=\"heading\">Error while loading <b>{{parseError.fileName}}</b></h3>\n" +
    "\n" +
    "    <section>\n" +
    "      <header class=\"error-row error-header\">\n" +
    "        <h3 class=\"error-head error-head-expand\">\n" +
    "          <div class=\"error-expand-btn\">\n" +
    "            Message\n" +
    "          </div>\n" +
    "        </h3>\n" +
    "      </header>\n" +
    "      <pre class=\"error-pre\"><code class=\"error-message\">{{parseError.message}}</code></pre>\n" +
    "\n" +
    "      <div ng-if=\"parseError.snippet\">\n" +
    "        <header class=\"error-row error-header\">\n" +
    "          <h3 class=\"error-head error-head-expand\">\n" +
    "            <div class=\"error-expand-btn\">\n" +
    "              Snippet <span class=\"error-subhead\">(Line {{parseError.line}}, Column {{parseError.column}})</span>\n" +
    "            </div>\n" +
    "          </h3>\n" +
    "        </header>\n" +
    "        <pre class=\"error-pre\"><code class=\"error-snippet\">{{parseError.snippet}}</code></pre>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-if=\"parseError.raml\">\n" +
    "        <header class=\"error-row error-header\">\n" +
    "          <h3 class=\"error-head error-head-expand\">\n" +
    "            <div class=\"error-expand-btn\">\n" +
    "              RAML\n" +
    "            </div>\n" +
    "          </h3>\n" +
    "        </header>\n" +
    "        <pre class=\"error-pre error-codemirror-container\"><code ui-codemirror=\"{\n" +
    "            lineNumbers: true,\n" +
    "            readOnly: 'nocursor',\n" +
    "            lineWrapping : true,\n" +
    "            tabSize: 2,\n" +
    "            mode: 'yaml'\n" +
    "          }\" ng-model=\"parseError.raml\"></code></pre>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-if=\"loaded\">\n" +
    "    <theme-switcher ng-if=\"!disableThemeSwitcher\"></theme-switcher>\n" +
    "    <h1 class=\"title\">{{raml.title}}</h1>\n" +
    "\n" +
    "    <div ng-if=\"proxy\" align=\"right\" class=\"resource-proxy\">\n" +
    "      <span>API is behind a firewall <a href=\"http://www.mulesoft.org/documentation/display/current/Accessing+Your+API+Behind+a+Firewall\" target=\"_blank\">(?)</a></span>\n" +
    "      <input type=\"checkbox\" ng-model=\"disableProxy\" ng-change=\"updateProxyConfig(disableProxy)\">\n" +
    "    </div>\n" +
    "\n" +
    "    <ol class=\"resource-list resource-list-root\">\n" +
    "      <li class=\"resource-list-item\" ng-repeat=\"resourceGroup in raml.resourceGroups\">\n" +
    "        <header class=\"resource resource-root clearfix\" ng-init=\"resource = resourceGroup[0]\">\n" +
    "          <div class=\"resource-path-container\">\n" +
    "            <button class=\"resource-root-toggle is-active\" ng-if=\"resourceGroup.length > 1\" ng-click=\"toggle($event)\"></button>\n" +
    "\n" +
    "            <h2 class=\"resource-heading resource-heading-large\">\n" +
    "              <span class=\"resource-path-active\" ng-repeat='segment in resource.pathSegments'>{{segment.toString()}}</span>\n" +
    "            </h2>\n" +
    "\n" +
    "            <resource-type></resource-type>\n" +
    "          </div>\n" +
    "\n" +
    "          <method-list></method-list>\n" +
    "          <close-button></close-button>\n" +
    "        </header>\n" +
    "\n" +
    "        <resource-panel></resource-panel>\n" +
    "\n" +
    "        <!-- Child Resources -->\n" +
    "        <ol class=\"resource-list is-collapsed\" style=\"display: none;\">\n" +
    "          <li class=\"resource-list-item\" ng-repeat=\"resource in resourceGroup\" ng-if=\"!$first\">\n" +
    "            <div class=\"resource clearfix\">\n" +
    "              <div class=\"resource-path-container\">\n" +
    "                <h3 class=\"resource-heading\">\n" +
    "                  <span ng-repeat-start='segment in resource.pathSegments' ng-if=\"!$last\">{{segment.toString()}}</span><span ng-repeat-end ng-if=\"$last\" class=\"resource-path-active\">{{segment.toString()}}</span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <resource-type></resource-type>\n" +
    "              </div>\n" +
    "\n" +
    "              <method-list></method-list>\n" +
    "              <close-button></close-button>\n" +
    "            </div>\n" +
    "\n" +
    "            <resource-panel></resource-panel>\n" +
    "          </li>\n" +
    "        </ol>\n" +
    "\n" +
    "      </li>\n" +
    "    </ol>\n" +
    "  </div>\n" +
    "</main>\n"
  );


  $templateCache.put('security/basic_auth.tpl.html',
    "<div class=\"sidebar-row\">\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"username\" class=\"sidebar-label\">Username <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"text\" name=\"username\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.username\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"password\" class=\"sidebar-label\">Password <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"password\" name=\"password\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.password\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('security/oauth1.tpl.html',
    "<div class=\"sidebar-row\">\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"consumerKey\" class=\"sidebar-label\">Consumer Key <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"text\" name=\"consumerKey\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.consumerKey\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"consumerSecret\" class=\"sidebar-label\">Consumer Secret <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"password\" name=\"consumerSecret\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.consumerSecret\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('security/oauth2.tpl.html',
    "<div class=\"sidebar-row\">\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"clientId\" class=\"sidebar-label\">Client ID <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"text\" name=\"clientId\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.clientId\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"clientSecret\" class=\"sidebar-label\">Client Secret <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"password\" name=\"clientSecret\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.clientSecret\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "</div>\n"
  );

}]);
