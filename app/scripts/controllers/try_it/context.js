(function() {
  'use strict';

  var Context = function(resource, method) {
    this.headers = new RAML.Controllers.TryIt.NamedParameters(method.headers.plain, method.headers.parameterized);
    this.queryParameters = new RAML.Controllers.TryIt.NamedParameters(method.queryParameters);
    if (method.body) {
      this.bodyContent = new RAML.Controllers.TryIt.BodyContent(method.body);
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
    if (this.bodyContent && oldContext.bodyContent) {
      this.bodyContent.copyFrom(oldContext.bodyContent);
    }

    this.pathBuilder.baseUriContext = oldContext.pathBuilder.baseUriContext;
    this.pathBuilder.segmentContexts = oldContext.pathBuilder.segmentContexts;
  };

  RAML.Controllers.TryIt.Context = Context;
})();
