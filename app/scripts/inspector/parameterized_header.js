(function () {
  'use strict';

  function validate(value) {
    value = value ? value.trim() : '';

    if (value === '') {
      throw new Error();
    }

    return value;
  }

  function fromRAML(name, definition) {
    var parameterizedString = new RAML.Client.ParameterizedString(name, definition);

    return {
      create: function(value) {
        value = validate(value);

        var header = RAML.Utils.clone(definition);
        header.displayName = parameterizedString.render({'*': value});

        return header;
      },
      definition: function() {
        return definition;
      }
    };
  }

  RAML.Inspector.ParameterizedHeader = {
    fromRAML: fromRAML
  };
})();
