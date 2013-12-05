describe('RAML.directives.securitySchemes', function() {
  function createScopeForSecuritySchemes(client, method, keychain) {
    return createScope(function(scope) {
      scope.keychain = keychain;
      scope.schemes = method.securitySchemes();
    });
  }

  function compileAndSetFixture(client, method, keychain) {
    scope = createScopeForSecuritySchemes(client, method, keychain);
    $el = compileTemplate('<security-schemes schemes="schemes" keychain="keychain">', scope);
    setFixtures($el);

    return $el;
  }

  var $el, client, inspector, keychain, scope, raml = createRAML(
    'title: Example API',
    'baseUri: http://www.example.com',
    'securitySchemes:',
    '  - basic:',
    '      type: Basic Authentication',
    '  - oauth2:',
    '      type: OAuth 2.0',
    '      settings:',
    '        authorizationUri: https://example.com/oauth/authorize',
    '        accessTokenUri: https://example.com/oauth/access_token',
    '  - digest:',
    '     type: Digest Authentication',
    '/resource:',
    '  get:',
    '    securedBy: [basic]',
    '/another/resource:',
    '  get:',
    '    securedBy: [oauth2]',
    '/insecure:',
    '  get:',
    '/digest_scheme:',
    '  get:',
    '    securedBy: [digest]'
  );

  parseRAML(raml);

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    keychain = {};
    inspector = RAML.Inspector.create(this.api);
    client = RAML.Client.create(this.api);
  });

  it("ignores unsupported security schemes", function() {
    $el = compileAndSetFixture(client, inspector.resources[3].methods[0], keychain);
    expect($el).not.toContain('input[value="digest"]');
  });

  describe('given a method that is secured via Basic Auth', function() {
    beforeEach(function() {
      $el = compileAndSetFixture(client, inspector.resources[0].methods[0], keychain);
    });

    it('renders the basic auth form', function() {
      expect($el).toContain('[role="basic"]');
    });

    it('does not render the OAuth 2.0 form', function() {
      expect($el).not.toContain('[role="oauth2"]');
    });

    describe('when filling in credentials', function() {
      beforeEach(function() {
        $el.find('[name="username"]').fillIn("username")
        $el.find('[name="password"]').fillIn("password")
      });

      it('populates username on the credentials object', function() {
        expect(keychain.basic.username).toEqual('username');
      });

      it('populates password on the credentials object', function() {
        expect(keychain.basic.password).toEqual('password');
      });
    });
  });

  describe('given a method that is secured via OAuth 2.0', function() {
    beforeEach(function() {
      $el = compileAndSetFixture(client, inspector.resources[1].methods[0], keychain);
    });

    it('renders the OAuth 2.0 form', function() {
      expect($el).toContain('[role="oauth2"]');
    });

    it('does not render the basic auth form', function() {
      expect($el).not.toContain('[role="basic"]');
    });

    describe('when filling in credentials', function() {
      beforeEach(function() {
        $el.find('input[name="clientId"]').fillIn("idelicious");
        $el.find('input[name="clientSecret"]').fillIn("1234");
      });

      it('client id is bound to the supplied credentials', function() {
        expect(keychain.oauth2.clientId).toEqual("idelicious");
      });

      it('client secret is bound to supplied credentials', function() {
        expect(keychain.oauth2.clientSecret).toEqual("1234");
      });
    });
  });

  describe('given a method that is not secured', function() {
    beforeEach(function() {
      $el = compileAndSetFixture(client, inspector.resources[2].methods[0], keychain);
    });

    it('does not render the basic auth form', function() {
      expect($el).not.toContain('[role="basic"]');
    });

    it('does not render the OAuth 2.0 form', function() {
      expect($el).not.toContain('[role="oauth2"]');
    });
  });
});
