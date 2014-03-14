describe("RAML.Directives.enum", function() {
  var scope;

  beforeEach(module('ramlConsoleApp'));

  describe("the enum combo-box", function() {
    var $el, model, raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    queryParameters:',
      '      type:',
      '        enum: [any, all, none]'
    );

    parseRAML(raml, { into: 'api' });

    beforeEach(function() {
      scope = createScope();
      scope.constraints = this.api.resources[0].methods[0].queryParameters.type;
      scope.param = {
        model: ''
      };

      var template = '<parameter-field definition="constraints" model="param.model"></parameter-field>';
      $el = compileTemplate(template, scope);
      setFixtures($el)
    });

    describe('by default', function() {
      it('is not shown', function() {
        expect($('.autocomplete ul')).not.toBeVisible();
      });
    });

    describe('upon input focus', function() {
      beforeEach(function() {
        $el.find("input").trigger('focus');
      });

      it('is shown', function() {
        expect($('.autocomplete ul')).toBeVisible();
      });

      it('shows all of the potential options', function() {
        var text = [];
        $el.find('li').each(function(idx, li) { text.push($(li).text().trim()); });

        expect(text).toEqual(['any', 'all', 'none']);
      });

      describe('and upon blur', function() {
        beforeEach(function() {
          $el.find("input").trigger('blur');
        });

        it('is hidden', function() {
          expect($('.autocomplete ul')).not.toBeVisible();
        });
      });
    });

    describe('when filtered by a string', function() {
      beforeEach(function() {
        $el.find("input").trigger('focus');
        $el.find("input").eq(0).fillIn('a');
      });

      it('shows only options matching the filter', function() {
        var text = [];
        $el.find('li').each(function(idx, li) { text.push($(li).text().trim()); });

        expect(text).toEqual(['any', 'all']);
      });
    });

    describe('when selecting an option', function() {
      beforeEach(function() {
        $el.find("input").trigger('focus');
        click($el.find("li:first-child"))
      });

      it('populates the model', function() {
        expect(scope.param.model).toEqual('any');
      });
    });
  });
});
