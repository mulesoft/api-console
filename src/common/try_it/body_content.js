(function() {
  'use strict';

  var FORM_URLENCODED = 'application/x-www-form-urlencoded';
  var FORM_DATA = 'multipart/form-data';

  var BodyContent = function(contentTypes) {
    this.contentTypes = Object.keys(contentTypes).sort();
    this.selected = this.contentTypes[0];

    var definitions = this.definitions = {};
    this.contentTypes.forEach(function(contentType) {
      var definition = contentTypes[contentType] || {};

      if (definition.formParameters) {
        Object.keys(definition.formParameters).map(function (key) {
          definition.formParameters[key][0].id = key;
        });
      }

      switch (contentType) {
      case FORM_URLENCODED:
      case FORM_DATA:
        definitions[contentType] = new RAML.Services.TryIt.NamedParameters(definition.formParameters);
        break;
      default:
        definitions[contentType] = new RAML.Services.TryIt.BodyType(definition);
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

  BodyContent.prototype.clear = function (info) {
    var that = this.definitions[this.selected];
    Object.keys(this.values).map(function (key) {
      if (typeof info[key][0].enum === 'undefined' || info[key][0].overwritten === true) {
        that.values[key] = [''];
      }
    });
  };

  BodyContent.prototype.reset = function (info, field) {
    var that = this.definitions[this.selected];
    if (info) {
      Object.keys(info).map(function (key) {
        if (typeof field === 'undefined' || field === key) {
          if (typeof info[key][0].enum === 'undefined') {
            that.values[key][0] = info[key][0].example;
          }
        }
      });
    }
  };

  RAML.Services.TryIt.BodyContent = BodyContent;
})();
