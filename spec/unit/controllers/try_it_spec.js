describe("RAML.Controllers.tryIt", function() {
  beforeEach(function() {
    this.scope = {
      api: { baseUri: "http://example.com" },
      method: { verb: "get", pathBuilder: function() { return "/resources/search" } }
    };

    this.httpService = jasmine.createSpyObj("$http", ["get"]);
    this.controller = new RAML.Controllers.tryIt(this.scope, this.httpService);
  });

  describe("upon initialization", function() {
    it("assigns itself as the apiClient", function() {
      expect(this.scope.apiClient).toEqual(this.controller);
    });

    it("does not have query parameters", function() {
      expect(this.controller.hasQueryParameters()).toBeFalsy();
    });
  });

  describe("upon initialization with query params", function() {
    beforeEach(function() {
      this.scope.method.queryParameters = { query: null };
      this.controller = new RAML.Controllers.tryIt(this.scope, this.httpService);
    });

    it("has query parameters", function() {
      expect(this.controller.hasQueryParameters()).toBeTruthy();
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
        expect(this.getSpy).toHaveBeenCalledWith("http://example.com/resources/search", { });
      });
    });

    describe("on success", function() {
      beforeEach(function() {
        this.promise.then.andCallFake(function(success) {
          var headers = function() {
            return { 'content-type': 'application/json; charset=utf-8', 'X-Custom-Header': 'value'};
          };
          success({ data: 'Hello world.', status: 200, headers: headers});
        });

        this.controller.execute();
      });

      it("assigns the request URL to the response", function() {
        expect(this.controller.response.requestUrl).toEqual('http://example.com/resources/search');
      });

      it("assigns body to the response", function() {
        expect(this.controller.response.body).toEqual('Hello world.');
      });

      it("assigns status to the response", function() {
        expect(this.controller.response.status).toEqual(200);
      });

      it("assigns headers to the response", function() {
        expect(this.controller.response.headers['X-Custom-Header']).toEqual('value');
      });

      it("assigns contentType to the response", function() {
        expect(this.controller.response.contentType).toEqual('application/json');
      });
    });

    describe("with a JSON object in the response", function() {
      beforeEach(function() {
        this.promise.then.andCallFake(function(success) {
          var noHeaders = function() { return {} };
          success({ data: { hello: 'world' }, headers: noHeaders });
        });

        this.controller.execute();
      });

      it("re-stringifies the JSON in the response data", function() {
        expect(this.controller.response.body).toMatch(/\{\s+"hello": "world"\s+\}/);
      });
    });
  });
});
