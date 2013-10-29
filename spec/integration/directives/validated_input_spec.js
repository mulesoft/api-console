describe("RAML.Directives.validatedInput", function() {
  var $el, input, scope, raml = createRAML(
    'title: Example API',
    'baseUri: http://www.example.com',
    '/resource/{id}:',
    '  get:',
    '    queryParameters:',
    '      page:'
  );

  function createScopeForValidatedInput(constraints, model) {
    constraints = constraints || {};
    model = model || {};

    return createScope(function(scope) {
      scope.constraints = constraints;
      scope.model = model;
    });
  }

  beforeEach(module('ramlConsoleApp'));

  describe("rendering the control", function() {
    beforeEach(function() {
      scope = createScopeForValidatedInput();
    });

    describe("by default", function() {
      beforeEach(function() {
        $el = compileTemplate('<validated-input bind-to="model" constraints="constraints"></validated-input>', scope);
        input = $el.find('input');
      });

      it("generates an input of type text", function() {
        expect(input.attr('type')).toEqual('text');
      });

      it("has no placeholder", function() {
        expect(input.attr('placeholder')).toBe('');
      });
    });

    describe("a password field", function() {
      beforeEach(function() {
        $el = compileTemplate('<validated-input type="password" bind-to="model" constraints="constraints"></validated-input>', scope);
        input = $el.find('input');
      });

      it("generates an input of type password", function() {
        expect(input.attr('type')).toEqual('password');
      });
    });

    describe("with a placeholder", function() {
      beforeEach(function() {
        $el = compileTemplate('<validated-input placeholder="test" bind-to="model" constraints="constraints"></validated-input>', scope);
        input = $el.find('input');
      });

      it("generates an input with the specified placeholder", function() {
        expect(input.attr('placeholder')).toEqual('test');
      });
    });
  });

  describe("validating the input", function() {
    var model, resource;

    parseRAML(raml, { into: 'api' });

    beforeEach(function() {
      var template = '<validated-input name="id" constraints="constraints" bind-to="model"></validated-input>';
      model = {}
      resource = this.api.resources[0];

      scope = createScopeForValidatedInput(resource.uriParameters.id, model);
      $el = compileTemplate(template, scope);
      setFixtures($el)
      input = $el.find('input');
    });

    describe("with valid input", function() {
      beforeEach(function() {
        expect(model.id).toBeUndefined();
        input.trigger('focus');
        input.fillIn('the thing i typed');
        input.trigger('blur');
      });

      it("binds the input value to the model", function() {
        expect(model.id).toEqual('the thing i typed');
      });

      it("does not decorate the input", function() {
        expect(input).not.toHaveClass('warning');
      });
    });

    describe("with invalid input", function() {
      beforeEach(function() {
        input.trigger('focus');
        input.trigger('blur');
      });

      it("adds a warning class", function() {
        expect(input).toHaveClass('warning');
      });

      describe("trying again", function() {
        beforeEach(function() {
          input.trigger('focus');
        });

        it("clears the warning class", function() {
          expect(input).not.toHaveClass('warning');
        });
      });
    });

    describe("when configured to disallow missing input", function() {
      var template = '<validated-input name="id" constraints="constraints" bind-to="model" invalid-class="error"></validated-input>';
      beforeEach(function() {
        $el = compileTemplate(template, scope);
        input = $el.find('input');
        input.trigger('focus');
        input.trigger('blur');
      });

      it("adds an error class", function() {
        expect(input).toHaveClass('error');
      });
    });
  })
});
