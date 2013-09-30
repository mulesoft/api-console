describe("RAML.Controllers.tryIt", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, el, httpBackend;

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

    beforeEach(inject(function($httpBackend, $compile, $rootScope) {
      httpBackend = $httpBackend;
      scope = $rootScope.$new();

      var result = parseRAML(raml);

      runs(function() {
        scope.api = RAML.Inspector.create(result);
        scope.resource = scope.api.resources[0];
        scope.method = scope.resource.methods[0];

        el = $compile('<try-it></try-it>')(scope);
        scope.$digest();
      });
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('executes a request with the provided values', function() {
      $(el).find('input[name=page]').fillIn('1');
      $(el).find('input[name=order]').fillIn('newest');
      httpBackend.expectGET('http://www.example.com/resource?order=newest&page=1').respond(200);
      $(el).find('button[role="try-it"]').click();

      httpBackend.flush();
    });
  });
});
