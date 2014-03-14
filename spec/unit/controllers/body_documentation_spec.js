describe("RAML.Controllers.BodyDocumentation", function() {
  function createBodyDocumentationScope(keyBase) {
    return { keyBase: keyBase}
  }

  function createDataStoreMock() {
    return jasmine.createSpyObj('DataStore', ['set', 'get']);
  }

  describe('creation', function() {
    beforeEach(function() {
      this.scope = createBodyDocumentationScope('hello');
      this.storage = createDataStoreMock();
      new RAML.Controllers.BodyDocumentation(this.scope, this.storage);
    });

    it('generates a unique key base for the data store', function() {
      expect(this.scope.bodyKey).toEqual('hello:body');
    });
  });

  describe('expanding the schema', function() {
    beforeEach(function() {
      this.scope = createBodyDocumentationScope('schema');
      this.storage = createDataStoreMock();
      new RAML.Controllers.BodyDocumentation(this.scope, this.storage);

      this.key = 'schema:body:schemaExpanded:typeOne'
      this.scope.expandSchema('typeOne');
    });

    it('stores the result', function() {
      expect(this.storage.set).toHaveBeenCalledWith(this.key, true);
    });

    it('fetches the result', function() {
      this.storage.get.andReturn(true);
      var expanded = this.scope.schemaExpanded('typeOne');

      expect(this.storage.get).toHaveBeenCalledWith(this.key);
      expect(expanded).toBe(true);
    });
  });
});
