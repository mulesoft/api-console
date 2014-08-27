'use strict';

(function() {
  RAML.Settings = RAML.Settings || {};

  var location = window.location;
  var uri      = location.protocol + '//' + location.host + location.pathname.replace(/\/$/, '');

  RAML.Settings.proxy = RAML.Settings.proxy || false;
  RAML.Settings.oauth2RedirectUri = RAML.Settings.oauth2RedirectUri || uri + '/authentication/oauth2.html';
  RAML.Settings.oauth1RedirectUri = RAML.Settings.oauth1RedirectUri || uri + '/authentication/oauth2.html';
})();
