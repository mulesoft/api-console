describe("RAML.Controllers.Resource", function() {
  var controller, element, resource, storeSpy;

  var raml = createRAML(
    'title: my API',
    '/base:',
    '  /{sub}:',
    '    /nested:',
    '      patch:',
    '      put:',
    '      delete:'
  );

  parseRAML(raml);

  function createScope(resource) {
    return {
      resource: resource,
      $emit: jasmine.createSpy(),
      $on: jasmine.createSpy()
    };
  }

  function createDataStoreMock() {
    return RAML.Services.DataStore();
  }

  beforeEach(function() {
    element = {};
    storeSpy = createDataStoreMock();

    var inspected = RAML.Inspector.create(this.api);
    resource = inspected.resources[2];
  });

  describe('creation', function() {
    describe('by default', function() {
      var scope;

      beforeEach(function() {
        scope = createScope(resource);
        controller = new RAML.Controllers.Resource(scope, storeSpy, element);
      });

      it('is not expanded', function() {
        expect(controller.expanded).toBeFalsy();
      });

      it('notifies listeners of render', function() {
        expect(scope.$emit).toHaveBeenCalledWith('console:resource:rendered', resource, element)
      });
    });

    describe('when previously expanded', function() {
      beforeEach(function() {
        var pastController = new RAML.Controllers.Resource(createScope(resource), storeSpy);
        pastController.toggleExpansion();
        expect(pastController.expanded).toBe(true);

        controller = new RAML.Controllers.Resource(createScope(resource), storeSpy);
      });

      it('is expanded', function() {
        expect(controller.expanded).toBe(true);
      });
    });
  });

  describe('opening resource documentation', function() {
    var event, method, scope;

    beforeEach(function() {
      scope = createScope(resource);
      event = jasmine.createSpyObj('event', ['stopPropagation']);
      method = resource.methods[0];
    });

    describe('by default', function() {
      beforeEach(function() {
        controller = new RAML.Controllers.Resource(scope, storeSpy, element);
        spyOn(controller, 'toggleExpansion');
        controller.openDocumentation(event, method);
      });

      it('stops event propagation', function() {
        expect(event.stopPropagation).toHaveBeenCalled();
      });

      it('expands resource if it is not already expanded', function() {
        expect(controller.toggleExpansion).toHaveBeenCalled();
      });

      it('notifies listners of an expansion', function() {
        expect(scope.$emit).toHaveBeenCalledWith('console:expand', resource, method, element)
      });
    });

    describe('when previously expanded', function() {
      beforeEach(function() {
        var pastController = new RAML.Controllers.Resource(createScope(resource), storeSpy);
        pastController.toggleExpansion();
        expect(pastController.expanded).toBe(true);

        controller = new RAML.Controllers.Resource(scope, storeSpy, element);
        spyOn(controller, 'toggleExpansion');
        controller.openDocumentation(event, method);
      });

      it('does not try to toggle resource expansion', function() {
        expect(controller.toggleExpansion).not.toHaveBeenCalled();
      });
    });
  });
});
