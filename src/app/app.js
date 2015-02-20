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
  angular.module('ramlConsoleApp', [
    'RAML.Directives',
    'RAML.Services',
    'RAML.Security',
    'hc.marked',
    'ui.codemirror',
    'hljs'
  ]).config(function (hljsServiceProvider) {
    hljsServiceProvider.setOptions({
      classPrefix: 'raml-console-hljs-'
    });
  });

  var loc = window.location;
  var uri = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/$/, '');

  window.hljs.configure({
    classPrefix: 'raml-console-hljs-'
  });

  // Settings
  RAML.Settings.proxy             = RAML.Settings.proxy || false;
  RAML.Settings.oauth2RedirectUri = RAML.Settings.oauth2RedirectUri || uri + '/authentication/oauth2.html';
  RAML.Settings.oauth1RedirectUri = RAML.Settings.oauth1RedirectUri || uri + '/authentication/oauth1.html';
  RAML.Settings.marked            = {
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    silent: false,
    langPrefix: 'lang-',
    smartypants: false,
    headerPrefix: '',
    renderer: new window.marked.Renderer(),
    xhtml: false,
    highlight: function (code, lang) {
      var result = [
        '<pre class="raml-console-resource-pre raml-console-hljs hljs">',
        lang ? window.hljs.highlightAuto(code).value : code,
        '</pre>'
      ];

      return result.join('');
    }
  };
})(window);
