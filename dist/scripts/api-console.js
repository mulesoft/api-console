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
        $scope.close = function () {
          var $inactiveElements = jQuery('.tab').add('.resource').add('li');

          $inactiveElements.removeClass('is-active');
          $scope.showPanel = false;
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
        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };

        $scope.parameterDocumentation = function (parameter) {
          var result = '';

          if (parameter.required) {
            result += 'required, ';
          }

          if (parameter.enum) {
            var enumValues = $scope.unique(parameter.enum);

            if (enumValues.length > 1) {
              result += 'one of ';
            }

            result += '(' + enumValues.join(', ') + ')';

          } else {
            result += parameter.type;
          }

          if (parameter.pattern) {
            result += ' matching ' + parameter.pattern;
          }

          if (parameter.minLength && parameter.maxLength) {
            result += ', ' + parameter.minLength + '-' + parameter.maxLength + ' characters';
          } else if (parameter.minLength && !parameter.maxLength) {
            result += ', at least ' + parameter.minLength + ' characters';
          } else if (parameter.maxLength && !parameter.minLength) {
            result += ', at most ' + parameter.maxLength + ' characters';
          }


          if (parameter.minimum && parameter.maximum) {
            result += ' between ' + parameter.minimum + '-' + parameter.maximum;
          } else if (parameter.minimum && !parameter.maximum) {
            result += ' ≥ ' + parameter.minimum;
          } else if (parameter.maximum && !parameter.minimum) {
            result += ' ≤ ' + parameter.maximum;
          }

          if (parameter.repeat) {
            result += ', repeatable';
          }

          if (parameter['default']) {
            result += ', default: ' + parameter['default'];
          }

          return result;
        };

        $scope.toggleTab = function ($event) {
          var $this        = jQuery($event.currentTarget);
          var $eachTab     = $this.parent().children('.toggle-tab');
          var $panel       = $this.closest('.resource-panel');
          var $eachContent = $panel.find('.resource-panel-content');

          if (!$this.hasClass('is-active')) {
            $eachTab.toggleClass('is-active');
            $eachContent.toggleClass('is-active');
          }
        };

        $scope.changeType = function ($event, type, code) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.resource-body-heading');
          var $eachContent = $panel.find('span');

          $eachContent.removeClass('isActive');
          $this.addClass('isActive');

          $scope.responseInfo[code].currentType = type;
        };

        $scope.changeResourceBodyType = function ($event, type) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.request-body-heading');
          var $eachContent = $panel.find('span');

          $eachContent.removeClass('isActive');
          $this.addClass('isActive');

          $scope.currentBodySelected = type;
        };

        $scope.showSchema = function ($event) {
          var $this   = jQuery($event.currentTarget);
          var $panel  = $this.closest('.resource-panel');
          var $schema = $panel.find('.resource-pre-toggle');

          $this.toggleClass('is-active');

          if (!$schema.hasClass('is-active')) {
            $this.text('Hide Schema');
            $schema
              .addClass('is-active')
              .velocity('slideDown');
          } else {
            $this.text('Show Schema');
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
  angular.module('RAML.Directives').directive('dynamicName', ['$parse', function($parse) {
    return {
      restrict: 'A',
      controller: function($scope, $element, $attrs){
        var name = $parse($attrs.dynamicName)($scope);

        delete($attrs.dynamicName);
        $element.removeAttr('data-dynamic-name');
        $element.removeAttr('dynamic-name');
        $attrs.$set('name', name);
      }
    };
  }]);
})();

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

        $scope.generateId = function (path) {
          return jQuery.trim(path.toString().replace(/\W/g, ' ')).replace(/\s+/g, '_');
        };

        var $inactiveElements = jQuery('.tab').add('.resource').add('li');

        $scope.$on('openMethod', function(event, $currentScope) {
          if ($scope.$id !== $currentScope.$id) {
            $inactiveElements.removeClass('is-active');
            $scope.showPanel = false;
          }
        });

        $scope.showResource = function ($event, $index) {
          var $this             = jQuery($event.currentTarget);
          var $resource         = $this.closest('.resource');
          var $inactiveElements = jQuery('.tab').add('.resource').add('li');
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

          loadExamples();

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
            var hash = $scope.generateId($scope.resource.pathSegments);

            $rootScope.$broadcast('openMethod', $scope);
            jQuery($this).addClass('is-active');
            $scope.showPanel = true;

            $location.hash(hash);
            $anchorScroll();
          } else if (jQuery($this).hasClass('is-active')) {
            $scope.showPanel = false;
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

  RAML.Directives.namedParameters = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/named-parameters.tpl.html',
      replace: true,
      scope: {
        src: '=',
        context: '=',
        type: '@',
        title: '@'
      },
      controller: function ($scope, $attrs) {
        if ($attrs.hasOwnProperty('enableCustomParameters')) {
          $scope.enableCustomParameters = true;
        }

        if ($attrs.hasOwnProperty('showBaseUrl')) {
          $scope.showBaseUrl = true;
        }

        Object.keys($scope.context[$scope.type].plain).map(function (key) {
          var definition = $scope.context[$scope.type].plain[key].definitions[0];

          if (typeof definition.enum !== 'undefined') {
            $scope.context[$scope.type].values[definition.id][0] = definition.enum[0];
          }
        });

        $scope.onChange = function () {
          $scope.context.forceRequest = false;
        };

        $scope.unique = function (arr) {
          return arr.filter (function (v, i, a) { return a.indexOf (v) === i; });
        };

        $scope.canOverride = function (definition) {
          return definition.type === 'boolean' ||  typeof definition.enum !== 'undefined';
        };

        $scope.overrideField = function ($event, definition) {
          var $this      = jQuery($event.currentTarget);
          var $container = $this.closest('p');
          var $el        = $container.find('#' + definition.id);
          var $checkbox  = $container.find('#checkbox_' + definition.id);
          var $select    = $container.find('#select_' + definition.id);

          $el.toggleClass('sidebar-override-show');
          $checkbox.toggleClass('sidebar-override-hide');
          $select.toggleClass('sidebar-override-hide');

          $this.text('Override');

          if($el.hasClass('sidebar-override-show')) {
            definition.overwritten = true;
            $this.text('Cancel override');
          } else {
            definition.overwritten = false;
            $scope.context[$scope.type].values[definition.id][0] = definition.enum[0];
          }
        };

        $scope.reset = function (param) {
          $scope.context[$scope.type].reset($scope.src, param[0].id);
        };

        $scope.hasExampleValue = function (value) {
          return value.type === 'boolean' ? false : typeof value.enum !== 'undefined' ? false : typeof value.example !== 'undefined' ? true : false;
        };

        $scope.addCustomParameter = function () {
          $scope.context.customParameters[$scope.type].push({});
        };

        $scope.removeCutomParam = function (param) {
          $scope.context.customParameters[$scope.type] = $scope.context.customParameters[$scope.type].filter(function (el) {
            return el.name !== param.name;
          });
        };

        $scope.isDefault = function (definition) {
          return typeof definition.enum === 'undefined' && definition.type !== 'boolean';
        };

        $scope.isEnum = function (definition) {
          return typeof definition.enum !== 'undefined';
        };

        $scope.isBoolean = function (definition) {
          return definition.type === 'boolean';
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('namedParameters', RAML.Directives.namedParameters);
})();

(function () {
  'use strict';

  RAML.Directives.ramlInitializer = function(ramlParserWrapper) {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-initializer.tpl.html',
      replace: true,
      controller: function($scope, $window) {
        $scope.ramlUrl    = '';

        ramlParserWrapper.onParseError(function(error) {
          /*jshint camelcase: false */
          var context = error.context_mark || error.problem_mark;
          /*jshint camelcase: true */

          $scope.errorMessage = error.message;

          if (context && !$scope.isLoadedFromUrl) {
            $scope.raml = context.buffer;

            $window.ramlErrors.line    = context.line;
            $window.ramlErrors.message = error.message;

            // Hack to update codemirror
            setTimeout(function () {
              var editor = jQuery('.initializer-input-container .CodeMirror')[0].CodeMirror;
              editor.addLineClass(context.line, 'background', 'line-error');
              editor.doc.setCursor(context.line);
            }, 10);
          }

          $scope.ramlStatus = null;

          $scope.$apply.apply($scope, null);
        });

        ramlParserWrapper.onParseSuccess(function() {
          $scope.ramlStatus = 'loaded';
        });

        $scope.onChange = function () {
          $scope.errorMessage = null;
        };

        $scope.onKeyPressRamlUrl = function ($event) {
          if ($event.keyCode === 13) {
            $scope.loadFromUrl();
          }
        };

        $scope.loadFromUrl = function () {
          if ($scope.ramlUrl) {
            $scope.isLoadedFromUrl = true;
            $scope.ramlStatus      = 'loading';
            ramlParserWrapper.load($scope.ramlUrl);
          }
        };

        $scope.loadRaml = function() {
          if ($scope.raml) {
            $scope.ramlStatus      = 'loading';
            $scope.isLoadedFromUrl = false;
            ramlParserWrapper.parse($scope.raml);
          }
        };

        if (document.location.search.indexOf('?raml=') !== -1) {
          $scope.ramlUrl = document.location.search.replace('?raml=', '');
          $scope.loadFromUrl();
        }
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
      replace: true
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
      controller: function ($scope, $location, $anchorScroll) {
        $scope.currentSchemeType = 'Anonymous';

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

        $scope.toggleBodyType = function ($event, bodyType) {
          var $this  = jQuery($event.currentTarget);
          var $panel = $this.closest('.sidebar-toggle-type').find('button');

          $panel.removeClass('is-active');
          $this.addClass('is-active');
          $scope.context.bodyContent.selected = bodyType;

          var editor = $this.closest('.sidebar-row')
                            .parent()
                            .find('.codemirror-body-editor .CodeMirror')[0];

          if (editor) {
            editor = editor.CodeMirror;
            editor.setOption('mode', bodyType);
            setTimeout(function () {
              editor.refresh();
            }, 1);
          }
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

        $scope.tryIt = function ($event) {
          $scope.requestOptions = null;
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
                authStrategy.authenticate(request.toOptions(), handleResponse);
                return;
              }

              /* jshint es5: true */
              authStrategy = RAML.Client.AuthStrategies.for(scheme, $scope.credentials);
              authStrategy.authenticate().then(function(token) {
                token.sign(request);

                jQuery.ajax(request.toOptions()).then(
                  function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
                  function(jqXhr) { handleResponse(jqXhr); }
                );
              });

              $scope.requestOptions = request.toOptions();
              /* jshint es5: false */
            } catch (e) {
              // custom strategies aren't supported yet.
            }
          } else {
            $scope.context.forceRequest = true;
          }
        };

        $scope.toggleSidebar = function ($event) {
          var $this        = jQuery($event.currentTarget);
          var $panel       = $this.closest('.resource-panel');
          var $sidebar     = $panel.find('.sidebar');
          var sidebarWidth = 0;

          if (jQuery(window).width() > 960) {
            sidebarWidth = 430;
          }

          if ($sidebar.hasClass('is-fullscreen')) {
            $sidebar.velocity(
              { width: sidebarWidth },
              {
                duration: 200,
                complete: completeAnimation
              }
            );
            $sidebar.removeClass('is-responsive');
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
            $sidebar.addClass('is-responsive');
            $panel.addClass('has-sidebar-fullscreen');
          }

          // $sidebar.removeClass('is-collapsed');
        };

        $scope.collapseSidebar = function ($event) {
          var $this         = jQuery($event.currentTarget);
          var $panel        = $this.closest('.resource-panel');
          var $panelContent = $panel.find('.resource-panel-primary');
          var $sidebar      = $panel.find('.sidebar');
          var animation     = 430;

          if ((!$sidebar.hasClass('is-fullscreen') && !$sidebar.hasClass('is-collapsed')) || $sidebar.hasClass('is-responsive')) {
            animation = 0;
          }

          $sidebar.velocity(
            { width: animation },
            {
              duration: 200,
              complete: completeAnimation
            }
          );

          $panelContent.velocity(
            { 'padding-right': animation },
            {
              duration: 200,
              complete: completeAnimation
            }
          );

          $sidebar.toggleClass('is-collapsed');
          $sidebar.removeClass('is-responsive');
          $panel.toggleClass('has-sidebar-collapsed');

          if ($sidebar.hasClass('is-fullscreen')) {
            $sidebar.toggleClass('is-fullscreen');
          }
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

  RAML.Directives.validate = function($parse) {
    return {
      require: 'ngModel',
      link: function ($scope, $element, $attrs, $ctrl) {
        function clear ($ctrl, rules) {
          Object.keys(rules).map(function (key) {
            $ctrl.$setValidity(key, true);
          });
        }

        function validate(value) {
          var sanitizer = (new RAMLSanitize())(sanitationRules);
          var validator = (new RAMLValidate())(validationRules);
          var current   = {};
          var errors;

          value = typeof value !== 'undefined' && value !== null && value.length === 0 ? undefined : value;
          current[validation.id] = value;

          errors = validator(sanitizer(current)).errors;

          if (errors.length > 0) {
            control.$setValidity(errors[0].rule, errors[0].valid);
            // Note: We want to allow invalid errors for testing purposes
            return value;
          } else {
            clear(control, validationRules[validation.id]);
            return value;
          }
        }

        var validation      = $parse($attrs.validate)($scope);
        var sanitationRules = {};
        var validationRules = {};
        var control         = $ctrl;

        sanitationRules[validation.id] = {
          type: validation.type || null,
          repeat: validation.repeat || null
        };

        sanitationRules[validation.id] = RAML.Utils.filterEmpty(sanitationRules[validation.id]);

        validationRules[validation.id] = {
          type: validation.type || null,
          minLength: validation.minLength || null,
          maxLength: validation.maxLength || null,
          required: validation.required || null,
          enum: validation.enum || null,
          pattern: validation.pattern || null,
          minimum: validation.minimum || null,
          maximum: validation.maximum || null,
          repeat: validation.repeat || null
        };

        validationRules[validation.id] = RAML.Utils.filterEmpty(validationRules[validation.id]);

        $ctrl.$formatters.unshift(function(value) {
          return validate(value);
        });

        $ctrl.$parsers.unshift(function(value) {
          return validate(value);
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('validate', RAML.Directives.validate);
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

        $scope.collapseAll = function ($event) {
          var $this = jQuery($event.currentTarget);

          if ($this.hasClass('resources-expanded')) {
            $this.text('expand all');
            $this.removeClass('resources-expanded');
            jQuery('body').find('.resource-list-root ol.resource-list').velocity('slideUp', {
              duration: 200
            });
          } else {
            $this.text('collapse all');
            $this.addClass('resources-expanded');
            jQuery('body').find('.resource-list-root ol.resource-list').velocity('slideDown', {
              duration: 200
            });
          }

          jQuery('body').find('.resource-list-root ol.resource-list').toggleClass('is-collapsed');
          jQuery('body').find('.resource-list-root li.resource-list-item header button.resource-root-toggle').toggleClass('is-active');
        };
      },
      link: function($scope) {
        ramlParserWrapper.onParseSuccess(function(raml) {
          $scope.raml = RAML.Inspector.create(raml);
          $scope.loaded = true;
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
      },
      controller: function ($scope) {
        $scope.onChange = function () {
          $scope.$parent.context.forceRequest = false;
        };
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
      },
      controller: function ($scope) {
        $scope.onChange = function () {
          $scope.$parent.context.forceRequest = false;
        };
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
      controller: function ($scope) {
        $scope.onChange = function () {
          $scope.$parent.context.forceRequest = false;
        };

        $scope.ownerOptionsEnabled = function () {
          return $scope.credentials.grant === 'owner';
        };

        $scope.grants = [
          {
            label: 'Implicit',
            value: 'token'
          },
          {
            label: 'Authorization Code',
            value: 'code'
          },
          {
            label: 'Resource Owner Password Credentials',
            value: 'owner'
          },
          {
            label: 'Client Credentials',
            value: 'credentials'
          }
        ];

        /* jshint camelcase: false */
        var authorizationGrants = $scope.$parent.securitySchemes.oauth_2_0.settings.authorizationGrants;

        if (authorizationGrants) {
          $scope.grants = $scope.grants.filter(function (el) {
            return authorizationGrants.indexOf(el.value) > -1;
          });
        }
        /* jshint camelcase: true */

        $scope.credentials.grant = $scope.grants[0].value;
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
    this.scheme = scheme;
    this.credentials = credentials;
  };

  Oauth2.prototype.authenticate = function(options, done) {
    var githubAuth = new ClientOAuth2({
      clientId:         this.credentials.clientId,
      clientSecret:     this.credentials.clientSecret,
      accessTokenUri:   this.scheme.settings.accessTokenUri,
      authorizationUri: this.scheme.settings.authorizationUri,
      redirectUri:      RAML.Settings.oauth2RedirectUri,
      scopes:           this.scheme.settings.scopes
    });
    var grantType = this.credentials.grant;

    if (grantType === 'token' || grantType === 'code') {
      window.oauth2Callback = function (uri) {
        githubAuth[grantType].getToken(uri, function (err, user, raw) {
          if (err) {
            done(raw);
          }

          if (user && user.accessToken) {
            user.request(options, function (err, res) {
              done(res.raw);
            });
          }
        });
      };
      //// TODO: Find a way to handle 404
      window.open(githubAuth[grantType].getUri());
    }

    if (grantType === 'owner') {
      githubAuth.owner.getToken(this.credentials.username, this.credentials.password, function (err, user, raw) {
        if (err) {
          done(raw);
        }

        if (user && user.accessToken) {
          user.request(options, function (err, res) {
            done(res.raw);
          });
        }
      });
    }

    if (grantType === 'credentials') {
      githubAuth.credentials.getToken(function (err, user, raw) {
        if (err) {
          done(raw);
        }

        if (user && user.accessToken) {
          user.request(options, function (err, res) {
            done(res.raw);
          });
        }
      });
    }
  };

  RAML.Client.AuthStrategies.Oauth2 = Oauth2;
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

  function rendererFor(template) {
    return function renderer(context) {
      context = context || {};

      // Enforce request without URI parameters
      // requiredParameters.forEach(function(name) {
      //   if (!context[name]) {
      //     throw new Error('Missing required uri parameter: ' + name);
      //   }
      // });

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

      if (Object.keys(options.headers).length === 0) {
        options.headers = null;
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

      o.baseUrl = options.uri;

      if (!RAML.Utils.isEmpty(queryParams)) {
        var separator = (options.uri.match('\\?') ? '&' : '?');

        o.baseUrl = options.uri + separator;
        o.uri = options.uri + separator + jQuery.param(queryParams, true);
        o.url = options.url + separator + jQuery.param(queryParams, true);
      }

      if (!RAML.Settings.disableProxy && RAML.Settings.proxy) {
        o.uri = RAML.Settings.proxy + o.uri;
        o.url = RAML.Settings.proxy + o.url;
      }

      return o;
    };
  };

  RAML.Client.Request = {
    create: function(uri, method) {
      return new RequestDsl({ url: uri, uri: uri, method: method.toUpperCase(), contentType: false });
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

  window.ramlErrors = {};

  CodeMirror.registerHelper('lint', 'yaml', function () {
    var found = [];

    found.push({
      message: window.ramlErrors.message,
      severity: 'error',
      from: CodeMirror.Pos(window.ramlErrors.line),
      to: CodeMirror.Pos(window.ramlErrors.line)
    });

    return found;
  });
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

      if (definition.formParameters) {
        Object.keys(definition.formParameters).map(function (key) {
          definition.formParameters[key][0].id = key;
        });
      }

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

  var Context = function(baseUriParameters, resource, method) {
    this.headers = new RAML.Services.TryIt.NamedParameters(method.headers.plain, method.headers.parameterized);
    this.queryParameters = new RAML.Services.TryIt.NamedParameters(method.queryParameters);

    resource.uriParametersForDocumentation = resource.uriParametersForDocumentation || {};

    if (baseUriParameters) {
      Object.keys(baseUriParameters).map(function (key) {
        resource.uriParametersForDocumentation[key] = [baseUriParameters[key]];
      });
    }

    if (Object.keys(resource.uriParametersForDocumentation).length === 0) {
      resource.uriParametersForDocumentation = null;
    }

    this.uriParameters = new RAML.Services.TryIt.NamedParameters(resource.uriParametersForDocumentation);

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
    this.uriParameters.copyFrom(oldContext.uriParameters);
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

  NamedParameters.prototype.clear = function (info) {
    var that = this;
    Object.keys(this.values).map(function (key) {
      if (typeof info[key][0].enum === 'undefined' || info[key][0].overwritten === true) {
        that.values[key] = [''];
      }
    });
  };

  NamedParameters.prototype.reset = function (info, field) {
    var that = this;
    if (info) {
      Object.keys(info).map(function (key) {
        if (typeof field === 'undefined' || field === key) {
          if (typeof info[key][0].enum === 'undefined') {
            that.values[key][0] = info[key][0].example;
          }
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
    },

    filterEmpty: function (object) {
      var copy = {};

      Object.keys(object).forEach(function(key) {
        var value = object[key];
        var flag = value !== undefined && value !== null && (typeof value !== 'string' || value.trim().length > 0);

        if (flag) {
          copy[key] = value;
        }
      });

      return copy;
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
    "    <div class=\"toggle-tabs resource-panel-toggle-tabs\">\n" +
    "      <a class=\"toggle-tab is-active\" ng-click=\"toggleTab($event)\">Request</a><a class=\"toggle-tab\" ng-click=\"toggleTab($event)\">Response</a>\n" +
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
    "        <h4 class=\"resource-param-heading\">{{uriParam[0].displayName}}<span class=\"resource-param-instructional\">{{parameterDocumentation(uriParam[0])}}</span></h4>\n" +
    "        <p marked=\"uriParam[0].description\"></p>\n" +
    "\n" +
    "        <p ng-if=\"uriParam[0].example\">\n" +
    "          <span class=\"resource-param-example\"><b>Example:</b> {{uriParam[0].example}}</span>\n" +
    "        </p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section class=\"resource-section\" id=\"docs-headers\" ng-if=\"methodInfo.headers.plain\">\n" +
    "      <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "      <div class=\"resource-param\" ng-repeat=\"header in methodInfo.headers.plain\">\n" +
    "        <h4 class=\"resource-param-heading\">{{header[0].displayName}}<span class=\"resource-param-instructional\">{{parameterDocumentation(header[0])}}</span></h4>\n" +
    "\n" +
    "        <p marked=\"header[0].description\"></p>\n" +
    "\n" +
    "        <p ng-if=\"header[0].example\">\n" +
    "          <span class=\"resource-param-example\"><b>Example:</b> {{header[0].example}}</span>\n" +
    "        </p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section class=\"resource-section\" id=\"docs-query-parameters\" ng-if=\"methodInfo.queryParameters\">\n" +
    "      <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "      <div class=\"resource-param\" ng-repeat=\"queryParam in methodInfo.queryParameters\">\n" +
    "        <h4 class=\"resource-param-heading\">{{queryParam[0].displayName}}<span class=\"resource-param-instructional\">{{parameterDocumentation(queryParam[0])}}</span></h4>\n" +
    "\n" +
    "        <p marked=\"queryParam[0].description\"></p>\n" +
    "\n" +
    "        <p ng-if=\"queryParam[0].example\">\n" +
    "          <span class=\"resource-param-example\"><b>Example:</b> {{queryParam[0].example}}</span>\n" +
    "        </p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section class=\"resource-section\" ng-if=\"methodInfo.body\">\n" +
    "      <h3 class=\"resource-heading-a\">\n" +
    "        Body\n" +
    "      </h3>\n" +
    "\n" +
    "      <h4 class=\"request-body-heading\">\n" +
    "        <span ng-click=\"changeResourceBodyType($event, key)\" ng-class=\"{isActive: $first}\" class=\"flag\" ng-repeat=\"(key, value) in methodInfo.body\">{{key}}</span>\n" +
    "      </h4>\n" +
    "\n" +
    "      <div ng-if=\"methodInfo.body[currentBodySelected].example\">\n" +
    "        <span>Example:</span>\n" +
    "        <pre class=\"resource-pre\"><code >{{methodInfo.body[currentBodySelected].example}}</code></pre>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-if=\"methodInfo.body[currentBodySelected].schema\">\n" +
    "        <p><button ng-click=\"showSchema($event)\" class=\"resource-btn js-schema-toggle\">Show Schema</button></p>\n" +
    "        <pre class=\"resource-pre resource-pre-toggle\"><code>{{methodInfo.body[currentBodySelected].schema}}</code></pre>\n" +
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
    "      <div class=\"resource-response\" ng-if=\"methodInfo.responses[code].headers\">\n" +
    "        <h4 class=\"resource-body-heading\">Headers</h4>\n" +
    "\n" +
    "        <div class=\"resource-param\" ng-repeat=\"header in methodInfo.responses[code].headers\">\n" +
    "          <h4 class=\"resource-param-heading\">{{header[0].displayName}} <span class=\"resource-param-instructional\">{{header[0].type}}</span></h4>\n" +
    "\n" +
    "          <p marked=\"header[0].description\"></p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"resource-response\" ng-if=\"methodInfo.responses[code].body\">\n" +
    "        <h4 class=\"resource-body-heading\">\n" +
    "          Body\n" +
    "          <span ng-click=\"changeType($event, key, code)\" ng-class=\"{isActive: $first}\" class=\"flag\" ng-repeat=\"(key, value) in methodInfo.responses[code].body\">{{key}}</span>\n" +
    "        </h4>\n" +
    "\n" +
    "        <div ng-if=\"responseInfo[code][responseInfo[code].currentType].example\">\n" +
    "          <span>Example:</span>\n" +
    "          <pre class=\"resource-pre\"><code >{{responseInfo[code][responseInfo[code].currentType].example}}</code></pre>\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-if=\"responseInfo[code][responseInfo[code].currentType].schema\">\n" +
    "          <p><button ng-click=\"showSchema($event)\" class=\"resource-btn js-schema-toggle\">Show Schema</button></p>\n" +
    "          <pre class=\"resource-pre resource-pre-toggle\"><code>{{responseInfo[code][responseInfo[code].currentType].schema}}</code></pre>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/method-list.tpl.html',
    "<div class=\"tab-list\">\n" +
    "  <a class=\"tab\" ng-repeat=\"method in resource.methods\" ng-click=\"showResource($event, $index)\">\n" +
    "    <svg class=\"tab-image tab-{{method.method}}\">\n" +
    "      <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "    </svg>\n" +
    "\n" +
    "    <span class=\"tab-label\">{{method.method.toLocaleUpperCase()}}</span>\n" +
    "  </a>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/named-parameters.tpl.html',
    "<section>\n" +
    "  <header class=\"sidebar-row sidebar-subheader\">\n" +
    "    <h4 class=\"sidebar-subhead\">{{title}}</h4>\n" +
    "    <button class=\"sidebar-add-btn\" ng-click=\"addCustomParameter()\" ng-if=\"enableCustomParameters\"></button>\n" +
    "  </header>\n" +
    "\n" +
    "  <div class=\"sidebar-row\">\n" +
    "    <p class=\"sidebar-input-container sidebar-input-container-custom\" ng-repeat=\"customParam in context.customParameters[type]\">\n" +
    "      <button class=\"sidebar-input-delete\" ng-click=\"removeCutomParam(customParam)\"></button>\n" +
    "      <label for=\"custom-header\" class=\"sidebar-label sidebar-label-custom\">\n" +
    "        <input class=\"sidebar-custom-input-for-label\" ng-model=\"customParam.name\" placeholder=\"custom key\">\n" +
    "      </label>\n" +
    "      <input name=\"custom-header\" class=\"sidebar-input sidebar-input-custom\" placeholder=\"custom value\" ng-model=\"customParam.value\">\n" +
    "    </p>\n" +
    "\n" +
    "    <p ng-show=\"showBaseUrl\" class=\"sidebar-method\">{{$parent.methodInfo.method.toUpperCase()}}</p>\n" +
    "    <div ng-show=\"showBaseUrl\" class=\"sidebar-method-content\">\n" +
    "      <p class=\"sidebar-url\">{{$parent.raml.baseUri.toString()}}</p>\n" +
    "    </div>\n" +
    "\n" +
    "    <p class=\"sidebar-input-container\" ng-repeat=\"param in context[type].plain\">\n" +
    "      <span class=\"sidebar-input-tooltip-container\" ng-if=\"param.definitions[0].description\">\n" +
    "        <button tabindex=\"-1\" class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "        <span class=\"sidebar-tooltip-flyout\">\n" +
    "          <span marked=\"param.definitions[0].description\"></span>\n" +
    "        </span>\n" +
    "      </span>\n" +
    "      <label for=\"{{param.definitions[0].id}}\" class=\"sidebar-label\">{{param.definitions[0].displayName}} <a class=\"sidebar-override\" ng-if=\"canOverride(param.definitions[0])\" ng-click=\"overrideField($event, param.definitions[0])\">Override</a> <span class=\"side-bar-required-field\" ng-if=\"param.definitions[0].required\">*</span></label>\n" +
    "\n" +
    "      <span class=\"sidebar-input-tooltip-container sidebar-input-left\" ng-if=\"hasExampleValue(param.definitions[0])\">\n" +
    "        <button tabindex=\"-1\" class=\"sidebar-input-reset\" ng-click=\"reset(param.definitions)\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "        <span class=\"sidebar-tooltip-flyout-left\">\n" +
    "          <span>Use example value</span>\n" +
    "        </span>\n" +
    "      </span>\n" +
    "\n" +
    "      <select id=\"select_{{param.definitions[0].id}}\" ng-if=\"isEnum(param.definitions[0])\" name=\"param.definitions[0].id\" class=\"sidebar-input\" ng-model=\"context[type].values[param.definitions[0].id][0]\" style=\"margin-bottom: 0;\" ng-change=\"onChange()\">\n" +
    "       {{$index}}\n" +
    "       <option ng-repeat=\"enum in unique(param.definitions[0].enum)\" value=\"{{enum}}\">{{enum}}</option>\n" +
    "      </select>\n" +
    "\n" +
    "      <input id=\"{{param.definitions[0].id}}\" ng-hide=\"!isDefault(param.definitions[0])\" class=\"sidebar-input\" ng-model=\"context[type].values[param.definitions[0].id][0]\" ng-class=\"{'sidebar-field-no-default': !hasExampleValue(param.definitions[0])}\" validate=\"param.definitions[0]\" dynamic-name=\"param.definitions[0].id\" ng-change=\"onChange()\"/>\n" +
    "\n" +
    "      <input id=\"checkbox_{{param.definitions[0].id}}\" ng-if=\"isBoolean(param.definitions[0])\" class=\"sidebar-input\" type=\"checkbox\" ng-model=\"context[type].values[param.definitions[0].id][0]\" dynamic-name=\"param.definitions[0].id\" ng-change=\"onChange()\" />\n" +
    "\n" +
    "      <span class=\"field-validation-error\"></span>\n" +
    "    </p>\n" +
    "  </div>\n" +
    "</section>\n"
  );


  $templateCache.put('directives/raml-initializer.tpl.html',
    "<div ng-switch=\"ramlStatus\">\n" +
    "  <div class=\"initializer-container initializer-primary\" ng-switch-default>\n" +
    "    <h1 class=\"title\">RAML Console</h1>\n" +
    "\n" +
    "    <div class=\"initializer-content-wrapper\">\n" +
    "      <section>\n" +
    "        <header class=\"initializer-row initializer-subheader\">\n" +
    "          <h4 class=\"initializer-subhead\">Initialize from the URL of a RAML file</h4>\n" +
    "        </header>\n" +
    "\n" +
    "        <div class=\"initializer-row\">\n" +
    "          <p class=\"initializer-input-container\" ng-class=\"{ 'initializer-input-container-error': errorMessage }\">\n" +
    "            <input id=\"ramlPath\" autofocus class=\"initializer-input initializer-raml-field\" ng-model=\"$parent.ramlUrl\" ng-keypress=\"onKeyPressRamlUrl($event)\" ng-change=\"onChange()\">\n" +
    "          </p>\n" +
    "          <div class=\"parser-error\" ng-if=\"isLoadedFromUrl\">\n" +
    "            <span>{{errorMessage}}</span>\n" +
    "          </div>\n" +
    "          <div class=\"initializer-action-group\" align=\"right\">\n" +
    "            <button id=\"loadRamlFromUrl\" class=\"initializer-action initializer-action-btn\" ng-click=\"loadFromUrl()\">Load from URL</button>\n" +
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
    "            <textarea id=\"raml\" ui-codemirror=\"{\n" +
    "              lineNumbers: true,\n" +
    "              lineWrapping : true,\n" +
    "              tabSize: 2,\n" +
    "              mode: 'yaml',\n" +
    "              gutters: ['CodeMirror-lint-markers'],\n" +
    "              lint: true\n" +
    "            }\" ng-model=\"$parent.raml\"></textarea>\n" +
    "          </p>\n" +
    "          <div class=\"initializer-action-group\" align=\"right\">\n" +
    "            <button id=\"loadRaml\" class=\"initializer-action initializer-action-btn\" ng-click=\"loadRaml()\">Load RAML</button>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <raml-console ng-switch-when=\"loaded\"></raml-console>\n" +
    "\n" +
    "  <div ng-switch-when=\"loading\">\n" +
    "    <div class=\"spinner\">\n" +
    "      <div class=\"rect1\"></div>\n" +
    "      <div class=\"rect2\"></div>\n" +
    "      <div class=\"rect3\"></div>\n" +
    "      <div class=\"rect4\"></div>\n" +
    "      <div class=\"rect5\"></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/resource-panel.tpl.html',
    "<div class=\"resource-panel\" ng-if=\"showPanel\" ng-class=\"{ 'has-sidebar-fullscreen': withTryItOnFullscreen }\">\n" +
    "  <div class=\"resource-panel-wrapper\">\n" +
    "    <div class=\"sidebar-controls sidebar-controls-collapse\" ng-click=\"collapseSidebar($event)\" style=\"right: -1px; position: absolute;\">\n" +
    "      <button class=\"collapse\">\n" +
    "        <img src=\"img/icn-expand.svg\" alt=\"\" style=\"transform: rotate(-180deg);\">\n" +
    "        <span class=\"discoverable\">Try it</span>\n" +
    "      </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"sidebar-controls sidebar-controls-fullscreen\" ng-click=\"toggleSidebar($event)\" style=\"right: -1px; position: absolute;\">\n" +
    "      <button class=\"collapse\">\n" +
    "        <img src=\"img/icn-expand.svg\" alt=\"\" style=\"transform: rotate(-180deg);\">\n" +
    "        <span class=\"discoverable\">Try it</span>\n" +
    "      </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <documentation></documentation>\n" +
    "\n" +
    "    <sidebar></sidebar>\n" +
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
    "            <a class=\"sidebar-fullscreen-toggle\" ng-click=\"collapseSidebar($event)\"><div class=\"close-sidebar\">&times;</div></a>\n" +
    "            <a class=\"sidebar-fullscreen-toggle sidebar-resize\" ng-click=\"toggleSidebar($event)\">\n" +
    "              <img class=\"full-resize\" src=\"img/resize-full-1.svg\" alt=\"\">\n" +
    "              <img class=\"small-resize\" src=\"img/resize-small-1.svg\" alt=\"\">\n" +
    "            </a>\n" +
    "          </h3>\n" +
    "        </header>\n" +
    "\n" +
    "        <div class=\"sidebar-content-wrapper\">\n" +
    "          <section>\n" +
    "            <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "              <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row sidebar-securty\">\n" +
    "              <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                <label class=\"sidebar-label\">Security Scheme</label>\n" +
    "                <select class=\"sidebar-input\" ng-model=\"currentSchemeType\" style=\"margin-bottom: 0;\">\n" +
    "                 <option ng-repeat=\"(key, scheme) in securitySchemes\" value=\"{{scheme.type}}\" ng-selected=\"scheme.type=='Anonymous'\">{{scheme.type}}</option>\n" +
    "                </select>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-switch=\"currentSchemeType\">\n" +
    "              <basic-auth ng-switch-when=\"Basic Authentication\" credentials='credentials'></basic-auth>\n" +
    "              <oauth1 ng-switch-when=\"OAuth 1.0\" credentials='credentials'></oauth1>\n" +
    "              <oauth2 ng-switch-when=\"OAuth 2.0\" credentials='credentials'></oauth2>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <named-parameters ng-if=\"resource.uriParametersForDocumentation\" src=\"resource.uriParametersForDocumentation\" context=\"context\" type=\"uriParameters\" title=\"URI Parameters\" show-base-url></named-parameters>\n" +
    "\n" +
    "          <named-parameters src=\"methodInfo.headers.plain\" context=\"context\" type=\"headers\" title=\"Headers\" enable-custom-parameters></named-parameters>\n" +
    "\n" +
    "          <named-parameters src=\"methodInfo.queryParameters\" context=\"context\" type=\"queryParameters\" title=\"Query Parameters\" enable-custom-parameters></named-parameters>\n" +
    "\n" +
    "          <section id=\"sidebar-body\" ng-if=\"methodInfo.body\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">Body</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\" style=\"padding-bottom: 0;\">\n" +
    "              <select class=\"sidebar-input\" ng-model=\"context.bodyContent.selected\" style=\"margin-bottom: 0;\">\n" +
    "               <option ng-repeat=\"(key, scheme) in methodInfo.body\" value=\"{{key}}\">{{key}}</option>\n" +
    "              </select>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"sidebar-row\" ng-switch=\"context.bodyContent.isForm(context.bodyContent.selected)\">\n" +
    "              <div ng-switch-when=\"false\">\n" +
    "                <div class=\"codemirror-body-editor\" ui-codemirror=\"{ lineNumbers: true, tabSize: 2 }\" ng-model=\"context.bodyContent.definitions[context.bodyContent.selected].value\"></div>\n" +
    "                <div class=\"sidebar-prefill sidebar-row\" align=\"right\" ng-if=\"context.bodyContent.definitions[context.bodyContent.selected].hasExample()\">\n" +
    "                  <button class=\"sidebar-action-prefill\" ng-click=\"prefillBody(context.bodyContent.selected)\">Prefill with example</button>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "\n" +
    "              <div ng-switch-when=\"true\">\n" +
    "                <p class=\"sidebar-input-container\" ng-repeat=\"param in context.bodyContent.definitions[context.bodyContent.selected].plain\">\n" +
    "                  <span class=\"sidebar-input-tooltip-container\" ng-if=\"param.definitions[0].description\">\n" +
    "                    <button tabindex=\"-1\" class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                    <span class=\"sidebar-tooltip-flyout\">\n" +
    "                      <span marked=\"param.definitions[0].description\"></span>\n" +
    "                    </span>\n" +
    "                  </span>\n" +
    "                  <label for=\"{{param.definitions[0].id}}\" class=\"sidebar-label\">{{param.definitions[0].displayName}} <span class=\"side-bar-required-field\" ng-if=\"param.definitions[0].required\">*</span></label>\n" +
    "\n" +
    "                  <span class=\"sidebar-input-tooltip-container sidebar-input-left\" ng-if=\"hasExampleValue(param.definitions[0].example)\">\n" +
    "                    <button tabindex=\"-1\" class=\"sidebar-input-reset\" ng-click=\"resetFormParameter(param.definitions[0])\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                    <span class=\"sidebar-tooltip-flyout-left\">\n" +
    "                      <span>Use example value</span>\n" +
    "                    </span>\n" +
    "                  </span>\n" +
    "\n" +
    "                  <input class=\"sidebar-input\" ng-model=\"context.bodyContent.definitions[context.bodyContent.selected].values[param.definitions[0].id][0]\" ng-class=\"{'sidebar-field-no-default': !hasExampleValue(param.definitions[0].example)}\" validate=\"param.definitions[0]\" dynamic-name=\"param.definitions[0].id\" />\n" +
    "                  <span class=\"field-validation-error\"></span>\n" +
    "                </p>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section>\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"sidebar-action-group\">\n" +
    "                <button ng-hide=\"showSpinner\" type=\"submit\" class=\"sidebar-action sidebar-action-{{methodInfo.method}}\" ng-click=\"tryIt($event)\" ng-class=\"{'sidebar-action-force':context.forceRequest}\"><span ng-if=\"context.forceRequest\">Force</span> {{methodInfo.method.toUpperCase()}}\n" +
    "                </button>\n" +
    "                <button ng-if=\"showSpinner\" type=\"submit\" class=\"sidebar-action sidebar-action-{{methodInfo.method}} sidebar-action-cancel-request\" ng-click=\"cancelRequest()\">Cancel</button>\n" +
    "                <button class=\"sidebar-action sidebar-action-clear\" ng-click=\"clearFields()\">Clear</button>\n" +
    "                <button class=\"sidebar-action sidebar-action-reset\" ng-click=\"resetFields()\">Reset</button>\n" +
    "\n" +
    "                <div class=\"spinner_request\" ng-if=\"showSpinner\">Loading ...</div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"request_{{generateId(resource.pathSegments)}}\" class=\"side-bar-try-it-description\">\n" +
    "            <header class=\"sidebar-row sidebar-header\">\n" +
    "              <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                <button ng-class=\"{'is-open':showRequestMetadata, 'is-collapsed':!showRequestMetadata}\" class=\"sidebar-expand-btn js-toggle-request-metadata\" ng-click=\"toggleRequestMetadata()\">\n" +
    "                  Request\n" +
    "                </button>\n" +
    "              </h3>\n" +
    "            </header>\n" +
    "            <div class=\"sidebar-request-metadata\" ng-class=\"{'is-active':showRequestMetadata}\">\n" +
    "\n" +
    "              <div class=\"sidebar-row\">\n" +
    "                <div ng-if=\"requestOptions.uri\">\n" +
    "                  <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Request URI</h3>\n" +
    "                  <div class=\"sidebar-response-item\">\n" +
    "                    <p class=\"sidebar-response-metadata sidebar-request-url\">{{requestOptions.baseUrl}}<span ng-repeat=\"(key, value) in parameters\"><span ng-hide=\"$first\">&amp;</span><b>{{key}}</b>=<i>{{value[0]}}</i></span>\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-if=\"requestOptions.headers\">\n" +
    "                  <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                  <div class=\"sidebar-response-item\">\n" +
    "                    <p class=\"sidebar-response-metadata\" ng-repeat=\"(key, value) in requestOptions.headers\">\n" +
    "                      <b>{{key}}:</b> <br>{{getHeaderValue(value)}}\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-if=\"requestOptions.data\">\n" +
    "                  <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                  <div ng-switch=\"context.bodyContent.isForm(context.bodyContent.selected)\">\n" +
    "                    <pre ng-switch-when=\"false\" class=\"sidebar-pre sidebar-request-body\"><code ui-codemirror=\"{ readOnly: 'nocursor', tabSize: 2, lineNumbers: true }\" ng-model=\"requestOptions.data\"></code></pre>\n" +
    "                    <div ng-switch-when=\"true\" class=\"sidebar-response-item\">\n" +
    "                      <p class=\"sidebar-response-metadata\" ng-repeat=\"(key, value) in context.bodyContent.definitions[context.bodyContent.selected].values\">\n" +
    "                        <b>{{key}}:</b> <br>{{value}}\n" +
    "                      </p>\n" +
    "                    </div>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section class=\"side-bar-try-it-description\">\n" +
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
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('directives/spinner.tpl.html',
    "<img src=\"img/spinner.gif\">\n"
  );


  $templateCache.put('directives/theme-switcher.tpl.html',
    "<a class=\"theme-toggle\">Switch Theme</a>\n"
  );


  $templateCache.put('resources/resource-type.tpl.html',
    "<span ng-if=\"resource.resourceType\" class=\"flag resource-heading-flag\"><b>Type:</b> {{resource.resourceType}}</span>\n"
  );


  $templateCache.put('resources/resources.tpl.html',
    "<main class=\"error-container error-primary\">\n" +
    "\n" +
    "  <div ng-if=\"!loaded\">\n" +
    "    <div class=\"spinner\">\n" +
    "      <div class=\"rect1\"></div>\n" +
    "      <div class=\"rect2\"></div>\n" +
    "      <div class=\"rect3\"></div>\n" +
    "      <div class=\"rect4\"></div>\n" +
    "      <div class=\"rect5\"></div>\n" +
    "    </div>\n" +
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
    "    <div>\n" +
    "      <a class=\"toggle-button resources-expanded\" href=\"\" ng-click=\"collapseAll($event)\">collapse All</a>\n" +
    "    </div>\n" +
    "\n" +
    "    <ol class=\"resource-list resource-list-root\">\n" +
    "      <li id=\"{{generateId(resource.pathSegments)}}\" class=\"resource-list-item\" ng-repeat=\"resourceGroup in raml.resourceGroups\">\n" +
    "        <header class=\"resource resource-root clearfix\" ng-class=\"{ 'is-active':showPanel }\" ng-init=\"resource = resourceGroup[0]\">\n" +
    "          <div class=\"resource-path-container\">\n" +
    "            <button class=\"resource-root-toggle\" ng-if=\"resourceGroup.length > 1\" ng-click=\"toggle($event)\"></button>\n" +
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
    "        <ol class=\"resource-list\">\n" +
    "          <li id=\"{{generateId(resource.pathSegments)}}\" class=\"resource-list-item\" ng-repeat=\"resource in resourceGroup\" ng-if=\"!$first\">\n" +
    "            <div class=\"resource clearfix\" ng-class=\"{ 'is-active':showPanel }\">\n" +
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
    "    <input required=\"true\" type=\"text\" name=\"username\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.username\" ng-change=\"onChange()\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"password\" class=\"sidebar-label\">Password <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"password\" name=\"password\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.password\" ng-change=\"onChange()\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('security/oauth1.tpl.html',
    "<div class=\"sidebar-row\">\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"consumerKey\" class=\"sidebar-label\">Consumer Key <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"text\" name=\"consumerKey\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.consumerKey\" ng-change=\"onChange()\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"consumerSecret\" class=\"sidebar-label\">Consumer Secret <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"password\" name=\"consumerSecret\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.consumerSecret\" ng-change=\"onChange()\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('security/oauth2.tpl.html',
    "<div class=\"sidebar-row\">\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"clientId\" class=\"sidebar-label\">Authorization Grant</label>\n" +
    "    <select class=\"sidebar-input\" ng-model=\"credentials.grant\">\n" +
    "     <option ng-repeat=\"grant in grants\" value=\"{{grant.value}}\" ng-selected=\"grant.value=='token'\">{{grant.label}}</option>\n" +
    "    </select>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"clientId\" class=\"sidebar-label\">Client ID <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"text\" name=\"clientId\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.clientId\" ng-change=\"onChange()\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"clientSecret\" class=\"sidebar-label\">Client Secret <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"password\" name=\"clientSecret\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.clientSecret\" ng-change=\"onChange()\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\" ng-if=\"ownerOptionsEnabled()\">\n" +
    "    <label for=\"username\" class=\"sidebar-label\">Username <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"text\" name=\"username\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.username\" ng-change=\"onChange()\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\" ng-if=\"ownerOptionsEnabled()\">\n" +
    "    <label for=\"password\" class=\"sidebar-label\">Password <span class=\"side-bar-required-field\">*</span></label>\n" +
    "    <input required=\"true\" type=\"password\" name=\"password\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.password\" ng-change=\"onChange()\"/>\n" +
    "    <span class=\"field-validation-error\"></span>\n" +
    "  </p>\n" +
    "</div>\n"
  );

}]);
