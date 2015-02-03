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

  var renderer = new window.marked.Renderer();
  var loc      = window.location;
  var uri      = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/$/, '');

  window.hljs.configure({
    classPrefix: 'raml-console-hljs-'
  });

  window.marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code, lang) {
      var result = [
        '<pre class="raml-console-resource-pre">',
        ' <code class="raml-console-hljs"',
        '  <pre>',
        '   <code class="hljs">',
        lang ? window.hljs.highlightAuto(code).value : code,
        '   </code>',
        '  </pre>',
        ' </code>',
        '</pre>'
      ];

      return result.join('');
    }
  });

  // Settings
  RAML.Settings.proxy             = RAML.Settings.proxy || false;
  RAML.Settings.oauth2RedirectUri = RAML.Settings.oauth2RedirectUri || uri + '/authentication/oauth2.html';
  RAML.Settings.oauth1RedirectUri = RAML.Settings.oauth1RedirectUri || uri + '/authentication/oauth1.html';
})(window);
