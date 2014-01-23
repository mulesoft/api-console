describe("RAML.Controllers.Resource", function() {
  var controller, resource, storeSpy;

  var raml = createRAML(
    'title: my API',
    '/base:',
    '  /{sub}:',
    '    /nested:'
  );

  parseRAML(raml);

  beforeEach(function() {
    var inspected = RAML.Inspector.create(this.api);
    resource = inspected.resources[2];
    storeSpy = jasmine.createSpyObj('store', ['get', 'set']);
    controller = new RAML.Controllers.Resource({ resource: resource }, storeSpy);
  });

  describe('by default', function() {
    it('is not expanded', function() {
      expect(controller.expanded).toBeFalsy();
    });
  });

  describe('with initially expanded state', function() {
    beforeEach(function() {
      storeSpy.get.andReturn(true);

      controller = new RAML.Controllers.Resource({ resource: resource }, storeSpy);
    });

    it('is expanded', function() {
      expect(controller.expanded).toBe(true);
    });

    it('calls the store with the appropriate key', function() {
      expect(storeSpy.get).toHaveBeenCalledWith(controller.resourceKey());
    });
  });

  describe('expanding a resource', function() {
    beforeEach(function() {
      controller.toggleExpansion();
    });

    it('sets expanded to true', function() {
      expect(controller.expanded).toBe(true);
    });

    it('updates the value in the store', function() {
      expect(storeSpy.set).toHaveBeenCalledWith(controller.resourceKey(), true);
    });
  });

  describe('resourceKey', function() {
    beforeEach(function() {
      controller = new RAML.Controllers.Resource({ resource: resource }, storeSpy);
    });

    it('generates a unique key', function() {
      expect(controller.resourceKey()).toEqual('/base/{sub}/nested');
    });
  });
});
