describe('RAML.Client.Request', function() {
  describe("creating a new request", function() {
    var request, options;

    beforeEach(function() {
      request = RAML.Client.Request.create('http://api.example.com', 'POST');
    });

    describe("by default", function() {
      beforeEach(function() {
        options = request.toOptions();
      });

      it("assigns the URL", function() {
        expect(options.url).toEqual('http://api.example.com')
      });

      it("assigns the method", function() {
        expect(options.type).toEqual('POST')
      });

      it("sets traditional = true", function() {
        // prevents adding [] to params with multiple values
        expect(options.traditional).toEqual(true);
      });
    });

    describe("setting headers", function() {
      var headers = {
        "Content-Type": 'text/plain',
        "Content-Length": 52
      }

      describe("with no existing headers", function() {
        beforeEach(function() {
          request.headers(headers);
          options = request.toOptions();
        });

        it('assigns the headers', function() {
          expect(options.headers).toEqual(headers)
        });
      });

      describe("with existing headers", function() {
        var replacementHeaders = { 'X-Custom': 'whatever' };

        beforeEach(function() {
          request.headers(headers);
          request.headers(replacementHeaders);

          options = request.toOptions();
        });

        it("removes the old headers", function() {
          expect(options.headers).toEqual(replacementHeaders)
        });

        it("removes the old contentType", function() {
          expect(options.contentType).toNotEqual(headers.contentType);
        });
      });

      describe("setting the Content-Type header", function() {
        beforeEach(function() {
          request.headers(headers);
          options = request.toOptions();
        });

        it("exposes the contentType", function() {
          expect(options.contentType).toEqual('text/plain');
        });
      });

      describe("setting query parameters", function() {
        describe("by default", function() {
          beforeEach(function() {
            request = RAML.Client.Request.create('http://api.example.com', 'GET');
            request.queryParams({ foo: ['b&r'] });
            options = request.toOptions();
          });

          it("encodes the query parameters in the URL", function() {
            expect(options.url).toEqual('http://api.example.com?foo=b%26r')
          });

          it("is idempotent", function() {
            request.toOptions();
            expect(options.url).toEqual('http://api.example.com?foo=b%26r')
          });
        });

        describe("with parameters already set", function() {
          beforeEach(function() {
            request = RAML.Client.Request.create('http://api.example.com', 'GET');
            request.queryParams({ foo: ['b&r'] });
            request.queryParam('one', 'more');
            options = request.toOptions();
          });

          it("adds the new parameter", function() {
            expect(options.url).toEqual('http://api.example.com?foo=b%26r&one=more')
          });
        });

        describe("with an URL with an existing query parameter", function() {
          beforeEach(function() {
            request = RAML.Client.Request.create('http://api.example.com/?existing=param', 'GET');

            request.queryParams({ foo: ['b&r'] });
            options = request.toOptions();
          });

          it("appends the new query parameters properly", function() {
            expect(options.url).toEqual('http://api.example.com/?existing=param&foo=b%26r')
          });
        });
      });

      describe('fetching query parameters', function() {
        beforeEach(function() {
          request.queryParams({ q: ['mySearch'] });
        });

        it('returns the parameters', function() {
           expect(request.queryParams()).toEqual({ q: ['mySearch'] });
        });
      });

      describe("setting data", function() {
        var data = { "foo": ['bar'] };

        describe("by default", function() {
          beforeEach(function() {
            request.data(data);
            options = request.toOptions();
          });

          it('assigns the data', function() {
            expect(options.data).toEqual(data);
          });

          it('enables processingData', function() {
            expect(options.processData).toBeTruthy();
          });

        });

        describe("when requesting options for a multipart form", function() {
          var formDataSpy;

          beforeEach(function() {
            formDataSpy = jasmine.createSpyObj('formData', ['append']);
            spyOn(window, 'FormData').andReturn(formDataSpy);

            request.data(data);
            request.header('Content-Type', 'multipart/form-data');
            options = request.toOptions();
          });

          it('assigns the data', function() {
            expect(options.data).toEqual(formDataSpy);
            expect(formDataSpy.append).toHaveBeenCalledWith('foo', 'bar');
          });

          it('disables processingData', function() {
            expect(options.processData).toBeFalsy();
          });
        });
      });

      describe('fetching data', function() {
        beforeEach(function() {
          request.data({ name: 'fred' });
        });

        it('returns the data', function() {
           expect(request.data()).toEqual({ name: 'fred' });
        });
      });

    });
  });
});
