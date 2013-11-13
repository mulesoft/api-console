describe("RAML.Client.ParameterizedString", function() {
  var pathSegment, raml;

  describe("creating from a relative uri", function() {
    beforeEach(function() {
      raml = fakeResourceRAML("/resource")
      pathSegment = new RAML.Client.ParameterizedString(raml.relativeUri, raml.uriParameters);
    });

    it("has no parameters", function() {
      expect(pathSegment.parameters).toBeUndefined();
    });

    it("tokenizes the uri", function() {
      expect(pathSegment.tokens).toEqual(['/resource']);
    });

    it("renturns the original segment when rendered", function() {
      expect(pathSegment.render()).toEqual('/resource');
    });
  });

  describe("creating a path segment from a templated relative uri", function() {
    var uriParameters;

    beforeEach(function() {
      uriParameters = {
        templated: fakeUriParameter(),
        resource: fakeUriParameter(false)
      };

      raml = fakeResourceRAML("/{templated}-{resource}", uriParameters)
      pathSegment = new RAML.Client.ParameterizedString(raml.relativeUri, raml.uriParameters);
    });

    it("stores the parameter definitions for each templated section", function() {
      expect(pathSegment.parameters).toBe(uriParameters);
    });

    it("tokenizes the uri", function() {
      expect(pathSegment.tokens).toEqual(['/', 'templated', '-', 'resource']);
    });

    describe("rendering template", function() {
      describe("when all required parameter values are supplied", function() {
        it("replaces the segments with the supplied values when rendered", function() {
          expect(pathSegment.render({ templated: '1', resource: '2' })).toEqual("/1-2");
        });
      });

      describe("when required parameter values are missing", function() {
        it("throws", function() {
          expect(function() { pathSegment.render() }).toThrow('Missing required uri parameter: templated');
        });
      });

      describe("when optional parameter values are missing", function() {
        it("throws", function() {
          expect(pathSegment.render({ templated: '1' })).toEqual("/1-");
        });
      });
    });
  });
})
