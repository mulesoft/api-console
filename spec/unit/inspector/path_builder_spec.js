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
        this.pathSegments = ["/{resource}"];
        this.segment = RAML.Inspector.PathBuilder.create(this.pathSegments).segments[0];
      });

      it("is templated", function() {
        expect(this.segment.templated).toBe(true);
      });

      it("is extracts the parameter name", function() {
        expect(this.segment.parameterName).toBe("resource");
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
        this.pathSegments = ["/resource", "/{resourceId}"];
        this.pathBuilder = RAML.Inspector.PathBuilder.create(this.pathSegments);
      });

      it("substitues templated values and concatenates the path segments", function() {
        expect(this.pathBuilder({resourceId: "1"})).toEqual("/resource/1");
      });
    });
  });
});
