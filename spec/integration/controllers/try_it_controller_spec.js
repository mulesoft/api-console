describe("RAML.Controllers.tryIt", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el, httpBackend;

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

    beforeEach(inject(function($httpBackend) {
      httpBackend = $httpBackend;

      var parsedApi = this.api;
      scope = createScope(function(scope) {
        scope.api = RAML.Inspector.create(parsedApi);
        scope.resource = scope.api.resources[0];
        scope.method = scope.resource.methods[0];
        scope.method.pathBuilder = new RAML.Inspector.PathBuilder.create(scope.resource.pathSegments);
      });

      $el = compileTemplate('<try-it></try-it>', scope);
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('executes a request with the provided values', function() {
      $el.find('input[name=page]').fillIn('1');
      $el.find('input[name=order]').fillIn('newest');
      httpBackend.expectGET('http://www.example.com/resource?order=newest&page=1').respond(200);
      $el.find('button[role="try-it"]').click();

      httpBackend.flush();
    });
  });
});
