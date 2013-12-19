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

  describe("invalidating the store", function() {
    beforeEach(function() {
      service.set('key', 'value');
      service.invalidate();
    });

    it("returns undefined for an invalid key", function() {
      expect(service.get('key')).toBe(undefined);
    });

    describe("forced retrieval of an invalid key", function() {
      var value;

      beforeEach(function() {
        value = service.get('key', true);
      });

      it("returns the value for the key", function() {
        expect(value).toBe('value');
      });

      it("revalidates the key", function() {
        expect(service.get('key')).toBe('value');
      });
    });
  });
});
