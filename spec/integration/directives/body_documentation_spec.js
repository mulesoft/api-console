describe("RAML.Directives.bodyDocumentation", function() {
  beforeEach(module('ramlConsoleApp'));

  var raml;

  function createScopeForBodyDocumentation(parsedApi) {
    return createScope(function(scope) {
      var api = RAML.Inspector.create(parsedApi),
          resource = api.resources[0];

      scope.body = resource.methods[0].body;
      scope.fakeKeyBase = "fake";
    });
  }

  function compileBodyDocumentation(api) {
    var scope = createScopeForBodyDocumentation(api);
    var el = compileTemplate('<body-documentation keyBase="fakeKeyBase" body="body"></body-documentation>', scope);
    setFixtures(el);

    return el;
  }

  describe('rendering', function() {
  	describe('by default', function() {
      raml = createRAML(
        'title: Example API',
        '/someResource:',
        '  post:',
        '    body:',
        '      application/json:',
        '        example: |',
        '          { "buffalo": "stance" },',
        '        schema: |',
        '          { "property": "value" }'
      );

      parseRAML(raml);

      beforeEach(function() {
        this.el = compileBodyDocumentation(this.api);
      });

  	  it('includes the expaneded example', function() {
        var example = this.el.find('[role="example"]');

        expect(example.text()).toMatch(/Example/);
        expect(example.text()).toMatch(/{ "buffalo": "stance" }/);
      });

      it('includes the collapsed schema toggle', function() {
        var schema = this.el.find('[role="schema"]');

        expect(schema.text()).toMatch(/Show Schema/);
        expect(schema.text()).not.toMatch(/"property": "value"/);
      });

      it('allows the user to expand the schema', function() {
        var schema = this.el.find('[role="schema"]');

        click(schema.find('.schema-toggle')[0]);
        expect(schema.text()).toMatch(/"property": "value"/);
      });
  	});

  	describe('with urlencoded form parameters', function() {
      raml = createRAML(
        'title: Example API',
        '/someResource:',
        '  post:',
        '    body:',
        '      application/x-www-form-urlencoded:',
        '        formParameters:',
        '          x-www-property:'
      );

      parseRAML(raml);

      beforeEach(function() {
        this.el = compileBodyDocumentation(this.api);
      });

      it('does not show example or schema', function() {
        expect(this.el.text()).not.toMatch(/Example/);
        expect(this.el.text()).not.toMatch(/Show Schema/);
      });

      it('shows the parameters for x-www-form-urlencoded', function() {
        expect(this.el.text()).toMatch(/x-www-property/);
      });
    });

  	describe('with multipart form parameters', function() {
      raml = createRAML(
        'title: Example API',
        '/someResource:',
        '  post:',
        '    body:',
        '      multipart/form-data:',
        '        formParameters:',
        '          multi-property:'
      );

      parseRAML(raml);

      beforeEach(function() {
        this.el = compileBodyDocumentation(this.api);
      });

      it('does not show example or schema', function() {
        expect(this.el.text()).not.toMatch(/Example/);
        expect(this.el.text()).not.toMatch(/Show Schema/);
      });

      it('shows the parameters for x-www-form-urlencoded', function() {
        expect(this.el.text()).toMatch(/multi-property/);
      });
    });
  });

  describe('toggling the content type', function() {
    raml = createRAML(
      'title: Example API',
      '/someResource:',
      '  post:',
      '    body:',
      '      application/x-www-form-urlencoded:',
      '        formParameters:',
      '          x-www-property:',
      '      multipart/form-data:',
      '        formParameters:',
      '          multi-property:'
    );

    parseRAML(raml);

    function findToggleItemByContent(elements, content) {
      return Array.prototype.slice.call(elements).filter(function(element) {
        return angular.element(element).text().indexOf(content) !== -1;
      })[0];
    }

    beforeEach(function() {
      this.el = compileBodyDocumentation(this.api);

      this.urlencodedContent = findToggleItemByContent(this.el.find('.toggle-item'), 'x-www-property');
      this.multipartContent = findToggleItemByContent(this.el.find('.toggle-item'), 'multi-property');

      expect(this.urlencodedContent).toBeVisible();
      expect(this.multipartContent).toBeHidden();
    });

  	it('switches the display to the selected content type', function() {
      click(this.el.find('.radio span')[1]);

      expect(this.urlencodedContent).toBeHidden();
      expect(this.multipartContent).toBeVisible();
    });
  });
});
