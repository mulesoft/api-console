(function() {
  'use strict';

  var jsonContentTypeRegex = /^application\/([\w!#\$%&\*`\-\.\^~]*\+)?json$/i;

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

  BodyType.prototype.isJsonContentType = function() {
    return jsonContentTypeRegex.test(this.contentType.contentType);
  };

  BodyType.prototype.isCapableOfSchemaBasedTemplates = function() {
    return this.isJsonContentType();
  };

  BodyType.prototype.fillWithSchemaBasedTemplate = function() {
    if (this.isJsonContentType()) {
      var template = jsonTemplateGenerator(JSON.parse(this.contentType.schema));
      this.value = JSON.stringify(template, 0, 2);
    }
  };

  BodyType.prototype.data = function() {
    return this.value;
  };

  BodyType.prototype.copyFrom = function(oldBodyType) {
    this.value = oldBodyType.value;
  };

  RAML.Controllers.TryIt.BodyType = BodyType;
})();
