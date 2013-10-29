(function() {
  'use strict';

  var VALIDATIONS = {
    required: function(value) { return value !== null && value !== undefined && value !== ''; }
  };

  function Validator(validations) {
    this.validations = validations;
  }

  Validator.prototype.validate = function(value) {
    var errors;

    for (var validation in this.validations) {
      if (!this.validations[validation](value)) {
        errors = errors || [];
        errors.push(validation);
      }
    }

    return errors;
  };

  Validator.from = function(definition) {
    if (!definition) {
      throw new Error('definition is required!');
    }

    var validations = {};

    if (definition.required) {
      validations.required = VALIDATIONS.required;
    }

    return new Validator(validations);
  };

  RAML.Client.Validator = Validator;
})();
