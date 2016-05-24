(function() {
  'use strict';

  var BodyType = function(contentType) {
    this.contentType = contentType || {};
    this.value = undefined;
  };

  BodyType.prototype.fillWithExample = function() {
    var example;
    if (this.contentType.examples) {
      example = this.contentType.examples[0].value;
    } else {
      example = this.contentType.example;
    }

    if (typeof example === 'object') {
      this.value = JSON.stringify(example);
    } else {
      this.value = example;
    }

  };

  BodyType.prototype.hasExample = function() {
    return !!this.contentType.example || !!this.contentType.examples;
  };

  BodyType.prototype.data = function() {
    return this.value;
  };

  BodyType.prototype.copyFrom = function(oldBodyType) {
    this.value = oldBodyType.value;
  };

  RAML.Services.TryIt.BodyType = BodyType;
})();
