(function() {
  'use strict';

  var FORM_URLENCODED = 'application/x-www-form-urlencoded';
  var FORM_DATA = 'multipart/form-data';

  var BodyContent = function(contentTypes) {
    this.contentTypes = Object.keys(contentTypes);
    this.selected = this.contentTypes[0];

    var definitions = this.definitions = {};
    this.contentTypes.forEach(function(contentType) {
      var definition = contentTypes[contentType] || {};

      switch (contentType) {
      case FORM_URLENCODED:
      case FORM_DATA:
        definitions[contentType] = new RAML.Controllers.TryIt.NamedParameters(definition.formParameters);
        break;
      default:
        definitions[contentType] = new RAML.Controllers.TryIt.BodyType(definition);
      }
    });
  };

  BodyContent.prototype.isForm = function(contentType) {
    return contentType === FORM_URLENCODED || contentType === FORM_DATA;
  };

  BodyContent.prototype.isSelected = function(contentType) {
    return contentType === this.selected;
  };

  BodyContent.prototype.fillWithExample = function($event) {
    $event.preventDefault();
    this.definitions[this.selected].fillWithExample();
  };

  BodyContent.prototype.hasExample = function(contentType) {
    return this.definitions[contentType].hasExample();
  };

  BodyContent.prototype.data = function() {
    if (this.selected) {
      return this.definitions[this.selected].data();
    }
  };

  BodyContent.prototype.copyFrom = function(oldContent) {
    var content = this;

    oldContent.contentTypes.forEach(function(contentType) {
      if (content.definitions[contentType]) {
        content.definitions[contentType].copyFrom(oldContent.definitions[contentType]);
      }
    });

    if (this.contentTypes.some(function(contentType) { return contentType === oldContent.selected; })) {
      this.selected = oldContent.selected;
    }
  };

  RAML.Controllers.TryIt.BodyContent = BodyContent;
})();
