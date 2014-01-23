describe("RAML.Services.DataStore", function() {
  var service;

  beforeEach(function() {
    service = RAML.Services.DataStore();
  });

  describe("setting and fetching values", function() {
    it("returns the value set", function() {
      service.set('key', 'what ever you put in there');
      expect(service.get('key')).toBe('what ever you put in there');
    });

    it("returns undefined when the value is not set", function() {
      expect(service.get('key')).toBe(undefined);
    });
  });
});
