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

    it("adds the new header to the plain collection", function() {
      expect(parameters.plain["X-test"]).not.toBeDefined();
    });
  });

  describe("retrieving data", function() {
    var data;

    beforeEach(function() {
      parameters.values['Accept'] = "";
      data = parameters.data();
    });

    it("filters empty values", function() {
      expect(data["Accept"]).not.toBeDefined();
    });
  });
});
