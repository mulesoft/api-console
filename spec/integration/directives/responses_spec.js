describe("RAML.Directives.responses", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope;

  describe('given a method with response documentation', function() {
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

    beforeEach(function() {
      compileWithScopeFromFirstResourceAndMethodOfRAML("<responses></responses>", raml, function(el) {
        setFixtures(el);
      });
    });

    it('collapses the responses by default', function() {
      expect(this.$el.find('[role="response"]')).not.toBeVisible();
    });

    it('shows the codes for both responses', function() {
      expect(this.$el.find('[role="response-code"]')).toBeVisible();
      expect(this.$el.find("[role=response-code]").eq(0).text().trim()).toEqual("200");
      expect(this.$el.find("[role=response-code]").eq(1).text().trim()).toEqual("500");
    });

    describe('when the responses codes are clicked', function() {
      beforeEach(function() {
        this.$el.find("[role=response-code]").click();
      });

      it('shows the description of both responses', function() {
        expect(this.$el.find("[role='response']")).toBeVisible();
        expect(this.$el.find("[role='response']").eq(0).find('p').text().trim()).toEqual("A-Okay");
        expect(this.$el.find("[role='response']").eq(1).find('p').text().trim()).toEqual("Ut Oh");
      });

    });
  });

});
