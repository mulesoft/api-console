describe("RAML.Client.Validator", function() {
  var definition, validator;

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
    var errors;

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
});
