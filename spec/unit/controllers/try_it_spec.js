describe("RAML.Controllers.TryIt", function() {
  beforeEach(function() {
    this.scope = {
      api: { baseUri: "http://example.com" },
      method: { verb: "get", pathBuilder: function() { return "/resources/search" } }
    };

    this.httpService = jasmine.createSpyObj("$http", ["get"]);
    this.controller = new RAML.Controllers.TryIt(this.scope, this.httpService);
  });

  describe("initializing the controller", function() {
    it("assigns itself as the apiClient", function() {
      expect(this.scope.apiClient).toEqual(this.controller)
    });
  });

  describe("executing an API command", function() {
    beforeEach(function() {
      this.promise = jasmine.createSpyObj("promise", ['then']);
      this.getSpy = this.httpService.get;
      this.getSpy.andReturn(this.promise);
    });

    describe("by default", function() {
      beforeEach(function() {
        this.controller.execute();
      });

      it("executes the described method", function() {
        expect(this.getSpy).toHaveBeenCalledWith("http://example.com/resources/search", { params: {} });
      });
    });

    describe("on success", function() {
      beforeEach(function() {
        this.promise.then.andCallFake(function(success) {
          var headers = function() {
            return {'X-Custom-Header': 'value'};
          };
          success({ data: 'Hello world.', status: 200, headers: headers});
        });

        this.controller.execute();
      });

      it("assigns body to the response", function() {
        expect(this.controller.response.body).toEqual('Hello world.');
      });

      it("assigns status to the response", function() {
        expect(this.controller.response.status).toEqual(200);
      });

      it("assigns headers to the response", function() {
        expect(this.controller.response.headers).toEqual({'X-Custom-Header': 'value'});
      });
    });
  });
});
