describe("RAML.Controllers.Documentation", function() {
  var controller, scope;

  function createScopeForDocumentationController(parsedApi, options) {
    options = options || {resourceIndex: 0, methodIndex: 0}
    var result = {}
    result.api = RAML.Inspector.create(parsedApi);
    result.resource = result.api.resources[options.resourceIndex];
    result.method = result.resource.methods[options.methodIndex];
    return result;
  }

  describe('given an empty method and resource', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api);
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('does not have requests documentation', function() {
      expect(controller.hasRequestDocumentation()).toBe(false);
    });

    it('does not have responses documentation', function() {
      expect(controller.hasResponseDocumentation()).toBe(false);
    });
  });

  describe('given a method with a description', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    description: hi'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api);
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('has request documentation', function() {
      expect(controller.hasRequestDocumentation()).toBe(true);
    });
  });

  describe('given a method with query parameters', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    queryParameters:',
      '      page:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api);
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('has request documentation', function() {
      expect(controller.hasRequestDocumentation()).toBe(true);
    });
  });

  describe('given a method with URI parameters', function() {
    var raml = createRAML(
      'title: Example API',
      '/{resource}:',
      '  /lock:',
      '    get:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api, {resourceIndex: 1, methodIndex: 0});
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('has request documentation', function() {
      expect(controller.hasRequestDocumentation()).toBe(true);
    });
  });

  describe('given a method with form parameters', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  post:',
      '    body:',
      '      application/x-www-form-urlencoded:',
      '        formParameters:',
      '          contents:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api);
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('has request documentation', function() {
      expect(controller.hasRequestDocumentation()).toBe(true);
    });
  });

  describe('given a method with multipart form parameters', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  post:',
      '    body:',
      '      multipart/form-data:',
      '        formParameters:',
      '          contents:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api);
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('has request documentation', function() {
      expect(controller.hasRequestDocumentation()).toBe(true);
    });
  });

  describe('given a method with only an XML request body schema', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    body:',
      '      text/xml:',
      '        schema: superschema'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api);
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('has requests documentation', function() {
      expect(controller.hasRequestDocumentation()).toBe(true);
    });
  });

  describe('given a method with only an XML request body example', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    body:',
      '      text/xml:',
      '        example: someexample'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api);
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('has requests documentation', function() {
      expect(controller.hasRequestDocumentation()).toBe(true);
    });
  });

  describe('given a method with responses', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    responses:',
      '      200:',
      '        description: A-Okay',
      '      500:',
      '        description: Ut Oh'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScopeForDocumentationController(this.api);
      controller = new RAML.Controllers.Documentation(scope);
    });

    it('has responses documentation', function() {
      expect(controller.hasResponseDocumentation()).toBe(true);
    });
  });
});
