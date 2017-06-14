(function() {
  'use strict';

  var FORM_URLENCODED = 'application/x-www-form-urlencoded';
  var FORM_DATA = 'multipart/form-data';

  var BodyContent = function(contentTypes, types) {
    function toObjectArray(properties) {
      Object.keys(properties).forEach(function (property) {
        if (!Array.isArray(properties[property])) {
          properties[property].id = properties[property].name;
          properties[property] = [properties[property]];
        }
      });
      return properties;
    }

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
          //For RAML 0.8 formParameters should be defined, but for RAML 1.0 properties node
          if (definition.formParameters) {
            definitions[contentType] = new RAML.Services.TryIt.NamedParameters(definition.formParameters);
          } else {
            var type = definition.type[0];
            var isNativeType = RAML.Inspector.Types.isNativeType(type);

            var inlineProperties;
            if (definition.properties) {
              inlineProperties = toObjectArray(definition.properties);
            }

            var rootProperties;
            if (!isNativeType && types) {
              var rootType = RAML.Inspector.Types.findType(type, types);
              rootProperties = rootType && rootType.properties ? toObjectArray(rootType.properties) : undefined;
            }

            var properties = Object.assign({}, inlineProperties, rootProperties);
            definitions[contentType] = new RAML.Services.TryIt.NamedParameters(properties);
          }
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
      if (typeof info[key][0]['enum'] === 'undefined' || info[key][0].overwritten === true) {
        that.values[key] = [''];
      }
    });
  };

  BodyContent.prototype.reset = function (info, field) {
    var that = this.definitions[this.selected];
    if (info) {
      Object.keys(info).map(function (key) {
        if (typeof field === 'undefined' || field === key) {
          if (typeof info[key][0]['enum'] === 'undefined') {
            that.values[key][0] = info[key][0].example;
          }
        }
      });
    }
  };

  RAML.Services.TryIt.BodyContent = BodyContent;
})();
