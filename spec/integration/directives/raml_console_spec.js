describe("RAML.Directives.ramlConsole", function() {
  beforeEach(module('ramlConsoleApp'));

  var $el;

  var compileConsoleWithRAML = function(template, raml) {
    beforeEach(function() {
      var parseComplete = false;

      runs(function() {
        spyOn(RAML.Parser, 'loadFile').andCallFake(function() {
          return RAML.Parser.load(raml).then(function(raml) {
            parseComplete = true;
            return raml;
          });
        });

        $el = compileTemplate(template, createScope());
      });

      waitsFor(function() { return parseComplete; }, "RAML parse took too long", 5000);
    });
  };

  describe('when initialized', function() {
    var raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      'documentation:',
      '  - title: Sample Doc',
      '    content: Sample documentation content',
      '/resource:',
      '  get:'
    );
    compileConsoleWithRAML('<raml-console src="file.raml"></raml-console>', raml);

    it('does not display a root documentation link', function() {
      expect($el.find('[role="view-root-documentation"]')).not.toExist();
    });

    it("calls the RAML parser with the appropriate file", inject(function(ramlParser) {
      expect(ramlParser.loadFile).toHaveBeenCalledWith("file.raml");
    }));
  });

  describe('when initialized with a "with-root-documentation" attribute', function() {
    describe('given RAML without root documentation', function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        '/resource:',
        '  get:'
      );

      compileConsoleWithRAML('<raml-console with-root-documentation src="file.raml"></raml-console>', raml);

      it('does not display a root documentation link', function() {
        expect($el.find('[role="view-root-documentation"]')).not.toExist();
      });
    });

    describe('given RAML with root documentation', function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        'documentation:',
        '  - title: Sample Doc',
        '    content: Sample documentation content',
        '/resource:',
        '  get:'
      );
      compileConsoleWithRAML('<raml-console with-root-documentation src="file.raml"></raml-console>', raml);

      it('displays a root documentation link', function() {
        expect($el.find('[role="view-root-documentation"]')).toExist();
      });
    });
  });
});
