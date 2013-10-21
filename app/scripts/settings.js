(function() {
  RAML.Settings = RAML.Settings || {};

  var uri = document.location.href.slice(0, document.location.href.indexOf('?')) + '/authentication/oauth2.html';
  RAML.Settings.oauth2RedirectUri = RAML.Settings.oauth2RedirectUri || uri;
})();
