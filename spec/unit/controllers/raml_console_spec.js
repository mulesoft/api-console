describe('RAML.Controllers.RAMLConsole', function() {
  var controller, parserWrapperStub, scope;

  beforeEach(function() {
    parserWrapperStub = jasmine.createSpyObj('pw', ['load']);
  });

  describe("initialization", function() {
    describe('by default', function() {
      beforeEach(function() {
        controller = new RAML.Controllers.RAMLConsole({}, {}, parserWrapperStub);
      });

      it("initializes a keychain", function() {
        expect(controller.keychain).toBeDefined();
      });
    });

    describe('when a source file is specified', function() {
      var parserWrapperStub;

      beforeEach(function() {
        parserWrapperStub = jasmine.createSpyObj('pw', ['load']);
        controller = new RAML.Controllers.RAMLConsole({ src: 'file.raml' }, {}, parserWrapperStub);
      });

      it("calls the RAML parser wrapper with the appropriate file", function() {
        expect(parserWrapperStub.load).toHaveBeenCalledWith("file.raml");
      });
    });
  });

  describe('try it', function() {
    describe('by default', function() {
      beforeEach(function() {
        controller = new RAML.Controllers.RAMLConsole({}, {}, parserWrapperStub);
      });

      it('is disabled', function() {
        expect(controller.tryItEnabled()).toBe(false);
      });
    });

    describe('with a baseUri in the provided RAML', function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com'
        );
      parseRAML(raml);

      beforeEach(function() {
        controller = new RAML.Controllers.RAMLConsole({}, { withRootDocumentation: true });
        controller.api = RAML.Inspector.create(this.api);
      });

      it('is enabled', function() {
        expect(controller.tryItEnabled()).toBe(true);
      });
    });
  });

  describe('root documentation', function() {
    describe("when disabled", function() {
      beforeEach(function() {
        controller = new RAML.Controllers.RAMLConsole({}, {}, parserWrapperStub);
      });

      it('does not show', function() {
        expect(controller.showRootDocumentation()).toBeFalsy();
      });
    });

    describe("when enabled", function() {
      describe("with root documentation", function() {
        var raml = createRAML(
          'title: Example API',
          'documentation:',
          '  - title: Sample Doc',
          '    content: Sample documentation content'
          );
        parseRAML(raml);

        beforeEach(function() {
          controller = new RAML.Controllers.RAMLConsole({}, { withRootDocumentation: true });
          controller.api = RAML.Inspector.create(this.api);
        });

        it('shows', function() {
          expect(controller.showRootDocumentation()).toBeTruthy();
        });
      });

      describe("without root documentation", function() {
        var raml = createRAML(
          'title: Example API',
          'baseUri: http://www.example.com',
          '/resource:',
          '  get:'
          );

        parseRAML(raml);

        beforeEach(function() {
          controller = new RAML.Controllers.RAMLConsole({}, { withRootDocumentation: true });
          controller.api = RAML.Inspector.create(this.api);
        });

        it('does not show', function() {
          expect(controller.showRootDocumentation()).toBeFalsy();
        });

      });
    });
  });
});
