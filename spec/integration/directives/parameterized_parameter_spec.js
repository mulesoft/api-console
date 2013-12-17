describe("RAML.Directives.parameterizedParameter", function() {
  function createScopeForParameterizedParameter(parameterName, method) {
    return createScope(function(scope) {
      scope.parameterName = parameterName;
      scope.parameters = new RAML.Controllers.TryIt.NamedParameters(method.headers.plain, method.headers.parameterized);
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
    scope = createScopeForParameterizedParameter("x-custom-{*}", inspected.resources[0].methods[0]);
    $el = compileTemplate('<parameterized-parameter parameter-name="parameterName" parameters="parameters"></parameterized-parameter>', scope);
    setFixtures($el);
  });

  describe('given parameterizable parameters', function() {
    var openFactory, parameterValue, submit;

    beforeEach(function() {
      openFactory = $el.find('[role="open-factory"]');
      parameterValue = $el.find('input[name="x-custom-{*}"]');
      submit = $el.find('[role="create-parameter"]');

      click(openFactory);
      expect(openFactory).not.toBeVisible();
      expect(parameterValue).toBeVisible();
    });

    describe("creating a valid header", function() {
      it("closes the creation form", function() {
        parameterValue.fillIn('test');
        click(submit);

        expect(parameterValue).not.toBeVisible();
        expect(openFactory).toBeVisible();
      });
    });

    describe("creating an invalid header", function() {
      it("decorates the input with an error", function() {
        click(submit);

        expect(parameterValue).toBeVisible();
        expect(parameterValue).toHaveClass("error");
      });
    });
  });
});
