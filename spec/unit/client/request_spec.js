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
          expect(options.contentType).toBeUndefined()
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

      describe("setting data", function() {
        var data = { "foo": 'bar' };

        beforeEach(function() {
          request.data(data);
          options = request.toOptions();
        });

        it('assigns the data', function() {
          expect(options.data).toEqual(data)
        });
      });
    });
  });
});
