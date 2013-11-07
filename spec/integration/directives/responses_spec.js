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

    it('shows the description of both responses', function() {
      expect(this.$el.find("h4").eq(0).text().trim()).toEqual("200");
      expect(this.$el.find("h4").eq(1).text().trim()).toEqual("500");
      expect(this.$el.find("[role='response']").eq(0).find('p').text().trim()).toEqual("A-Okay");
      expect(this.$el.find("[role='response']").eq(1).find('p').text().trim()).toEqual("Ut Oh");
    });

    it('makes both responses visible', function() {
      var responses = this.$el.find("[role='response']");

      expect(responses.eq(0)).toBeVisible();
      expect(responses.eq(1)).toBeVisible();
    });

    it('hides a response on click', function() {
      var header = this.$el.find("h4").first();
      header.click();

      var response = this.$el.find("[role='response']")

      expect(response.first()).not.toBeVisible();
      expect(response.last()).toBeVisible();
    });
  });

});
