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
  angular.module('ramlConsoleApp', ['RAML.Directives', 'RAML.Services', 'RAML.Security', 'hc.marked', 'ui.codemirror', 'hljs']);

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
