describe("RAML.Controllers.TryIt", function() {
  beforeEach(function() {
    this.scope = {
      api: { baseUri: "http://example.com" },
      resource: { pathSegments: ["/resources", "/search"] },
      method: { verb: "get" }
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


      spyOn(this.controller.handleResponse, 'bind').andReturn("marker");
      this.controller.execute();
    });

    it("executes the described method", function() {
      expect(this.getSpy).toHaveBeenCalledWith("http://example.com/resources/search");
    });

    it("delegates to handleResponse on success", function() {
      expect(this.promise.then).toHaveBeenCalledWith("marker");
    });
  });

  describe("handling an API response", function() {
    beforeEach(function() {
      var headers = function() {
        return {'X-Custom-Header': 'value'};
      };
      this.controller.handleResponse({ data: 'Hello world.', status: 200, headers: headers});
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
