'use strict';

(function() {
  RAML.Settings = RAML.Settings || {};

  var location = window.location;

  var uri = location.protocol + '//' + location.host + location.pathname + 'authentication/oauth2.html';
  RAML.Settings.oauth2RedirectUri = RAML.Settings.oauth2RedirectUri || uri;
  RAML.Settings.oauth1RedirectUri = RAML.Settings.oauth1RedirectUri || uri.replace(/oauth2\.html$/, 'oauth1.html');

  // RAML.Settings.proxy = RAML.Settings.proxy || '/proxy/';
})();
