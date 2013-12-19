describe("RAML.Directives.namedParameters", function() {
  var scope, $el;

  function createScopeForNamedParameters(method) {
    return createScope(function(scope) {
      scope.parameters = new RAML.Controllers.TryIt.NamedParameters(method.headers.plain, method.headers.parameterized);
    });
  }

  //describe("given a parameter with only parameterized entries", function() {
  //  var raml = createRAML(
  //    'title: Example API',
  //    'baseUri: http://www.example.com',
  //    '/resource:',
  //    '  get:',
  //    '    headers:',
  //    '      x-custom-{*}:'
  //  );
  //});

  beforeEach(module('ramlConsoleApp'));

  describe("given a parameter with multiple types", function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource:',
      '  get:',
      '    headers:',
      '      Duration:',
      '        - type: string',
      '        - type: integer'
    );

    parseRAML(raml);

    beforeEach(function() {
      var inspected = RAML.Inspector.create(this.api);
      scope = createScopeForNamedParameters(inspected.resources[0].methods[0]);
      $el = compileTemplate('<named-parameters parameters="parameters"></named-parametersr>', scope);
    });

    it("shows a dropdown for the type", function() {
    });
  });
});
