describe("RAML.Client.Validator", function() {
  var definition, errors, validator;

  describe("creating a validator from a RAML definition", function() {
    describe("by default", function() {
      beforeEach(function() {
        definition = { required: true };
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
    describe("with data", function() {
      beforeEach(function() {
        definition = { required: true };
        validator = RAML.Client.Validator.from(definition);
        errors = validator.validate("present");
      });

      it("has no errors", function() {
        expect(errors).toBeUndefined();
      });
    });

    describe("without data", function() {
      beforeEach(function() {
        definition = { required: true };
        validator = RAML.Client.Validator.from(definition);
        errors = validator.validate("");
      });

      it("has errors", function() {
        expect(errors).toBeDefined();
      });

      it("includes required in the errors", function() {
        expect(errors).toContain('required');
      });
    });
  });

  describe("when the input is optional", function() {
    beforeEach(function() {
      definition = { required: false };
      validator = RAML.Client.Validator.from(definition);
      errors = validator.validate("");
    });

    it("has no errors", function() {
      expect(errors).toBeUndefined();
    });
  });

  describe("when the input is of type boolean", function() {
    describe("with valid values", function() {
      beforeEach(function() {
        definition = { type: 'boolean' };
        validator = RAML.Client.Validator.from(definition);
      });

      it("has no errors", function() {
        expect(validator.validate('true')).toBeUndefined();
        expect(validator.validate('false')).toBeUndefined();
      });
    });

    describe("with an invalid value", function() {
      beforeEach(function() {
        definition = { type: 'boolean' };
        validator = RAML.Client.Validator.from(definition);
        errors = validator.validate('cats');
      });

      it("has errors", function() {
        expect(errors).toBeDefined();
      });

      it("includes boolean in the errors", function() {
        expect(errors).toContain('boolean');
      });
    });

    describe("with an empty value", function() {
      beforeEach(function() {
        definition = { type: 'boolean' };
        validator = RAML.Client.Validator.from(definition);
      });

      it("has no errors", function() {
        expect(validator.validate('')).toBeUndefined();
      });
    });
  });

  describe("when the input is an enum", function() {
    describe("with values listed in the enum", function() {
      beforeEach(function() {
        definition = { type: 'string', enum: ['cats', 'dogs'] };
        validator = RAML.Client.Validator.from(definition);
        errors = validator.validate('cats');
      });

      it("has no errors", function() {
        expect(errors).toBeUndefined();
      });
    });

    describe("with values not listed in the enum", function() {
      beforeEach(function() {
        definition = { type: 'string', enum: ['cats', 'dogs'] };
        validator = RAML.Client.Validator.from(definition);
        errors = validator.validate('horses');
      });

      it("has errors", function() {
        expect(errors).toBeDefined();
      });

      it("includes enum in the errors", function() {
        expect(errors).toContain('enum');
      });
    });
  });

  describe("when the input is an integer", function() {
    beforeEach(function() {
      definition = { type: 'integer' };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with an integer", function() {
      beforeEach(function() {
        errors = validator.validate('2');
      });

      it("has no errors", function() {
        expect(errors).toBeUndefined();
      });
    });

    describe("with a negative integer", function() {
      beforeEach(function() {
        errors = validator.validate('-2');
      });

      it("has no errors", function() {
        expect(errors).toBeUndefined();
      });
    });

    describe("with a floating point", function() {
      beforeEach(function() {
        errors = validator.validate('2.0');
      });

      it("has errors", function() {
        expect(errors).toBeDefined();
      });

      it("includes integer in the errors", function() {
        expect(errors).toContain('integer');
      });
    });

    describe("with a 0-prefixed integer", function() {
      beforeEach(function() {
        errors = validator.validate('02');
      });

      it("has errors", function() {
        expect(errors).toBeDefined();
      });

      it("includes integer in the errors", function() {
        expect(errors).toContain('integer');
      });
    });
  });

describe("when the input is an enum", function() {
  describe("with values listed in the enum", function() {
    beforeEach(function() {
      definition = { type: 'string', enum: ['cats', 'dogs'] };
      validator = RAML.Client.Validator.from(definition);
      errors = validator.validate('cats');
    });

    it("has no errors", function() {
      expect(errors).toBeUndefined();
    });
  });

  describe("with values not listed in the enum", function() {
    beforeEach(function() {
      definition = { type: 'string', enum: ['cats', 'dogs'] };
      validator = RAML.Client.Validator.from(definition);
      errors = validator.validate('horses');
    });

    it("has errors", function() {
      expect(errors).toBeDefined();
    });

    it("includes enum in the errors", function() {
      expect(errors).toContain('enum');
    });
  });
});

describe("when the input is a number", function() {
  beforeEach(function() {
    definition = { type: 'number' };
    validator = RAML.Client.Validator.from(definition);
  });

  describe("with an number", function() {
    beforeEach(function() {
      errors = validator.validate('2');
    });

    it("has no errors", function() {
      expect(errors).toBeUndefined();
    });
  });

  describe("with a negative number", function() {
    beforeEach(function() {
      errors = validator.validate('-2');
    });

    it("has no errors", function() {
      expect(errors).toBeUndefined();
    });
  });

  describe("with a floating point", function() {
    beforeEach(function() {
      errors = validator.validate('2.0');
    });

    it("has no errors", function() {
      expect(errors).toBeUndefined();
    });
  });

  describe("with a 0-prefixed number", function() {
    beforeEach(function() {
      errors = validator.validate('02');
    });

    it("has errors", function() {
      expect(errors).toBeDefined();
    });

    it("includes number in the errors", function() {
      expect(errors).toContain('number');
    });
  });
});
});
