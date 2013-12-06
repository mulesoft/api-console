describe("RAML.Client.Validator", function() {
  var definition, errors, validator;

  beforeEach(function() {
    this.addMatchers({
      toContainError: function(expected) {
        return (this.actual || []).some(function(error) {
          return error === expected;
        });
      },
      toAcceptValues: function() {
        var validator = this.actual;
        var values = Array.prototype.slice.call(arguments, 0);
        return values.every(function(value) {
          return validator.validate(value) === undefined;
        })
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
      definition = { type: 'string', required: true, minLength: 5 };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with data", function() {
      it("has no errors", function() {
        expect(validator.validate('present')).toBeUndefined();
      });
    });

    describe("without data", function() {
      it("includes required in the errors", function() {
        expect(validator.validate('')).toContainError('required');
        expect(validator.validate('')).not.toContainError('minLength');
      });
    });
  });

  describe("when the input is optional", function() {
    beforeEach(function() {
      definition = { type: 'string', required: false };
      validator = RAML.Client.Validator.from(definition);
    });

    it("has no errors", function() {
      expect(validator.validate('')).toBeUndefined();
      expect(validator.validate(undefined)).toBeUndefined();
    });
  });

  describe("when the input is of type string", function() {
    describe("when the input is an enum", function() {
      beforeEach(function() {
        definition = { type: 'string', enum: ['cats', 'dogs'] };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with values listed in the enum or an empty string", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('cats', 'dogs', '');
        });
      });

      describe("with values not listed in the enum", function() {
        it("includes enum in the errors", function() {
          expect(validator.validate('horses')).toContainError('enum');
        });
      });
    });

    describe("with a pattern specified", function() {
      beforeEach(function() {
        definition = { type: 'string', pattern: "^\\w+$" };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with a value that matches the expression or an empty string", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('cats', '');
        });
      });

      describe("with a value that does not match the expression", function() {
        it("includes enum in the errors", function() {
          expect(validator.validate('^%$%')).toContainError('pattern');
        });
      });
    });

    describe("with a minLength", function() {
      beforeEach(function() {
        definition = { type: 'string', minLength: 3 };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with no value", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('', undefined);
        });
      });

      describe("with an string longer or the same as minLength", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('dog', 'cats');
        });
      });

      describe("with an string shorter than the minLength", function() {
        it("includes minLength in the errors", function() {
          expect(validator.validate('ox')).toContainError('minLength');
        });
      });
    });

    describe("with a maxLength", function() {
      beforeEach(function() {
        definition = { type: 'string', maxLength: 5 };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with no value", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('', undefined);
        });
      });

      describe("with a string shorter or the same as maxLength", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('horse', 'goat');
        });
      });

      describe("with a string longer than the maxLength", function() {
        it("includes maxLength in the errors", function() {
          expect(validator.validate('gopher')).toContainError('maxLength');
        });
      });
    });
  });

  describe("when the input is of type boolean", function() {
    beforeEach(function() {
      definition = { type: 'boolean' };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with valid values", function() {
      it("has no errors", function() {
        expect(validator).toAcceptValues('true', 'false', '', undefined, null);
      });
    });


    describe("with an invalid value", function() {
      it("includes boolean in the errors", function() {
        expect(validator.validate('cats')).toContainError('boolean');
      });
    });
  });

  describe("when the input is an integer", function() {
    describe("by default", function() {
      beforeEach(function() {
        definition = { type: 'integer' };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with a valid integer", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('2', '-2', '0', '');
        });
      });

      describe("with an invalid integer", function() {
        it("has errors", function() {
          expect(validator).not.toAcceptValues('2.0', '02');
        });

        it("includes integer in the errors", function() {
          expect(validator.validate('02')).toContainError('integer');
        });
      });
    });

    describe("with a minimum", function() {
      beforeEach(function() {
        definition = { type: 'integer', minimum: 3 };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with an integer greater than or equal to the minimum", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('3', '4', '');
        });
      });

      describe("with an integer less than the minimum", function() {
        it("includes minimum in the errors", function() {
          expect(validator.validate('2')).toContainError('minimum');
        });
      });
    });

    describe("with a maximum", function() {
      beforeEach(function() {
        definition = { type: 'integer', maximum: 3 };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with an integer less than or equal to the maximum", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('2', '3', '');
        });
      });

      describe("with an integer greater than the maximum", function() {
        it("includes maximum in the errors", function() {
          expect(validator.validate('4')).toContainError('maximum');
        });
      });
    });
  });

  describe("when the input is a number", function() {
    beforeEach(function() {
      definition = { type: 'number' };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with a valid number", function() {
      it("has no errors", function() {
        expect(validator).toAcceptValues('2', '-2', '2.0', '');
      });
    });

    describe("with an invalid number", function() {
      it("has errors", function() {
        expect(validator).not.toAcceptValues('02', '2.0.2');
      });

      it("includes number in the errors", function() {
        expect(validator.validate('02')).toContainError('number');
      });
    });

    describe("with a minimum", function() {
      beforeEach(function() {
        definition = { type: 'number', minimum: 3.5 };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with an number greater than or equal to the minimum", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('3.5', '3.6', '');
        });
      });

      describe("with an number less than the minimum", function() {
        it("includes minimum in the errors", function() {
          expect(validator.validate('3.4')).toContainError('minimum');
        });
      });
    });

    describe("with a maximum", function() {
      beforeEach(function() {
        definition = { type: 'number', maximum: 3.5 };
        validator = RAML.Client.Validator.from(definition);
      });

      describe("with a number less than or equal to the maximum", function() {
        it("has no errors", function() {
          expect(validator).toAcceptValues('3.4', '3.5', '');
        });
      });

      describe("with a number greater than the maximum", function() {
        it("includes maximum in the errors", function() {
          expect(validator.validate('3.6')).toContainError('maximum');
        });
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

  describe("when the input is a date", function() {
    beforeEach(function() {
      definition = { type: 'date' };
      validator = RAML.Client.Validator.from(definition);
    });

    describe("with a valid RFC1123 date", function() {
      it("has no errors", function() {
        expect(validator).toAcceptValues('Sun, 06 Nov 1994 08:49:37 GMT', '');
      });
    });

    describe("with some non-RFC1123 date formats ", function() {
      it("has errors", function() {
        expect(validator).not.toAcceptValues('Sunday, 06-Nov-94 08:49:37 GMT', 'Sun Nov  6 08:49:37 1994', '11/29/84');
      });
    });

    describe("with an invalid date", function() {
      it("includes date in the errors", function() {
        expect(validator.validate('not a date')).toContainError('date');
      });
    });
  });
});
