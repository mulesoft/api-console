describe("RAML.Controllers.TryIt.NamedParameters", function() {
  var parameters, plain, parameterized;

  beforeEach(function() {
    plain = {
      "Accept" : [ { type: "string" } ]
    }

    parameterized = {
      "X-{*}" : [ RAML.Inspector.ParameterizedHeader.fromRAML("X-{*}", { type: "string" }) ],
      "X-Custom-{*}" : [ RAML.Inspector.ParameterizedHeader.fromRAML("X-{*}", { type: "number" }) ]
    }

    parameters = new RAML.Controllers.TryIt.NamedParameters(plain, parameterized)
  });

  describe("creating a header", function() {
    beforeEach(function() {
      parameters.create("X-{*}", "test")
    });

    it("adds the new header to the plain collection", function() {
      expect(parameters.plain["X-test"]).toBeDefined();
      expect(parameters.values["X-test"]).toEqual([undefined]);
    });

    it("does not modify the backing  plain collection", function() {
      expect(plain["X-test"]).not.toBeDefined();
    });

    it("adds the new header to the created list", function() {
      expect(parameters.parameterized["X-{*}"].created).toEqual(["X-test"]);
    });
  });

  describe("removing a header", function() {
    beforeEach(function() {
      parameters.create("X-{*}", "test")
      parameters.remove("X-test")
    });

    it("removes the header from the plain collection", function() {
      expect(parameters.plain["X-test"]).not.toBeDefined();
      expect(parameters.values["X-test"]).not.toBeDefined();
    });
  });

  describe("retrieving data", function() {
    var data;

    it("initializes values as arrays", function() {
      parameters.values['Accept'].push('application/json');
      parameters.values['Accept'] = parameters.values['Accept'].concat(['text/plain', 'text/xml']);
      data = parameters.data();
      expect(data["Accept"]).toEqual(['application/json', 'text/plain', 'text/xml']);
    });

    it("filters empty values", function() {
      parameters.values['Accept'].push("");
      data = parameters.data();
      expect(data["Accept"]).not.toBeDefined();
    });
  });

  describe("copying data from old parameters", function() {
    var newParameters, newPlain, newParameterized;

    describe('when adding a new parameter', function() {
      beforeEach(function() {
        newPlain = {
          "Accept" : [ { type: "string" } ],
          "Content-Type" : [ { type: "string" } ]
        }

        newParameterized = {
          "X-{*}" : [ RAML.Inspector.ParameterizedHeader.fromRAML("X-{*}", { type: "string" }) ],
          "X-Custom-{*}" : [ RAML.Inspector.ParameterizedHeader.fromRAML("X-{*}", { type: "number" }) ]
        }

        newParameters = new RAML.Controllers.TryIt.NamedParameters(newPlain, newParameterized)
        parameters.values["Accept"] = "application/json";
        parameters.create("X-{*}", "Do-Not-Erase");
        parameters.values["X-Do-Not-Erase"] = "please";
        newParameters.copyFrom(parameters);
      });

      it('preserves values from the old parameters', function() {
        expect(newParameters.values["Accept"]).toEqual("application/json");
      });

      it('preserves parameter values derived from placeholder', function() {
        expect(newParameters.plain["X-Do-Not-Erase"]).toBeDefined();
        expect(newParameters.values["X-Do-Not-Erase"]).toEqual("please");
      });
    });

    describe('when removing a parameter', function() {
      beforeEach(function() {
        newPlain = {}
        newParameterized = {
          "X-Custom-{*}" : [ RAML.Inspector.ParameterizedHeader.fromRAML("X-{*}", { type: "number" }) ]
        }

        newParameters = new RAML.Controllers.TryIt.NamedParameters(newPlain, newParameterized)

        parameters.values["Accept"] = "application/json";
        parameters.create("X-{*}", "X-Please-Do-Erase");
        parameters.values["X-Please-Do-Erase"] = "please";

        newParameters.copyFrom(parameters);
      });

      it('removes values that are no longer present', function() {
        expect(newParameters.values["Accept"]).toBeUndefined();
      });

      it('removes parameter values derived from removed placeholder', function() {
        expect(newParameters.plain["X-Please-Do-Erase"]).toBeUndefined();
        expect(newParameters.values["X-Please-Do-Erase"]).toBeUndefined();
      });
    });
  });
});
