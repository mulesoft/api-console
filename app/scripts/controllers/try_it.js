(function() {
  var FORM_URLENCODED = 'application/x-www-form-urlencoded';
  var FORM_DATA = 'multipart/form-data';

  function isEmpty(object) {
    return Object.keys(object || {}).length == 0;
  }

  TryIt = function($scope, $http) {
    this.baseUri = $scope.api.baseUri || '';
    this.pathBuilder = $scope.method.pathBuilder;

    this.http = $http;
    this.httpMethod = $scope.method.method;
    this.headers = {};
    this.queryParameters = {};
    this.formParameters = {};
    this.supportsCustomBody = this.supportsFormUrlencoded = this.supportsFormData = false;
    for (mediaType in $scope.method.body) {
      this.supportsMediaType = true;

      if (mediaType == FORM_URLENCODED) {
        this.supportsFormUrlencoded = true;
      } else if (mediaType == FORM_DATA) {
        this.supportsFormData = true;
      } else {
        this.supportsCustomBody = true;
      }
    }

    $scope.apiClient = this;
  };

  TryIt.prototype.showBody = function() {
    return this.supportsCustomBody && !this.showUrlencodedForm() && !this.showMultipartForm();
  }

  TryIt.prototype.showUrlencodedForm = function() {
    if (this.mediaType) {
      return this.mediaType == FORM_URLENCODED;
    } else {
      return (!this.supportsCustomBody && this.supportsFormUrlencoded);
    }
  }

  TryIt.prototype.showMultipartForm = function() {
    if (this.mediaType) {
      return this.mediaType == FORM_DATA
    } else  {
      return (!this.suppoprtsCustomBody && !this.supportsFormUrlencoded && this.supportsFormData);
    }
  }

  TryIt.prototype.execute = function() {
    var url = this.baseUri + this.pathBuilder(this.pathBuilder);
    var response = this.response = {};
    var requestOptions = { url: url, method: this.httpMethod }

    if (!isEmpty(this.queryParameters)) {
      requestOptions.params = this.queryParameters;
    }

    if (!isEmpty(this.formParameters)) {
      requestOptions.data = this.formParameters;
    }

    if (!isEmpty(this.headers)) {
      requestOptions.headers = this.headers;
    }

    if (this.mediaType) {
      requestOptions.headers = requestOptions || {};
      requestOptions.headers['Content-Type'] = this.mediaType;
      requestOptions.data = this.body;
    }

    this.http(requestOptions).then(function(httpResponse) {
      response.body = httpResponse.data;
      response.requestUrl = url,
      response.status = httpResponse.status,
      response.headers = httpResponse.headers();
      if (response.headers['content-type']) {
        response.contentType = response.headers['content-type'].split(';')[0];
      }
    });
  };

  RAML.Controllers.tryIt = TryIt;
})();
