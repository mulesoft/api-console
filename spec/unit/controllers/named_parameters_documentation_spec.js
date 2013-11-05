describe("RAML.Controllers.NamedParametersDocumentation", function() {
  var controller, parameter;

  beforeEach(function() {
    // Per the spec, there is always a displayName and type:
    //   If displayName is not specified, it defaults to the property's key
    //   If type is not specified, it defaults to string
    parameter = { displayName: 'displayName', type: 'string' };

    controller = new RAML.Controllers.NamedParametersDocumentation({});
  });

  describe("constraints", function() {
    var constraints;

    describe("given a required parameter", function() {
      beforeEach(function() {
        parameter.required = true;
        constraints = controller.constraints(parameter);
      });

      it("returns required, followed by the type", function() {
        expect(constraints).toEqual('required, string');
      });
    });

    describe("given an enumeration", function() {
      beforeEach(function() {
        parameter.enum = ['one', 'two', 'three'];
        constraints = controller.constraints(parameter);
      });

      it("returns a description of the enum", function() {
        expect(constraints).toEqual('one of (one, two, three)');
      });
    });

    describe("given a pattern", function() {
      beforeEach(function() {
        parameter.pattern = "/some regex/";
        constraints = controller.constraints(parameter);
      });

      it("returns the pattern", function() {
        expect(constraints).toEqual('string matching /some regex/');
      });
    });

    describe("minLength and maxLength", function() {
      describe("given a parameter only with minLength", function() {
        beforeEach(function() {
          parameter.minLength = "8";
          constraints = controller.constraints(parameter);
        });

        it("returns the minLength", function() {
          expect(constraints).toEqual('string, at least 8 characters');
        });
      });

      describe("given a parameter only with maxLength", function() {
        beforeEach(function() {
          parameter.maxLength = "8";
          constraints = controller.constraints(parameter);
        });

        it("returns the maxLength", function() {
          expect(constraints).toEqual('string, at most 8 characters');
        });
      });

      describe("given a minLength and maxLength", function() {
        beforeEach(function() {
          parameter.minLength = "8";
          parameter.maxLength = "20";
          constraints = controller.constraints(parameter);
        });

        it("displays the minLength and maxLength", function() {
          expect(constraints).toEqual('string, 8-20 characters');
        });
      });
    });

    describe("minimum and maximum", function() {
      describe("given a parameter with only a minimum", function() {
        beforeEach(function() {
          parameter.type = "integer";
          parameter.minimum = "8";
          constraints = controller.constraints(parameter);
        });

        it("displays the minimum", function() {
          expect(constraints).toEqual('integer ≥ 8');
        });
      });

      describe("given a parameter with only a maximum", function() {
        beforeEach(function() {
          parameter.type = "integer";
          parameter.maximum = "8";
          constraints = controller.constraints(parameter);
        });

        it("displays the maximum", function() {
          expect(constraints).toEqual('integer ≤ 8');
        });
      });

      describe("given a minimum and maximum", function() {
        beforeEach(function() {
          parameter.type = "integer";
          parameter.minimum = "8";
          parameter.maximum = "20";
          constraints = controller.constraints(parameter);
        });

        it("displays the minLength and maxLength", function() {
          expect(constraints).toEqual('integer between 8-20');
        });
      });
    });

    describe("repeat", function() {
      describe("when true", function() {
        beforeEach(function() {
          parameter.repeat = true;
          constraints = controller.constraints(parameter);
        });

        it("returns 'repeatable'", function() {
          expect(constraints).toEqual('string, repeatable');
        });
      });

      describe("when false", function() {
        beforeEach(function() {
          parameter.repeat = false;
          constraints = controller.constraints(parameter);
        });

        it("displays nothing", function() {
          expect(constraints).toEqual('string');
        });
      });
    });

    it("returns default", function() {
      parameter.default = "some default value";
      constraints = controller.constraints(parameter);
      expect(constraints).toEqual('string, default: some default value');
    });

  });
});
