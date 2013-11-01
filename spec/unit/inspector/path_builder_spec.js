describe("RAML.Inspector.PathBuilder", function() {
  describe("creation", function() {
    describe("by default", function() {
      beforeEach(function() {
        this.pathSegments = ["/resource"];
        this.pathBuilder = RAML.Inspector.PathBuilder.create(this.pathSegments);
      });

      it("returns a template function", function() {
        expect(typeof this.pathBuilder).toBe("function");
      });

      it("maps the segments", function() {
        expect(this.pathBuilder.segments).toHaveLength(this.pathSegments.length);
      });
    });

    describe("with a regular segment", function() {
      beforeEach(function() {
        this.pathSegments = ["/resource"];
        this.segment = RAML.Inspector.PathBuilder.create(this.pathSegments).segments[0];
      });

      it("is not templated", function() {
        expect(this.segment.templated).toBe(false);
      });
    });

    describe("with a templated segment", function() {
      beforeEach(function() {
        this.pathSegments = [templatedSegment('resource', {required: true})];
        this.segment = RAML.Inspector.PathBuilder.create(this.pathSegments).segments[0];
      });

      it("is templated", function() {
        expect(this.segment.templated).toBe(true);
      });

      it("is extracts the parameter name", function() {
        expect(this.segment.parameterName).toBe("resource");
      });

      it("exposes the underlying path segment's properties", function() {
        expect(this.segment.required).toEqual(true);
      });
    });
  });

  describe("creating a url from the template", function() {
    describe("with no templated segments", function() {
      beforeEach(function() {
        this.pathSegments = ["/first", "/resource"];
        this.pathBuilder = RAML.Inspector.PathBuilder.create(this.pathSegments);
      });

      it("concatenates the path segments", function() {
        expect(this.pathBuilder()).toEqual("/first/resource")
      });
    });

    describe("with templated segments", function() {
      beforeEach(function() {
        var templated = templatedSegment('resourceId', {required: true});
        this.pathSegments = ['/resource', templated];
        this.pathBuilder = RAML.Inspector.PathBuilder.create(this.pathSegments);
      });

      describe("with a complete template data", function() {
        beforeEach(function() {
          this.renderedPath = this.pathBuilder({resourceId: "1"});
        });

        it("substitutes templated values and concatenates the path segments", function() {
          expect(this.renderedPath).toEqual("/resource/1");
        });
      });

      describe("with missing template data", function() {
        it("throws", function() {
          var pathBuilder = this.pathBuilder;
          expect(function() { pathBuilder(); }).toThrow("Missing template data");
        });
      });
    });
  });
});
