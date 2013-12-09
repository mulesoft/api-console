describe("RAML.Directives.parameterizedHeader", function() {
  function createScopeForParameterizedHeader(headerName, method) {
    return createScope(function(scope) {
      scope.headerName = headerName;
      scope.headers = new RAML.Controllers.TryIt.NamedParameters(method.headers.plain, method.headers.parameterized);
    });
  }

  var scope, $el, raml = createRAML(
    'title: Example API',
    'baseUri: http://www.example.com',
    '/resource:',
    '  get:',
    '    headers:',
    '      x-custom-{*}:'
  );

  parseRAML(raml);

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    var inspected = RAML.Inspector.create(this.api);
    scope = createScopeForParameterizedHeader("x-custom-{*}", inspected.resources[0].methods[0]);
    $el = compileTemplate('<parameterized-header header-name="headerName" headers="headers"></parameterized-header>', scope);
    setFixtures($el);
  });

  describe('given parameterizable headers', function() {
    var openFactory, headerValue, submit;

    beforeEach(function() {
      openFactory = $el.find('[role="open-factory"]');
      headerValue = $el.find('input[name="x-custom-{*}"]');
      submit = $el.find('[role="create-parameter"]');

      openFactory.click();
      expect(openFactory).not.toBeVisible();
      expect(headerValue).toBeVisible();
    });

    describe("creating a valid header", function() {
      it("closes the creation form", function() {
        headerValue.fillIn('test');
        submit.click();

        expect(headerValue).not.toBeVisible();
        expect(openFactory).toBeVisible();
      });
    });

    describe("creating an invalid header", function() {
      it("decorates the input with an error", function() {
        $el.find('[role="create-parameter"]').click();

        expect(headerValue).toBeVisible();
        expect(headerValue).toHaveClass("error");
      });
    });
  });
});
