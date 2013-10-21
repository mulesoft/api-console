(function() {
  RAML.Settings = RAML.Settings || {};

  var location = window.location;

  var uri = location.protocol + '//' + location.host + location.pathname + 'authentication/oauth2.html';
  RAML.Settings.oauth2RedirectUri = RAML.Settings.oauth2RedirectUri || uri;
})();
