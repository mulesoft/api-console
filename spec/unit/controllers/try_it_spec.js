describe("RAML.Controllers.TryIt", function() {
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
      body: body,
      requiresBasicAuthentication: function() { return false; },
      requiresOauth2: function() { return false; }
    }
  }

  function createScope(method) {
    method = method || createMethod();

    return {
      api: { baseUri: "http://example.com" },
      method: method,
      ramlConsole: { keychain: {} },
      $apply: jasmine.createSpy()
    };
  }

  beforeEach(function() {
    httpService = spyOn($, 'ajax');
  });

  describe("upon initialization", function() {
    describe('by default', function() {
      beforeEach(function() {
        scope = createScope();

        controller = new RAML.Controllers.TryIt(scope);
      });

      it("assigns itself as the apiClient", function() {
        expect(scope.apiClient).toEqual(controller);
      });
    });

    describe('with a custom body', function() {
      beforeEach(function() {
        scope = createScope(createMethod("get", { body: ['application/json'] }));
        controller = new RAML.Controllers.TryIt(scope);
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
        scope = createScope(createMethod("get", { body: ['application/x-www-form-urlencoded'] }));
        controller = new RAML.Controllers.TryIt(scope);
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
        scope = createScope(createMethod("get", { body: ['multipart/form-data'] }));
        controller = new RAML.Controllers.TryIt(scope);
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
          scope = createScope(createMethod("get", { body: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'] }));
          controller = new RAML.Controllers.TryIt(scope);
        });

        verifyBodyRepresentation({ body: true, urlencoded: false, multipart: false })
      });

      describe("with urlencoded and mutlipart form data", function() {
        beforeEach(function() {
          scope = createScope(createMethod("get", { body: ['application/x-www-form-urlencoded', 'multipart/form-data'] }));
          controller = new RAML.Controllers.TryIt(scope);
        });

        verifyBodyRepresentation({ body: false, urlencoded: true, multipart: false })
      });

      describe("with only mutlipart form data", function() {
        beforeEach(function() {
          scope = createScope(createMethod("get", { body: ['multipart/form-data'] }));
          controller = new RAML.Controllers.TryIt(scope);
        });

        verifyBodyRepresentation({ body: false, urlencoded: false, multipart: true })
      });
    });

    describe("when no media type is selected", function() {
      beforeEach(function() {
        scope = createScope(createMethod("get", { body: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'] }));
        controller = new RAML.Controllers.TryIt(scope);
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

      scope = createScope();
      controller = new RAML.Controllers.TryIt(scope);
    });

    describe("by default", function() {
      beforeEach(function() {
        controller.execute();
      });

      it("executes the described method", function() {
        expect(httpService).toHaveBeenCalledWith({ url: "http://example.com/resources/search", type: "get" });
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
      describe("by default", function() {
        beforeEach(function() {
          promise.then.andCallFake(function(success) {
            var headers = function() {
              return 'Content-Type: application/json; charset=utf-8\nX-Custom-Header: value';
            };
            success(undefined, undefined, { responseText: 'Hello world.', status: 200, getAllResponseHeaders: headers});
          });

          controller.execute();
        });

        verifyResponseAssignment({ body: 'Hello world.', status: 200, contentType: 'application/json' });

        it("assigns headers to the response", function() {
          expect(controller.response.headers['x-custom-header']).toEqual('value');
        });

        it("clears requestInProgress", function() {
          expect(controller.requestInProgress).toBeFalsy();
        });
      });

      describe("given a lowercase header", function() {
        beforeEach(function() {
          promise.then.andCallFake(function(success) {
            var headers = function() {
              return 'content-type: application/json; charset=utf-8';
            };
            success(undefined, undefined, { responseText: 'Hello world.', status: 200, getAllResponseHeaders: headers});
          });

          controller.execute();
        });

        verifyResponseAssignment({ body: 'Hello world.', status: 200, contentType: 'application/json' });
      });
    });

    describe("on error", function() {
      beforeEach(function() {
        promise.then.andCallFake(function(success, error) {
          var headers = function() {
            return 'Content-Type: text/plain';
          };

          error({ responseText: 'File Not Found', status: 404, getAllResponseHeaders: headers});
        });

        controller.execute();
      });

      verifyResponseAssignment({ body: 'File Not Found', status: 404, contentType: 'text/plain' });

      it("clears requestInProgress", function() {
        expect(controller.requestInProgress).toBeFalsy();
      })
    });
  });
});
