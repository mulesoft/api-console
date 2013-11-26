describe("RAML.Client.ParameterizedString", function() {
  var pathSegment, raml;

  describe("creating from a string with no parameters", function() {
    beforeEach(function() {
      raml = fakeResourceRAML("/resource")
      pathSegment = new RAML.Client.ParameterizedString(raml.relativeUri, raml.uriParameters);
    });

    it("has no parameters", function() {
      expect(pathSegment.parameters).toBeUndefined();
    });

    it("is not templated", function() {
      expect(pathSegment.templated).toBe(false);
    });

    it("tokenizes the uri", function() {
      expect(pathSegment.tokens).toEqual(['/resource']);
    });

    it("renturns the original segment when rendered", function() {
      expect(pathSegment.render()).toEqual('/resource');
    });
  });

  describe("creating from a string with parameters", function() {
    var uriParameters;

    beforeEach(function() {
      uriParameters = {
        templated: fakeUriParameter(),
        resource: fakeUriParameter(false)
      };

      raml = fakeResourceRAML("/{templated}-{resource}", uriParameters)
      pathSegment = new RAML.Client.ParameterizedString(raml.relativeUri, raml.uriParameters);
    });

    it("is templated", function() {
      expect(pathSegment.templated).toBe(true);
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

  describe("optionally prefilling some parameters", function() {
    var uriParameters;

    beforeEach(function() {
      uriParameters = {
        templated: fakeUriParameter()
      };

      raml = fakeResourceRAML("/{templated}-{resource}", uriParameters)
      pathSegment = new RAML.Client.ParameterizedString(raml.relativeUri, raml.uriParameters, { parameterValues: { resource: 'things'}});
    });

    it("stores the parameter definitions for each templated section", function() {
      expect(pathSegment.parameters).toBe(uriParameters);
    });

    it("tokenizes the uri", function() {
      expect(pathSegment.tokens).toEqual(['/', 'templated', '-things']);
    });

    it("", function() {
      expect(pathSegment.toString()).toEqual("/{templated}-things");
    });
  });
})
