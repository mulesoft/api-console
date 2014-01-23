describe("RAML.Directives.validatedInput", function() {
  var input, scope;

  function createScopeForValidatedInput(constraints, model) {
    constraints = constraints || { type: 'string' };
    model = model || {};

    return createScope(function(scope) {
      scope.constraints = constraints;
      scope.model = model;
    });
  }

  beforeEach(module('ramlConsoleApp'));

  describe("validating the input", function() {
    var $el, model, resource, raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource/{resourceId}:',
      '  get:',
      '    queryParameters:',
      '      page:'
    );

    parseRAML(raml, { into: 'api' });

    beforeEach(function() {
      var template = '<form><input validated-input ng-model="model.resourceId" constraints="constraints"/><button></button></form>';
      model = {}
      resource = this.api.resources[0];

      scope = createScopeForValidatedInput(resource.uriParameters.resourceId, model);
      $el = compileTemplate(template, scope);
      setFixtures($el)
      input = $el.find('input');
    });

    describe("with valid input", function() {
      beforeEach(function() {
        expect(model.resourceId).toBeUndefined();
        input.trigger('focus');
        input.fillIn('the thing i typed');
        input.trigger('blur');
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

    describe("on form submission", function() {
      beforeEach(function() {
        click($el.find('button'))
      });

      it("validates", function() {
        expect(input).toHaveClass('warning');
      });
    });

    describe("when configured with a custom error class", function() {
      var template = '<input validated-input ng-model="model.resourceId" name="id" constraints="constraints" invalid-class="invalidClass"/>';
      beforeEach(function() {
        scope.invalidClass = 'error';
        input = compileTemplate(template, scope);
        setFixtures(input);
        input.trigger('focus');
        input.trigger('blur')
      });

      it("adds the custom class", function() {
        expect(input).toHaveClass('error');
      });
    });
  })
});
