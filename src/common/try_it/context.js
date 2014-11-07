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
