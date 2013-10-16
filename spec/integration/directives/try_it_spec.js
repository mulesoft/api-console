describe("RAML.Controllers.tryIt", function() {
  var scope, $el, httpBackend;

  function createScopeForTryIt(parsedApi) {
    return createScope(function(scope) {
      scope.api = RAML.Inspector.create(parsedApi);
      scope.resource = scope.api.resources[0];
      scope.method = scope.resource.methods[0];
      scope.method.pathBuilder = new RAML.Inspector.PathBuilder.create(scope.resource.pathSegments);
    });
  }

  beforeEach(module('ramlConsoleApp'));

  function whenTryItCompletes(cb) {
    waitsFor(function() {
      return $el.find('.response .status .response-value').text().match(/[^\s]+/);
    });

    runs(cb);
  };

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

    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.example.com/resource', { page: "1", order: "newest" })
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the provided values', function() {
      $el.find('input[name=page]').fillIn('1');
      $el.find('input[name=order]').fillIn('newest');
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
        expect($el.find('.response .body .response-value')).toHaveText('cool');
      });
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

    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.example.com/resource', '<document type="xml" />')
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the Content-Type header set to the chosen media type', function() {
      var suppliedBody = '<document type="xml" />';

      $el.find('.media-types input[value="text/xml"]')[0].click();
      $el.find('textarea').fillIn(suppliedBody);
      $el.find('button[role="try-it"]').click();

      var mostRecent = $.mockjax.mockedAjaxCalls()[0];
      expect(mostRecent.contentType).toEqual("text/xml");
      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
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

    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.example.com/resource')
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      $el.find('input[name="x-custom"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      var mostRecent = $.mockjax.mockedAjaxCalls()[0];
      expect(mostRecent.headers['x-custom']).toEqual("whatever");
      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
    });
  });

  describe('given a url encoded form', function() {
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

    mockHttp(function(mock) {
      mock
        .when("post", 'http://www.example.com/resource', { foo: 'whatever'})
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      $el.find('input[name="foo"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
    });
  });

  describe('given a multipart form', function() {
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

    mockHttp(function(mock) {
      mock
        .when("post", 'http://www.example.com/resource', { foo: 'whatever'})
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      $el.find('input[name="foo"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
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

    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.example.com/resource')
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTemplate('<try-it></try-it>', scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      var headerVerifier = function(headers) {
        return !!headers['Authorization'].match(/Basic/);
      };

      $el.find('input[name="username"]').fillIn("whatever");
      $el.find('input[name="password"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      var mostRecent = $.mockjax.mockedAjaxCalls()[0];
      expect(mostRecent.headers['Authorization']).toMatch(/Basic/);
      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
    });
  });
});
