'use strict';

(function() {
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
  }

  var apply;

  var TryIt = function($scope, DataStore) {
    $scope.apiClient = this;

    var baseKey = $scope.resource.toString() + ':' + $scope.method.method;
    $scope.baseKey = function() {
      return baseKey;
    };

    var contextKey = baseKey + ':context';
    var responseKey = baseKey + ':response';

    var context = new RAML.Controllers.TryIt.Context($scope.resource, $scope.method);
    var oldContext = DataStore.get(contextKey);

    if (oldContext) {
      context.merge(oldContext);
    }

    this.context = $scope.context = context;
    this.response = DataStore.get(responseKey);

    DataStore.set(contextKey, this.context);

    this.method = $scope.method;
    this.httpMethod = $scope.method.method;
    this.parsed = $scope.api;
    this.securitySchemes = $scope.method.securitySchemes();
    this.keychain = $scope.ramlConsole.keychain;

    apply = function() {
      $scope.$apply.apply($scope, arguments);
    };

    this.setResponse = function(response) {
      DataStore.set(responseKey, response);
      $scope.apiClient.response = response;
      return response;
    };
  };

  TryIt.prototype.inProgress = function() {
    return (this.response && !this.response.status && !this.missingUriParameters);
  };

  TryIt.prototype.execute = function() {
    this.missingUriParameters = false;
    this.disallowedAnonymousRequest = false;

    var response = this.setResponse({});

    function handleResponse(jqXhr) {
      response.body = jqXhr.responseText,
      response.status = jqXhr.status,
      response.headers = parseHeaders(jqXhr.getAllResponseHeaders());

      if (response.headers['content-type']) {
        response.contentType = response.headers['content-type'].split(';')[0];
      }
      apply();
    }

    var url;
    try {
      var pathBuilder = this.context.pathBuilder;
      var client = RAML.Client.create(this.parsed, function(client) {
        client.baseUriParameters(pathBuilder.baseUriContext);
      });
      url = response.requestUrl = client.baseUri + pathBuilder(pathBuilder.segmentContexts);
    } catch (e) {
      this.setResponse(undefined);
      this.missingUriParameters = true;
      return;
    }

    var request = RAML.Client.Request.create(url, this.httpMethod);

    if (!RAML.Utils.isEmpty(this.context.queryParameters.data())) {
      request.queryParams(this.context.queryParameters.data());
    }

    if (!RAML.Utils.isEmpty(this.context.headers.data())) {
      request.headers(this.context.headers.data());
    }

    if (this.context.bodyContent) {
      request.header('Content-Type', this.context.bodyContent.selected);
      request.data(this.context.bodyContent.data());
    }

    var authStrategy;

    try {
      if (this.keychain.selected === 'Anonymous' && !this.method.allowsAnonymousAccess()) {
        this.disallowedAnonymousRequest = true;
      }

      var scheme = this.securitySchemes && this.securitySchemes[this.keychain.selected];
      var credentials = this.keychain[this.keychain.selected];
      authStrategy = RAML.Client.AuthStrategies.for(scheme, credentials);
    } catch (e) {
      // custom strategies aren't supported yet.
    }

    authStrategy.authenticate().then(function(token) {
      token.sign(request);
      $.ajax(request.toOptions()).then(
        function(data, textStatus, jqXhr) { handleResponse(jqXhr); },
        function(jqXhr) { handleResponse(jqXhr); }
      );
    });
  };

  RAML.Controllers.TryIt = TryIt;
})();
