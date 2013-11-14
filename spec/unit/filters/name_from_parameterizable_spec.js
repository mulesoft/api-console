describe("RAML.Filters.nameFromParameterizable", function() {
  var filter;

  beforeEach(function() {
    filter = RAML.Filters.nameFromParameterizable();
  });

  describe("given a string", function() {
    it("returns the string", function() {
      expect(filter("someTrait")).toEqual("someTrait");
    });
  });

  describe("given a single-keyed object", function() {
    it("returns the key", function() {
      var someParameterizableTrait = {
        someParameterizableTrait: {
          someParamaterName: 'someParameterValue'
        }
      };
      expect(filter(someParameterizableTrait)).toEqual("someParameterizableTrait");
    });
  });

  describe("given a falsy input", function() {
    it("returns undefined", function() {
      expect(filter(undefined)).toEqual(undefined);
      expect(filter(null)).toEqual(undefined);
      expect(filter('')).toEqual(undefined);
    });
  });
});
