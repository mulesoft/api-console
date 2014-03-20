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

      dataStore.set('/resource:get', '500');
      el = compileTemplate('<console-tabset><console-tab active="true" disabled="false"><responses></responses></console-tab></console-tabset>', scope);
      setFixtures(el);
    }));

    afterEach(function() {
      dataStore.reset();
    });

    it('queries the dataStore for the initial response state', function() {
      expect(el.find('.method-sub-nav li').eq(2)).toHaveClass('active');
    });

    describe('when the responses codes are clicked', function() {
      beforeEach(function() {
        click(el.find(".method-sub-nav li").eq(1));
      });

      it('sets the state in the dataStore', function() {
        scope.$digest();
        expect(dataStore.get('/resource:get')).toEqual('200');
      });
    });
  });
});
