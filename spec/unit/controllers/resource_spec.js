describe("RAML.Controllers.Resource", function() {
  var controller, scope, resource, methods, storeSpy;

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

  beforeEach(function() {
    storeSpy = jasmine.createSpyObj('store', ['get', 'set']);

    var inspected = RAML.Inspector.create(this.api);
    resource = inspected.resources[2];
    methods = resource.methods;
    scope = { resource: resource, $emit: function() {} };
    controller = new RAML.Controllers.Resource(scope, storeSpy);
  });

  describe('by default', function() {
    it('is not expanded', function() {
      expect(controller.expanded).toBeFalsy();
    });
  });

  describe('with initially expanded state', function() {
    var elementSpy, childrenSpy;

    beforeEach(function() {
      storeSpy.get.andCallFake(function(key) {
        if (key === scope.resource.toString()) {
          return true;
        }

        if (key === '/base/{sub}/nested:method') {
          return false;
        }
      });

      elementSpy = jasmine.createSpyObj('element', ['children']);
      childrenSpy = jasmine.createSpyObj('children', ['css']);
      elementSpy.children.andReturn(childrenSpy);
      spyOn(scope, '$emit');
      controller = new RAML.Controllers.Resource(scope, storeSpy, elementSpy);
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

  describe('methods', function() {
    describe('when initially expanded', function() {
      var elementSpy, childrenSpy;

      beforeEach(function() {
        storeSpy.get.andCallFake(function(key) {
          if (key === '/base/{sub}/nested:method') {
            return (methods[1].method);
          }
          if (key === 'pop-up:wrapper-height') {
            return '100px';
          }
        });
        elementSpy = jasmine.createSpyObj('element', ['children']);
        childrenSpy = jasmine.createSpyObj('children', ['css']);
        elementSpy.children.andReturn(childrenSpy);
        spyOn(scope, '$emit');
        controller = new RAML.Controllers.Resource(scope, storeSpy, elementSpy);
      });

      it('calls the store with the appropriate key', function() {
        expect(storeSpy.get).toHaveBeenCalledWith(controller.methodKey());
      });

      it('sets method on scope', function() {
        expect(scope.selectedMethod).toEqual(methods[1]);
      });

      it('sets child height based on the dataStore', function() {
        expect(childrenSpy.css).toHaveBeenCalledWith('height', '100px');
      });
    });

    describe('expanding a method', function() {
      beforeEach(function() {
        controller.expandMethod(methods[1]);
      });

      it('sets method on scope', function() {
        expect(scope.selectedMethod).toEqual(methods[1]);
      });

      it('updates the value in the store', function() {
        expect(storeSpy.set).toHaveBeenCalledWith(controller.methodKey(), methods[1].method);
      });
    });
  });

  describe('resourceKey', function() {
    beforeEach(function() {
      controller = new RAML.Controllers.Resource(scope, storeSpy);
    });

    it('generates a unique key', function() {
      expect(controller.resourceKey()).toEqual('/base/{sub}/nested');
    });
  });

  describe('methodKey', function() {
    beforeEach(function() {
      controller = new RAML.Controllers.Resource(scope, storeSpy);
    });

    it('generates a unique key', function() {
      expect(controller.methodKey()).toEqual('/base/{sub}/nested:method');
    });
  });
});
