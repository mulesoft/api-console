describe("RAML.Controllers.TryIt", function() {
  var scope, httpService, controller, dataStoreSpy;

  var raml = createRAML(
    'title: My RAML',
    'baseUri: http://example.com',
    '/resources/search:',
    '  get:'
  )

  parseRAML(raml);

  function createScope(parsed) {
    var api = RAML.Inspector.create(parsed);

    return {
      api: api,
      method: api.resources[0].methods[0],
      resource: api.resources[0],
      ramlConsole: { keychain: {} },
      $apply: jasmine.createSpy()
    };
  }

  beforeEach(function() {
    dataStoreSpy = jasmine.createSpyObj('dataStore', ['get', 'set']);
    httpService = spyOn($, 'ajax');
  });

  describe("upon initialization", function() {
    describe('by default', function() {
      beforeEach(function() {
        scope = createScope(this.api);

        controller = new RAML.Controllers.TryIt(scope, dataStoreSpy);
      });

      it("assigns itself as the apiClient", function() {
        expect(scope.apiClient).toEqual(controller);
      });
    });
  });

  describe("executing an API command", function() {
    var promise;

    beforeEach(function() {
      promise = jasmine.createSpyObj("promise", ['then']);
      httpService.andReturn(promise);

      scope = createScope(this.api);
      controller = new RAML.Controllers.TryIt(scope, dataStoreSpy);
    });

    describe("by default", function() {
      beforeEach(function() {
        controller.execute();
      });

      it("executes the described method", function() {
        var calledWith = httpService.mostRecentCall.args[0];
        expect(calledWith.url).toEqual("http://example.com/resources/search");
        expect(calledWith.type).toEqual("get");
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
