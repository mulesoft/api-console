(function() {
  'use strict';

  var NamedParameter = function(definitions) {
    this.definitions = definitions;
    this.selected = definitions[0].type;
  };

  NamedParameter.prototype.hasMultipleTypes = function() {
    return this.definitions.length > 1;
  };

  NamedParameter.prototype.isSelected = function(definition) {
    return this.selected === definition.type;
  };

  RAML.Controllers.TryIt.NamedParameter = NamedParameter;
})();
