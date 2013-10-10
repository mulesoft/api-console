describe("RAML.Controllers.tryIt", function() {
  var scope, $el, httpBackend;

  function createScopeWithStuff(parsedApi) {
    return createScope(function(scope) {
      scope.api = RAML.Inspector.create(parsedApi);
      scope.resource = scope.api.resources[0];
      scope.method = scope.resource.methods[0];
      scope.method.pathBuilder = new RAML.Inspector.PathBuilder.create(scope.resource.pathSegments);
    });
  }

  beforeEach(module('ramlConsoleApp'));

  describe('given query parameters', function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource:',
      '  get:',
      '    queryParameters:',
      '      page:',
      '      order:'
    )

    parseRAML(raml);

    beforeEach(function() {
      httpBackend = prepareHttpBackend();
      scope = createScopeWithStuff(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the provided values', function() {
      $el.find('input[name=page]').fillIn('1');
      $el.find('input[name=order]').fillIn('newest');
      httpBackend.expectGET('http://www.example.com/resource?order=newest&page=1').respond(200);
      $el.find('button[role="try-it"]').click();

      httpBackend.flush();
    });
  });

  describe('given body mime types', function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource:',
      '  get:',
      '    body:',
      '      text/xml:',
      '      application/json:'
    )

    parseRAML(raml);

    beforeEach(function() {
      httpBackend = prepareHttpBackend();
      scope = createScopeWithStuff(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the Content-Type header set to the chosen media type', function() {
      var suppliedBody = "<document type='xml' />";
      var headerVerifier = function(headers) {
        return headers['Content-Type'] === 'text/xml';
      };

      httpBackend.expect('GET', 'http://www.example.com/resource', suppliedBody, headerVerifier).respond(200);

      $el.find('.media-types input[value="text/xml"]')[0].click();
      $el.find('textarea').fillIn(suppliedBody);
      $el.find('button[role="try-it"]').click();

      httpBackend.flush();
    });
  });

  describe('given headers', function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource:',
      '  get:',
      '    headers:',
      '      x-custom:'
    );

    parseRAML(raml);

    beforeEach(function() {
      httpBackend = prepareHttpBackend();
      scope = createScopeWithStuff(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      var headerVerifier = function(headers) {
        return headers['x-custom'] === 'whatever';
      };

      httpBackend.expect('GET', 'http://www.example.com/resource', undefined, headerVerifier).respond(200);

      $el.find('input[name="x-custom"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      httpBackend.flush();
    });
  });

  describe('given form parameters', function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource:',
      '  post:',
      '    body:',
      '      application/x-www-form-urlencoded:',
      '        formParameters:',
      '          foo:'
    );

    parseRAML(raml);

    beforeEach(function() {
      httpBackend = prepareHttpBackend();
      scope = createScopeWithStuff(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      httpBackend.expect('POST', 'http://www.example.com/resource', { foo: "whatever" }).respond(200);

      $el.find('input[name="foo"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      httpBackend.flush();
    });
  });

  describe('given form parameters', function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource:',
      '  post:',
      '    body:',
      '      multipart/form-data:',
      '        formParameters:',
      '          foo:'
    );

    parseRAML(raml);

    beforeEach(function() {
      httpBackend = prepareHttpBackend();
      scope = createScopeWithStuff(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      httpBackend.expect('POST', 'http://www.example.com/resource', { foo: "whatever" }).respond(200);

      $el.find('input[name="foo"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      httpBackend.flush();
    });
  });

  describe('secured by basic auth', function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      'securitySchemes:',
      '  - basic:',
      '      type: Basic Authentication',
      '/resource:',
      '  get:',
      '    securedBy: [basic]'
    );

    parseRAML(raml);

    beforeEach(function() {
      httpBackend = prepareHttpBackend();
      scope = createScopeWithStuff(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      var headerVerifier = function(headers) {
        return !!headers['Authorization'].match(/Basic/);
      };

      httpBackend.expect('GET', 'http://www.example.com/resource', undefined, headerVerifier).respond(200);

      $el.find('input[name="username"]').fillIn("whatever");
      $el.find('input[name="password"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      httpBackend.flush();
    });
  });
});
