describe("RAML.Client.Validator", function() {
  var definition, errors, validator;

  beforeEach(function() {
    this.addMatchers({
      toContainError: function(expected) {
        return (this.actual || []).some(function(error) {
          return error === expected;
        });
      }
    });
  });

  describe("creating a validator from a RAML definition", function() {
    describe("by default", function() {
      beforeEach(function() {
        definition = { type: 'string', required: true };
        validator = RAML.Client.Validator.from(definition);
      });

      it("returns a thing with a validate function", function() {
        expect(typeof validator.validate).toBe('function');
      });
    });

    describe("with no constraint", function() {
      it("returns a thing with a validate function", function() {
        expect(function() {
          RAML.Client.Validator.from();
        }).toThrow();
      });
    });
  });

  describe("when the input is required", function() {
    beforeEach(function() {
      definition = { type: 'string', required: true };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with data", function() {
      it("has no errors", function() {
        expect(validator.validate("present")).toBeUndefined();
      });
    });

    describe("without data", function() {
      it("includes required in the errors", function() {
        expect(validator.validate("")).toContainError('required');
      });
    });
  });

  describe("when the input is optional", function() {
    beforeEach(function() {
      definition = { type: 'string', required: false };
      validator = RAML.Client.Validator.from(definition);
      errors = validator.validate("");
    });

    it("has no errors", function() {
      expect(errors).toBeUndefined();
    });
  });

  describe("when the input is of type boolean", function() {
    beforeEach(function() {
      definition = { type: 'boolean' };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with valid values", function() {
      it("has no errors", function() {
        expect(validator.validate('true')).toBeUndefined();
        expect(validator.validate('false')).toBeUndefined();
      });
    });

    describe("with an invalid value", function() {
      it("includes boolean in the errors", function() {
        expect(validator.validate('cats')).toContainError('boolean');
      });
    });

    describe("with an empty value", function() {
      it("has no errors", function() {
        expect(validator.validate('')).toBeUndefined();
      });
    });
  });

  describe("when the input is an enum", function() {
    beforeEach(function() {
      definition = { type: 'string', enum: ['cats', 'dogs'] };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with values listed in the enum", function() {
      it("has no errors", function() {
        expect(validator.validate('cats')).toBeUndefined();
      });
    });

    describe("with values not listed in the enum", function() {
      it("includes enum in the errors", function() {
        expect(validator.validate('horses')).toContainError('enum');
      });
    });
  });

  describe("when the input is an integer", function() {
    beforeEach(function() {
      definition = { type: 'integer' };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with an integer", function() {
      it("has no errors", function() {
        expect(validator.validate('2')).toBeUndefined();
      });
    });

    describe("with a negative integer", function() {
      it("has no errors", function() {
        expect(validator.validate('-2')).toBeUndefined();
      });
    });

    describe("with a floating point", function() {
      it("includes integer in the errors", function() {
        expect(validator.validate('2.0')).toContainError('integer');
      });
    });

    describe("with a 0-prefixed integer", function() {
      it("includes integer in the errors", function() {
        expect(validator.validate('02')).toContainError('integer');
      });
    });
  });

  describe("when the input is a number", function() {
    beforeEach(function() {
      definition = { type: 'number' };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with an number", function() {
      it("has no errors", function() {
        expect(validator.validate('2')).toBeUndefined();
      });
    });

    describe("with a negative number", function() {
      it("has no errors", function() {
        expect(validator.validate('-2')).toBeUndefined();
      });
    });

    describe("with a floating point", function() {
      it("has no errors", function() {
        expect(validator.validate('2.0')).toBeUndefined();
      });
    });

    describe("with a 0-prefixed number", function() {
      it("includes number in the errors", function() {
        expect(validator.validate('02')).toContainError('number');
      });
    });
  });

  describe("when the input is an unknown type", function() {
    beforeEach(function() {
      definition = { type: 'explode' };
    });

    it("ignores it", function() {
      expect(function() {
        RAML.Client.Validator.from(definition);
      }).not.toThrow();
    });


    it("returns a thing with a validate function", function() {
      var validator = RAML.Client.Validator.from(definition);
      expect(typeof validator.validate).toBe('function');
    });

  });
});
