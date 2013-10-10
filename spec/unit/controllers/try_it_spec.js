describe("RAML.Controllers.tryIt", function() {
  var scope, httpService, controller;

  function createMethod(method, options) {
    method = method || "get";
    options = options || {};

    var body = {};
    if (options.body) {
      options.body.forEach(function(mediaType) { body[mediaType] = {} });
    }

    return {
      method: method,
      pathBuilder: function() { return "/resources/search" },
      body: body
    }
  }

  beforeEach(function() {
    httpService = jasmine.createSpy();
  });

  describe("upon initialization", function() {
    describe('by default', function() {
      beforeEach(function() {
        scope = {
          api: { baseUri: "http://example.com" },
          method: createMethod()
        };

        controller = new RAML.Controllers.tryIt(scope, httpService);
      });

      it("assigns itself as the apiClient", function() {
        expect(scope.apiClient).toEqual(controller);
      });
    });

    describe('with a custom body', function() {
      beforeEach(function() {
        scope = {
          api: { baseUri: "http://example.com" },
          method: createMethod("get", { body: ['application/json'] })
        };

        controller = new RAML.Controllers.tryIt(scope, httpService);
      });

      it("sets suppprtsMediaType", function() {
        expect(controller.supportsMediaType).toEqual(true);
      });

      it("sets suppprtsCustomBody", function() {
        expect(controller.supportsCustomBody).toEqual(true);
      });
    });

    describe('with a url encoded form data', function() {
      beforeEach(function() {
        scope = {
          api: { baseUri: "http://example.com" },
          method: createMethod("get", { body: ['application/x-www-form-urlencoded'] })
        };

        controller = new RAML.Controllers.tryIt(scope, httpService);
      });

      it("sets suppprtsMediaType", function() {
        expect(controller.supportsMediaType).toEqual(true);
      });

      it("sets suppprtsFormUrlencoded", function() {
        expect(controller.supportsFormUrlencoded).toEqual(true);
      });
    });

    describe('with a multipart form data', function() {
      beforeEach(function() {
        scope = {
          api: { baseUri: "http://example.com" },
          method: createMethod("get", { body: ['multipart/form-data'] })
        };

        controller = new RAML.Controllers.tryIt(scope, httpService);
      });

      it("sets suppprtsMediaType", function() {
        expect(controller.supportsMediaType).toEqual(true);
      });

      it("sets suppprtsFormData", function() {
        expect(controller.supportsFormData).toEqual(true);
      });
    });
  });

  describe("determining a body representation", function() {
    function verifyBodyRepresentation(options) {
      it("the body", function() {
        expect(controller.showBody()).toBe(options.body);
      });

      it("the url encoded form data", function() {
        expect(controller.showUrlencodedForm()).toBe(options.urlencoded);
      });

      it("the multipart form data", function() {
        expect(controller.showMultipartForm()).toBe(options.multipart);
      });
    }

    describe("when no media type is selected", function() {
      describe("with a custom body and form data", function() {
        beforeEach(function() {
          scope = {
            api: { baseUri: "http://example.com" },
            method: createMethod("get", { body: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'] })
          };

          controller = new RAML.Controllers.tryIt(scope, httpService);
        });

        verifyBodyRepresentation({ body: true, urlencoded: false, multipart: false })
      });

      describe("with urlencoded and mutlipart form data", function() {
        beforeEach(function() {
          scope = {
            api: { baseUri: "http://example.com" },
            method: createMethod("get", { body: ['application/x-www-form-urlencoded', 'multipart/form-data'] })
          };

          controller = new RAML.Controllers.tryIt(scope, httpService);
        });

        verifyBodyRepresentation({ body: false, urlencoded: true, multipart: false })
      });

      describe("with only mutlipart form data", function() {
        beforeEach(function() {
          scope = {
            api: { baseUri: "http://example.com" },
            method: createMethod("get", { body: ['multipart/form-data'] })
          };

          controller = new RAML.Controllers.tryIt(scope, httpService);
        });

        verifyBodyRepresentation({ body: false, urlencoded: false, multipart: true })
      });
    });

    describe("when no media type is selected", function() {
      beforeEach(function() {
        scope = {
          api: { baseUri: "http://example.com" },
          method: createMethod("get", { body: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'] })
        };

        controller = new RAML.Controllers.tryIt(scope, httpService);
      });

      describe("when a custom body type is selected", function() {
        beforeEach(function() {
          controller.mediaType = "application/json";
        });

        verifyBodyRepresentation({ body: true, urlencoded: false, multipart: false })
      });

      describe("when urlencoded form data is selected", function() {
        beforeEach(function() {
          controller.mediaType = "application/x-www-form-urlencoded";
        });

        verifyBodyRepresentation({ body: false, urlencoded: true, multipart: false })
      });

      describe("when multipart form data is selected", function() {
        beforeEach(function() {
          controller.mediaType = "multipart/form-data";
        });

        verifyBodyRepresentation({ body: false, urlencoded: false, multipart: true })
      });
    });
  });

  describe("executing an API command", function() {
    var promise;

    beforeEach(function() {
      promise = jasmine.createSpyObj("promise", ['then']);
      httpService.andReturn(promise);

      scope = {
        api: { baseUri: "http://example.com" },
        method: { method: "get", pathBuilder: function() { return "/resources/search" } }
      };

      controller = new RAML.Controllers.tryIt(scope, httpService);
    });

    describe("by default", function() {
      beforeEach(function() {
        controller.execute();
      });

      it("executes the described method", function() {
        expect(httpService).toHaveBeenCalledWith({ url: "http://example.com/resources/search", method: "get" });
      });
    });

    function verifyResponseAssignment(options) {
      it("assigns the request URL to the response", function() {
        expect(controller.response.requestUrl).toEqual('http://example.com/resources/search');
      });

      it("assigns body to the response", function() {
        expect(controller.response.body).toEqual(options.body);
      });

      it("assigns status to the response", function() {
        expect(controller.response.status).toEqual(options.status);
      });

      it("assigns contentType to the response", function() {
        expect(controller.response.contentType).toEqual(options.contentType);
      });
    }

    describe("on success", function() {
      beforeEach(function() {
        promise.then.andCallFake(function(success) {
          var headers = function() {
            return { 'content-type': 'application/json; charset=utf-8', 'X-Custom-Header': 'value'};
          };
          success({ data: 'Hello world.', status: 200, headers: headers});
        });

        controller.execute();
      });

      verifyResponseAssignment({ body: 'Hello world.', status: 200, contentType: 'application/json' });

      it("assigns headers to the response", function() {
        expect(controller.response.headers['X-Custom-Header']).toEqual('value');
      });
    });

    describe("on error", function() {
      beforeEach(function() {
        promise.then.andCallFake(function(success) {
          var headers = function() {
            return { 'content-type': 'text/plain' };
          };

          success({ data: 'File Not Found', status: 404, headers: headers});
        });

        controller.execute();
      });

      verifyResponseAssignment({ body: 'File Not Found', status: 404, contentType: 'text/plain' });
    });
  });
});
