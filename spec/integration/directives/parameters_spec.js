describe("RAML.Directives.parameters", function() {
  var scope, $el, raml = createRAML(
    'title: Example API',
    '/resource:',
    '  get:',
    '    headers:',
    '      someHeader:',
    '        description: Plain parameter',
    '      x-custom-{*}:',
    '        description: Parameterized parameter'
  );

  parseRAML(raml);

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    scope = createScopeWithFirstResourceAndMethod(this.api);
    $el = compileTemplate('<parameters>/<parameters>', scope);
    setFixtures($el);
  });

  describe('headers', function() {
    it('documents plain parameters', function() {
      expect($el).toHaveText(/someHeader/);
      expect($el).toHaveText(/Plain parameter/);
    });

    it('documents parameterized parameters', function() {
      expect($el).toHaveText(/x-custom-\{\*\}/);
      expect($el).toHaveText(/Parameterized parameter/);
    });
  });
});
