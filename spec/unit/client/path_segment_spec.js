describe("RAML.Client.PathSegment", function() {
  var pathSegment, raml;

  function fakeResourceRAML(uri, uriParameters) {
    return {
      relativeUri: uri,
      uriParameters: uriParameters
    };
  };

  function fakeUriParameter(required) {
    if (required === undefined) {
      required = true;
    }

    return {
      required: required
    };
  };

  describe("creating from a relative uri", function() {
    beforeEach(function() {
      raml = fakeResourceRAML("/resource")
      pathSegment = RAML.Client.PathSegment.fromRAML(raml);
    });

    it("sets name to the relative uri stripped of the leading slash", function() {
      expect(pathSegment.name).toEqual("resource");
    });

    it("is not templated", function() {
      expect(pathSegment.templated).toBe(false);
    });

    it("has no parameters", function() {
      expect(pathSegment.parameters).toBeUndefined();
    });

    it("tokenizes the uri", function() {
      expect(pathSegment.tokens).toEqual(['resource']);
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
      pathSegment = RAML.Client.PathSegment.fromRAML(raml);
    });

    it("sets name to the relative uri stripped of the leading slash and braces", function() {
      expect(pathSegment.name).toEqual("templated-resource");
    });

    it("is templated", function() {
      expect(pathSegment.templated).toBe(true);
    });

    it("stores the parameter definitions for each templated section", function() {
      expect(pathSegment.parameters).toBe(uriParameters);
    });

    it("tokenizes the uri", function() {
      expect(pathSegment.tokens).toEqual(['templated', '-', 'resource']);
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
