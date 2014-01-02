(function() {
  'use strict';

  var BodyType = function(contentType) {
    this.contentType = contentType || {};
    this.value = undefined;
  };

  BodyType.prototype.fillWithExample = function() {
    this.value = this.contentType.example;
  };

  BodyType.prototype.hasExample = function() {
    return !!this.contentType.example;
  };

  BodyType.prototype.data = function() {
    return this.value;
  };

  BodyType.prototype.copyFrom = function(oldBodyType) {
    this.value = oldBodyType.value;
  };

  RAML.Controllers.TryIt.BodyType = BodyType;
})();
