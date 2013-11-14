describe("RAML.Directives.documentation", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el, traits, raml = createRAML(
    'title: Example API',
    'traits:',
    '  - someTraitOnAResource: {}',
    '  - someTraitOnAMethod: {}',
    '  - someParameterizedTrait:',
    '      description: <<someParameterName>>',
    '/someResource:',
    '  is: ["someTraitOnAResource"]',
    '  get:',
    '    is: ["someTraitOnAMethod", {someParameterizedTrait: { someParameterName: someParameterValue }}]'
  );

  parseRAML(raml);

  beforeEach(function() {
    scope = createScopeWithFirstResourceAndMethod(this.api);
    scope.ramlConsole = { keychain: {} };
    $el = compileTemplate('<documentation></documentation>', scope);
    traits = $el.find('[role="traits"]');
  });

  it("displays the trait applied to the method", function() {
    expect(traits.text()).toMatch('someTraitOnAMethod');
  });

  it("does not display the trait applied to the resource", function() {
    expect(traits.text()).not.toMatch('someTraitOnAResource');
  });

  it("displays just the trait name of parameterized traits", function() {
    expect(traits.text()).not.toMatch('someParameterName');
  });
});
