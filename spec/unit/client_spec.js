describe('RAML.Client', function() {
  var client, raml;

  describe("creation", function() {
    describe("by default", function() {
      describe("when the configuration can be automatically completed", function() {
        raml = createRAML(
          'title: Example API',
          'baseUri: http://example.com/api/{version}',
          'version: 2.5'
          );

        parseRAML(raml);

        beforeEach(function() {
          client = RAML.Client.create(this.api);
        });

        it("populates the version in the baseUri", function() {
          expect(client.baseUri).toEqual('http://example.com/api/2.5');
        });
      });

      describe("when the configuration is more complicated", function() {
        raml = createRAML(
          'title: Example API',
          'baseUri: http://{not_provided}.example.com/api/{version}',
          'version: 2.5'
          );

        parseRAML(raml);

        it("throws", function() {
          expect(function() {
            RAML.Client.create(this.api);
          }).toThrow();
        });
      });
    });

    describe("when configuring the base uri", function() {
      raml = createRAML(
        'title: Example API',
        'baseUri: http://{bucket}.example.com/api/{version}',
        'version: 2.5'
        );

      parseRAML(raml);

      beforeEach(function() {
        client = RAML.Client.create(this.api, function(config) {
          config.baseUriParameters({ bucket: 'some_bucket'});
        });
      });

      it("sets the baseUri on the client", function() {
        expect(client.baseUri).toEqual('http://some_bucket.example.com/api/2.5');
      });
    });
  });
});
