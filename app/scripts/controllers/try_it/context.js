(function() {
  'use strict';

  var Context = function(method) {
    this.headers = new RAML.Controllers.TryIt.NamedParameters(method.headers.plain, method.headers.parameterized);
    this.queryParameters = new RAML.Controllers.TryIt.NamedParameters(method.queryParameters);
    if (method.body) {
      this.bodyContent = new RAML.Controllers.TryIt.BodyContent(method.body);
    }
  };

  Context.prototype.merge = function(oldContext) {
    this.headers.copyFrom(oldContext.headers);
    this.queryParameters.copyFrom(oldContext.queryParameters);
    if (this.bodyContent && oldContext.bodyContent) {
      this.bodyContent.copyFrom(oldContext.bodyContent);
    }
  };

  RAML.Controllers.TryIt.Context = Context;
})();
