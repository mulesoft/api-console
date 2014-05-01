describe("RAML.Controllers.tryIt", function() {
  var scope, $el, httpBackend;

  function createScopeForTryIt(parsedApi) {
    return createScope(function(scope) {
      scope.api = RAML.Inspector.create(parsedApi);
      scope.resource = scope.api.resources[0];
      scope.ramlConsole = { keychain: {} };
      scope.method = scope.resource.methods[0];
    });
  }

  beforeEach(module('ramlConsoleApp'));

  function whenTryItCompletes(cb) {
    waitsFor(function() {
      return $el.find('.response .status .response-value').text().match(/[^\s]+/);
    });

    runs(cb);
  }

  function compileTryIt(scope) {
    return compileTemplate(
      '<console-tabset key-base="whatever" heading="whatever">' +
        '<console-tab heading="Try It" active="true" disabled="false">' +
          '<try-it></try-it>' +
        '</console-tab>' +
      '</console-tabset>',
      scope);
  }

  describe('the path builder', function() {
    describe("for a resource with no templated parameters", function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://example.com',
        '/resource/search:',
        '  get:'
      );

      parseRAML(raml);

      beforeEach(function() {
        scope = createScopeForTryIt(this.api);
        $el = compileTryIt(scope);
        setFixtures($el);
      });

      it("renders the path segments", function() {
        expect($el).toHaveText(/http:\/\/example.com[\s\S]*\/resource[\s\S]*\/[\s\S]*search/)
      });
    });

    describe("for a resource with templated parameters", function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://example.com/{thing}',
        '/resource/{resourceId}list{format}:',
        '  get:'
      );

      parseRAML(raml);

      beforeEach(function() {
        scope = createScopeForTryIt(this.api);
        $el = compileTryIt(scope);
        setFixtures($el);
      });

      it("renders templated path segments as input fields", function() {
        expect($el).toHaveText(/http:\/\/example.com[\s\S]*\/resource[\s\S]*list/);

        var inputs = $el.find('.path input');
        expect(inputs[0]).toHaveAttr('placeholder', 'thing');
        expect(inputs[1]).toHaveAttr('placeholder', 'resourceId');
        expect(inputs[2]).toHaveAttr('placeholder', 'format');
      });
    });

    describe("a resource and a sub-resource with templated parameters that have the same name", function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        '/{resource}:',
        '  /{resource}:',
        '    get:'
      );

      parseRAML(raml);

      beforeEach(function() {
        scope = createScope();
        scope.api = RAML.Inspector.create(this.api);
        scope.resource = scope.api.resources[1];
        scope.method = scope.resource.methods[0];
        scope.ramlConsole = { keychain: {} };

        $el = compileTryIt(scope);
        setFixtures($el);
        scope.$digest();
      });

      it("allows each segment to be independently filled", function() {
        var inputs = $el.find('input');
        inputs.first().fillIn('first');
        inputs.last().fillIn('last');

        expect(inputs.first().val()).toEqual('first');
        expect(inputs.last().val()).toEqual('last');
      });
    });
  });

  describe("when execute fails", function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/pages/{pageName}:',
      '  get:'
    );

    parseRAML(raml);

    describe("because of missing uri parameters", function() {
      beforeEach(function() {
        scope = createScopeForTryIt(this.api);
        $el = compileTryIt(scope);
        setFixtures($el);
      });

      beforeEach(function() {
        expect($el).not.toContain('input.error');
        expect($el.find('[role="error"]')).not.toBeVisible();
        $el.find('button[role="try-it"]').click();
      });

      it("shows an error message", function() {
        expect($el.find('[role="error"]')).toBeVisible();
      });

      xit("adds an error class to the missing field", function() {
        expect($el).toContain('input.error');
      });

      it("does not show the spinner", function() {
        expect($el.find('.fa-spinner').css('display')).toEqual('none');
      });
    });
  });

  describe('when a proxy is set', function() {
    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.someproxyserver.com/proxy-path/http://www.example.com/v5/resource')
        .respondWith(200, "OK");
    });

    var raml = createRAML(
      'title: Example API',
      'version: v5',
      'baseUri: http://www.example.com/{version}',
      '/resource:',
      '  get:'
    );

    parseRAML(raml);

    beforeEach(function() {
      RAML.Settings.proxy = 'http://www.someproxyserver.com/proxy-path/';

      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
    });

    afterEach(function() {
      RAML.Settings = {};
    });

    it('executes a request through the proxy', function() {
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
        expect($el.find('.response .body .response-value')).toHaveText('OK');
      });
    });


    it("stores the response in the DataStore", inject(function(DataStore) {
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect(DataStore.get('/resource:get:response')).toBeDefined();
        expect(DataStore.get('/resource:get:response').requestUrl).toEqual('http://www.example.com/v5/resource');
      });
    }));

  });

  describe('given a version', function() {
    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.example.com/v5/resource')
        .respondWith(200, "OK");
    });

    var raml = createRAML(
      'title: Example API',
      'version: v5',
      'baseUri: http://www.example.com/{version}',
      '/resource:',
      '  get:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
    });

    it('executes a request with the version interpolated into the URL', function() {
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
        expect($el.find('.response .body .response-value')).toHaveText('OK');
      });
    });
  });

  describe('given some other base uri parameter', function() {
    mockHttp(function(mock) {
      mock
        .when("get", 'http://some-host.example.com/resource')
        .respondWith(200, "OK");
    });

    var raml = createRAML(
      'title: Example API',
      'baseUri: http://{host}.example.com',
      '/resource:',
      '  get:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
    });

    it('executes a request with the version interpolated into the URL', function() {
      $el.find('input[name="host"]').fillIn('some-host')
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
        expect($el.find('.response .body .response-value')).toHaveText('OK');
      });
    });
  });

  describe('given query parameters', function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource:',
      '  get:',
      '    queryParameters:',
      '      page:',
      '      order:',
      '        required: true'
    )

    parseRAML(raml);

    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.example.com/resource?order=newest')
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
    });

    it('executes a request with the provided values', function() {
      $el.find('input[name=order]').fillIn('newest');
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
        expect($el.find('.response .body .response-value')).toHaveText('cool');
      });
    });

    it("gives a visual cue for required parameters", function() {
      expect($el.find('label[for="order"]')).toContain("*");
      expect($el.find('label[for="page"]')).not.toContain("*");
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
      '      application/json:',
      '      application/x-www-form-urlencoded:',
      '       formParameters:',
      '         foo:'
    )

    parseRAML(raml);

    describe("by default", function() {
      mockHttp(function(mock) {
        mock
          .when("get", 'http://www.example.com/resource', '<document type="xml" />')
          .respondWith(200, "cool");
      });

      beforeEach(function() {
        scope = createScopeForTryIt(this.api);
        $el = compileTryIt(scope);
        setFixtures($el);
      });

      it('selects a mime type', function() {
        expect($el.find('.request-body .toggle .radio.active').length).toEqual(1);
      });

      it('executes a request with the Content-Type header set to the chosen media type', function() {
        var suppliedBody = '<document type="xml" />';

        click($el.find('.request-body .toggle .radio')[0]);
        $el.find('textarea').fillIn(suppliedBody);
        $el.find('button[role="try-it"]').click();

        var mostRecent = $.mockjax.mockedAjaxCalls()[0];
        expect(mostRecent.contentType).toEqual("text/xml");
        whenTryItCompletes(function() {
          expect($el.find('.response .status .response-value')).toHaveText('200');
        });
      });
    });

    describe('with a prefilled xml body', function() {
      mockHttp(function(mock) {
        mock
        .when("get", 'http://www.example.com/resource')
        .respondWith(200, "cool");
      });

      beforeEach(function() {
        scope = createScopeForTryIt(this.api);
        $el = compileTryIt(scope);
        setFixtures($el);
        var suppliedBody = '<document type="xml" />';

        click($('.request-body .toggle .radio')[0])
        $el.find('textarea').fillIn(suppliedBody);
      });

      it('executes a request with form data when the user changes modes', function() {
        click($('.request-body .toggle .radio span')[2]);

        $el.find('input[name="foo"]').fillIn("whatever");
        $el.find('button[role="try-it"]').click();

        var mostRecent = $.mockjax.mockedAjaxCalls()[0];
        expect(mostRecent.contentType).toEqual("application/x-www-form-urlencoded");
        expect(mostRecent.data).toEqual({ foo: ['whatever'] });
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
      $el = compileTryIt(scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      $el.find('input[name="x-custom"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      var mostRecent = $.mockjax.mockedAjaxCalls()[0];
      expect(mostRecent.headers['x-custom']).toEqual(["whatever"]);
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
        .when("post", 'http://www.example.com/resource')
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      $el.find('input[name="foo"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();

      var mostRecent = $.mockjax.mockedAjaxCalls()[0];
      expect(mostRecent.contentType).toEqual("application/x-www-form-urlencoded");
      expect(mostRecent.data).toEqual({ foo: ['whatever'] });

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
        .when("post", 'http://www.example.com/resource')
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      formDataSpy = jasmine.createSpy('formData');
      formDataSpy.append = jasmine.createSpy();
      spyOn(window, 'FormData').andReturn(formDataSpy);

      $el.find('input[name="foo"]').fillIn("whatever");
      $el.find('button[role="try-it"]').click();


      var mostRecent = $.mockjax.mockedAjaxCalls()[0];
      expect(mostRecent.contentType).toBeFalsy();
      expect(mostRecent.data).toEqual(formDataSpy);
      expect(formDataSpy.append).toHaveBeenCalledWith('foo', 'whatever');
      expect(formDataSpy.append.callCount).toEqual(1);

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
    });
  });

  describe('unsecured usage', function() {
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
      $el = compileTryIt(scope);
      setFixtures($el);
    });

    it('executes the request', function() {
      click($el.find('.radio span')[0]);
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
    });

    it('warns that authentication is required', function() {
      click($el.find('.radio span')[0]);
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('form [role="warning"]')).toBeVisible();
        expect($el.find('form [role="warning"]')).toHaveText('Successful responses require authentication');
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
      $el = compileTryIt(scope);
    });

    it('executes a request with the supplied value for the custom header', function() {
      click($el.find('.radio span')[1]);
      $el.find('input[name="username"]').fillIn("user");
      $el.find('input[name="password"]').fillIn("password");
      $el.find('button[role="try-it"]').click();

      var mostRecent = $.mockjax.mockedAjaxCalls()[0];
      expect(mostRecent.headers['Authorization']).toMatch(/Basic/);
      expect(mostRecent.headers['Authorization']).toMatch('dXNlcjpwYXNzd29yZA==');
      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
    });
  });

  describe('secured by oauth', function() {
    describe("by default", function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        'securitySchemes:',
        '  - oauth2:',
        '      type: OAuth 2.0',
        '      settings:',
        '        authorizationUri: https://example.com/oauth/authorize',
        '        accessTokenUri: https://example.com/oauth/access_token',
        '        authorizationGrants: [code]',
        '/resource:',
        '  get:',
        '    securedBy: [oauth2]'
      );

      parseRAML(raml);

      beforeEach(function() {
        RAML.Settings.oauth2RedirectUri = "http://example.com/oauth2.html";
      });

      mockHttp(function(mock) {
        mock
          .when('post', 'https://example.com/oauth/access_token', {
            client_id: 'user',
            client_secret: 'password',
            code: 'code',
            grant_type: 'authorization_code',
            redirect_uri: RAML.Settings.oauth2RedirectUri
          }).respondWith(200, JSON.stringify({ access_token: 'token' }));
      });

      mockHttp(function(mock) {
        mock
          .when('get', 'http://www.example.com/resource')
          .respondWith(200, 'cool');
      });

      beforeEach(function() {
        scope = createScopeForTryIt(this.api);
        $el = compileTryIt(scope);
        spyOn(window, 'open');
      });

      it('asks for client id and secret', function() {
        click($el.find('.radio span')[1]);
        $el.find('input[name="clientId"]').fillIn("user");
        $el.find('input[name="clientSecret"]').fillIn("password");
        $el.find('button[role="try-it"]').click();

        window.RAML.authorizationSuccess('code');

        whenTryItCompletes(function() {
          expect($el.find('.response .status .response-value')).toHaveText('200');
        });
      });
    });

    describe("when parameterized", function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        'securitySchemes:',
        '  - oauth2:',
        '      type: OAuth 2.0',
        '      settings:',
        '        authorizationUri: https://example.com/oauth/authorize',
        '        accessTokenUri: https://example.com/oauth/access_token',
        '        authorizationGrants: [code]',
        '/resource:',
        '  get:',
        '    securedBy: [oauth2: { scopes: [ ADMINISTRATOR ] } ]'
      );

      parseRAML(raml);

      beforeEach(function() {
        scope = createScopeForTryIt(this.api);
        $el = compileTryIt(scope);
      });

      it("is unsupported", function() {
        expect($el).not.toContain('input[value="oauth2"]');
      });
    });
  });

  describe("given uriParameters", function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/{resource}/{subresource}:',
      '  get:'
    );

    parseRAML(raml);

    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.example.com/posts/andstuff')
        .respondWith(200, "cool");
    });

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
    });

    it('executes a request to the parameterized URI', function() {
      $el.find('input[name="resource"]').fillIn('posts');
      $el.find('input[name="subresource"]').fillIn('andstuff');
      $el.find('button[role="try-it"]').click();

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
    });
  });

  describe("given enumerated parameters", function() {
    mockHttp(function(mock) {
      mock
        .when("get", 'http://www.example.com/resource/a')
        .respondWith(200, "cool");
    });

    var raml = createRAML(
      'title: API With Parameters Where Repeat=True',
      'baseUri: http://www.example.com',
      '/resource/{someParam}:',
      '  uriParameters:',
      '    someParam:',
      '      enum: [a, b, c]',
      '  get:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
      setFixtures($el);
    });

    it('executes a request using the selected enumerated value', function() {
      $el.find('input[name=someParam]').eq(0).fillIn('a');
      click($el.find('.autocomplete li'));
      click($el.find('button[role="try-it"]'));

      whenTryItCompletes(function() {
        expect($el.find('.response .status .response-value')).toHaveText('200');
      });
    });
  });

  describe("given repeatable parameters", function() {
    var raml = createRAML(
      'title: API With Parameters Where Repeat=True',
      'baseUri: http://www.example.com',
      '/resource:',
      '  post:',
      '    queryParameters:',
      '      someParam:',
      '        repeat: true',
      '    body:',
      '      application/x-www-form-urlencoded:',
      '        formParameters:',
      '          someFormParam:',
      '            repeat: true',
      '      multipart/form-data:',
      '        formParameters:',
      '          someMultipartFormParam:',
      '            repeat: true',
      '    headers:',
      '      someHeader:',
      '        repeat: true'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForTryIt(this.api);
      $el = compileTryIt(scope);
      setFixtures($el);
    });

    // does not apply to URI parameters

    describe("for queryParameters", function() {
      mockHttp(function(mock) {
        mock
          .when("post", 'http://www.example.com/resource?someParam=1&someParam=2')
          .respondWith(200, "cool");
      });

      it('executes a request to the parameterized URI', function() {
        $el.find('input[name=someParam]').eq(0).fillIn('1');
        click($el.find('input[name=someParam]').eq(0).closest('.control-group').find('repeatable-add .fa'))
        $el.find('input[name=someParam]').eq(1).fillIn('2');
        click($el.find('button[role="try-it"]'))

        whenTryItCompletes(function() {
          expect($el.find('.response .status .response-value')).toHaveText('200');
        });
      });
    });

    describe("for formParameters", function() {
      mockHttp(function(mock) {
        mock
          .when("post", 'http://www.example.com/resource', { someFormParam: [1, 2] })
          .respondWith(200, "cool");
      });

      it('executes a request to the parameterized URI', function() {
        click($el.find('.request-body .toggle .radio')[0]);
        $el.find('input[name="someFormParam"]').eq(0).fillIn('1');
        click($el.find('input[name="someFormParam"]').eq(0).closest('.control-group').find('repeatable-add .fa'))
        $el.find('input[name="someFormParam"]').eq(1).fillIn('2');
        click($el.find('button[role="try-it"]'))

        whenTryItCompletes(function() {
          expect($el.find('.response .status .response-value')).toHaveText('200');
        });
      });
    });

    describe("for multipart formParameters", function() {
      var formDataSpy;

      mockHttp(function(mock) {
        mock
          .when("post", 'http://www.example.com/resource')
          .respondWith(200, "cool");
      });

      it('executes a request to the parameterized URI', function() {
        formDataSpy = jasmine.createSpy('formData');
        formDataSpy.append = jasmine.createSpy();
        spyOn(window, 'FormData').andReturn(formDataSpy);

        click($el.find('.request-body .toggle .radio span')[1]);

        $el.find('input[name=someMultipartFormParam]').eq(0).fillIn('1');
        click($el.find('input[name=someMultipartFormParam]').eq(0).closest('.control-group').find('repeatable-add .fa'))
        $el.find('input[name=someMultipartFormParam]').eq(1).fillIn('2');
        click($el.find('button[role="try-it"]'))

        whenTryItCompletes(function() {
          var mostRecent = $.mockjax.mockedAjaxCalls()[0];
          expect(mostRecent.data).toEqual(formDataSpy);

          expect(formDataSpy.append).toHaveBeenCalledWith('someMultipartFormParam', '1');
          expect(formDataSpy.append).toHaveBeenCalledWith('someMultipartFormParam', '2');
          expect(formDataSpy.append.callCount).toEqual(2);

          expect($el.find('.response .status .response-value')).toHaveText('200');
        });
      });
    });

    describe("for headers", function() {
      mockHttp(function(mock) {
        mock
          .when("post", 'http://www.example.com/resource')
          .respondWith(200, "cool");
      });

      it('executes a request to the parameterized URI', function() {
        $el.find('input[name=someHeader]').eq(0).fillIn('1');
        click($el.find('input[name=someHeader]').eq(0).closest('.control-group').find('repeatable-add .fa'))
        $el.find('input[name=someHeader]').eq(1).fillIn('2');
        click($el.find('button[role="try-it"]'));

        var mostRecent = $.mockjax.mockedAjaxCalls()[0];
        expect(mostRecent.headers['someHeader']).toEqual(['1', '2']);
        whenTryItCompletes(function() {
          expect($el.find('.response .status .response-value')).toHaveText('200');
        });
      });
    });
  });
});
