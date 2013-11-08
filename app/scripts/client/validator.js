(function() {
  'use strict';

  // number regular expressions from http://yaml.org/spec/1.2/spec.html#id2804092

  var VALIDATIONS = {
    required: function(value) { return value !== null && value !== undefined && value !== ''; },
    boolean: function(value) { return value === 'true' || value === 'false' || value === ''; },
    enum: function(enumeration) {
      return function(value) {
        return enumeration.some(function(item) { return item === value; });
      };
    },
    integer: function(value) { return !!/^-?(0|[1-9][0-9]*)$/.exec(value); },
    number: function(value) { return !!/^-?(0|[1-9][0-9]*)(\.[0-9]*)?([eE][-+]?[0-9]+)?$/.exec(value); }

  };

  function baseValidations(definition) {
    var validations = {};

    if (definition.required) {
      validations.required = VALIDATIONS.required;
    }

    return validations;
  }

  var VALIDATIONS_FOR_TYPE = {
    string: function(definition) {
      var validations = baseValidations(definition);
      if (definition.enum) {
        validations.enum = VALIDATIONS.enum(definition.enum);
      }
      return validations;
    },

    integer: function(definition) {
      var validations = baseValidations(definition);
      validations.integer = VALIDATIONS.integer;
      return validations;
    },

    number: function(definition) {
      var validations = baseValidations(definition);
      validations.number = VALIDATIONS.number;
      return validations;
    },

    boolean: function(definition) {
      var validations = baseValidations(definition);
      validations.boolean = VALIDATIONS.boolean;
      return validations;
    }
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

    var validations;

    if (VALIDATIONS_FOR_TYPE[definition.type]) {
      validations = VALIDATIONS_FOR_TYPE[definition.type](definition);
    } else {
      validations = {};
    }

    return new Validator(validations);
  };

  RAML.Client.Validator = Validator;
})();
