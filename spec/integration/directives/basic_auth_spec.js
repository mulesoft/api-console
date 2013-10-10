describe('RAML.directives.basicAuth', function() {
  function createScopeForBasicAuth(method) {
    return createScope(function(scope) {
      scope.basicauth = {};
      scope.method = method;
    });
  }


  var scope, $el, inspector, raml = createRAML(
    'title: Example API',
    'baseUri: http://www.example.com',
    'securitySchemes:',
    '  - basic:',
    '      type: Basic Authentication',
    '/resource:',
    '  get:',
    '    securedBy: [basic]',
    '/another/resource:',
    '  get:'
  );

  parseRAML(raml);

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    inspector = RAML.Inspector.create(this.api);
  });

  describe('given a method that is secured via Basic Auth', function() {
    beforeEach(function() {
      scope = createScopeForBasicAuth(inspector.resources[0].methods[0]);
      $el = compileTemplate('<basic-auth></basic-auth>', scope);
      setFixtures($el);
    });

    it('renders inputs for username and password', function() {
      expect($el).toContain('fieldset');
    });
  });

  describe('given a method that is not secured via Basic Auth', function() {
    beforeEach(function() {
      scope = createScopeForBasicAuth(inspector.resources[1].methods[0]);
      $el = compileTemplate('<basic-auth></basic-auth>', scope);
      setFixtures($el);
    });

    it('does not render any inputs', function() {
      expect($el).not.toContain('fieldset');
    });
  });
});
