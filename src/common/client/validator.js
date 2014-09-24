(function() {
  'use strict';

  // number regular expressions from http://yaml.org/spec/1.2/spec.html#id2804092

  var RFC1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;

  function isEmpty(value) {
    return value === null || value === undefined || value === '';
  }

  var VALIDATIONS = {
    required: function(value) { return !isEmpty(value); },
    boolean: function(value) { return isEmpty(value) || value === 'true' || value === 'false'; },
    enum: function(enumeration) {
      return function(value) {
        return isEmpty(value) || enumeration.some(function(item) { return item === value; });
      };
    },
    integer: function(value) { return isEmpty(value) || !!/^-?(0|[1-9][0-9]*)$/.exec(value); },
    number: function(value) { return isEmpty(value) || !!/^-?(0|[1-9][0-9]*)(\.[0-9]*)?([eE][-+]?[0-9]+)?$/.exec(value); },
    minimum: function(minimum) {
      return function(value) {
        return isEmpty(value) || value >= minimum;
      };
    },
    maximum: function(maximum) {
      return function(value) {
        return isEmpty(value) || value <= maximum;
      };
    },
    minLength: function(minimum) {
      return function(value) {
        return isEmpty(value) || value.length >= minimum;
      };
    },
    maxLength: function(maximum) {
      return function(value) {
        return isEmpty(value) || value.length <= maximum;
      };
    },
    pattern: function(pattern) {
      var regex = new RegExp(pattern);

      return function(value) {
        return isEmpty(value) || !!regex.exec(value);
      };
    },
    date: function(value) { return isEmpty(value) || !!RFC1123.exec(value); }
  };

  function baseValidations(definition) {
    var validations = {};

    if (definition.required) {
      validations.required = VALIDATIONS.required;
    }

    return validations;
  }

  function numberValidations(validations, definition) {
    if (definition.minimum) {
      validations.minimum = VALIDATIONS.minimum(definition.minimum);
    }

    if (definition.maximum) {
      validations.maximum = VALIDATIONS.maximum(definition.maximum);
    }
  }

  // function copyValidations(validations, types) {
  //   Object.keys(types).forEach(function(type) {
  //     validations[type] = VALIDATIONS[type](types[type]);
  //   });
  // }

  var VALIDATIONS_FOR_TYPE = {
    string: function(definition) {
      var validations = baseValidations(definition);
      if (definition.enum) {
        validations.enum = VALIDATIONS.enum(definition.enum);
      }
      if (definition.minLength) {
        validations.minLength = VALIDATIONS.minLength(definition.minLength);
      }
      if (definition.maxLength) {
        validations.maxLength = VALIDATIONS.maxLength(definition.maxLength);
      }
      if (definition.pattern) {
        validations.pattern = VALIDATIONS.pattern(definition.pattern);
      }
      return validations;
    },

    integer: function(definition) {
      var validations = baseValidations(definition);
      validations.integer = VALIDATIONS.integer;
      numberValidations(validations, definition);
      return validations;
    },

    number: function(definition) {
      var validations = baseValidations(definition);
      validations.number = VALIDATIONS.number;
      numberValidations(validations, definition);
      return validations;
    },

    boolean: function(definition) {
      var validations = baseValidations(definition);
      validations.boolean = VALIDATIONS.boolean;
      return validations;
    },

    date: function(definition) {
      var validations = baseValidations(definition);
      validations.date = VALIDATIONS.date;
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
