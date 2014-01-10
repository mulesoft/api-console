describe("RAML.Directives.responses", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, dataStore, el;

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

    parseRAML(raml);

    beforeEach(inject(function(DataStore) {
      dataStore = DataStore;

      scope = createScope();
      scope.api = RAML.Inspector.create(this.api);
      scope.resource = scope.api.resources[0];
      scope.method = scope.resource.methods[0];

      dataStore.set('/resource:get:500', true);
      el = compileTemplate("<responses></responses>", scope);
      setFixtures(el);
    }));

    afterEach(function() {
      dataStore.reset();
    });

    it('queries the dataStore for the initial response state', function() {
      expect(el.find('[role="response"]').eq(0)).not.toBeVisible();
      expect(el.find('[role="response"]').eq(1)).toBeVisible();
    });

    it('shows the codes and descriptions for the hidden responses', function() {
      expect(el.find('[role="response-code"]').eq(0)).toBeVisible();
      expect(el.find('[role="response-code"]').eq(0).text().trim()).toContain("200");
      expect(el.find('[role="response-code"]').eq(0).find('p').text().trim()).toContain("A-Okay");
    });

    describe('when the responses codes are clicked', function() {
      beforeEach(function() {
        click(el.find("[role=response-code]").eq(0));
      });

      it('expands the responses', function() {
        expect(el.find("[role='response']")).toBeVisible();
        expect(el.find("[role='response']").eq(0).find('p').text().trim()).toContain("A-Okay");
        expect(el.find("[role='response-code']").eq(0).find(".abbreviated-description")).not.toBeVisible();
      });

      it('sets the state in the dataStore', function() {
        scope.$digest();
        expect(dataStore.get('/resource:get:200')).toBeTruthy();
      });
    });
  });
});
