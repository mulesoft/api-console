describe("RAML.Controllers.Method", function() {
  var controller, method, resource, storeSpy;

  var raml = createRAML(
    'title: my API',
    '/resource:',
    '  get:'
  );

  parseRAML(raml);

  beforeEach(function() {
    var inspected = RAML.Inspector.create(this.api);
    resource = inspected.resources[0];
    method = resource.methods[0];
    storeSpy = jasmine.createSpyObj('store', ['get', 'set']);
    controller = new RAML.Controllers.Method({ resource: resource, method: method }, storeSpy);
  });

  describe('by default', function() {
    it('is not expanded', function() {
      expect(controller.expanded).toBeFalsy();
    });
  });

  describe('with initially expanded state', function() {
    beforeEach(function() {
      storeSpy.get.andReturn(true);

      controller = new RAML.Controllers.Method({ resource: resource, method: method }, storeSpy);
    });

    it('is expanded', function() {
      expect(controller.expanded).toBe(true);
    });

    it('calls the store with the appropriate key', function() {
      expect(storeSpy.get).toHaveBeenCalledWith(controller.methodKey());
    });
  });

  describe('expanding a method', function() {
    var eventSpy;

    beforeEach(function() {
      eventSpy = jasmine.createSpyObj('event', ['preventDefault']);
      controller.toggleExpansion(eventSpy);
    });

    it('sets expanded to true', function() {
      expect(controller.expanded).toBe(true);
    });

    it('updates the value in the store', function() {
      expect(storeSpy.set).toHaveBeenCalledWith(controller.methodKey(), true);
    });

    it('prevents default on the event', function() {
      expect(eventSpy.preventDefault).toHaveBeenCalled();
    });
  });

  describe('methodKey', function() {
    it('generates a unique key', function() {
      expect(controller.methodKey()).toEqual('/resource:get');
    });
  });
});
