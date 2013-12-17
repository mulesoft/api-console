describe("RAML.Controllers.TryIt.NamedParameters", function() {
  var parameters, plain, parameterized;

  beforeEach(function() {
    plain = {
      "Accept" : { type: "string" }
    }

    parameterized = {
      "X-{*}" : RAML.Inspector.ParameterizedHeader.fromRAML("X-{*}", { type: "string" })
    }

    parameters = new RAML.Controllers.TryIt.NamedParameters(plain, parameterized)
  });

  describe("creating a header", function() {
    beforeEach(function() {
      parameters.create("X-{*}", "test")
    });

    it("adds the new header to the plain collection", function() {
      expect(parameters.plain["X-test"]).toBeDefined();
      expect(parameters.values["X-test"]).toEqual(['test']);
    });

    it("does not modify the backing  plain collection", function() {
      expect(plain["X-test"]).not.toBeDefined();
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
});
