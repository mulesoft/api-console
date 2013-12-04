describe("RAML.Directives.requests", function() {
  beforeEach(module('ramlConsoleApp'));

  describe('given a method with only an XML request body schema', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    body:',
      '      text/xml:',
      '        schema: superschema'
    );


    beforeEach(function() {
      compileWithScopeFromFirstResourceAndMethodOfRAML("<requests></requests>", raml);
    });

    it('displays the schema', function() {
      expect(this.$el.text()).toMatch('superschema');
    });

    it('does not display the example request section', function() {
      expect(this.$el.text()).not.toMatch('Example Request');
    });
  });

  describe('given a method with only an XML request body example', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    body:',
      '      text/xml:',
      '        example: someexample'
    );

    beforeEach(function() {
      compileWithScopeFromFirstResourceAndMethodOfRAML("<requests></requests>", raml);
    });

    it('displays the example', function() {
      expect(this.$el.text()).toMatch('someexample');
    });

    it('does not display the example schema section', function() {
      expect(this.$el.text()).not.toMatch('Example Schema');
    });
  });

  describe('given a method with form data', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    body:',
      '      application/x-www-form-urlencoded:',
      '        formParameters:',
      '          some_form_parameter: '
    );

    beforeEach(function() {
      compileWithScopeFromFirstResourceAndMethodOfRAML("<requests></requests>", raml);
    });

    it('displays the form parameters', function() {
      expect(this.$el.text()).toMatch('some_form_parameter');
    });
  });

  describe('given a method with multi-part form data', function() {
    var raml = createRAML(
      'title: Example API',
      '/resource:',
      '  get:',
      '    body:',
      '      multipart/form-data:',
      '        formParameters:',
      '          some_form_parameter: '
    );

    beforeEach(function() {
      compileWithScopeFromFirstResourceAndMethodOfRAML("<requests></requests>", raml);
    });

    it('displays the form parameters', function() {
      expect(this.$el.text()).toMatch('some_form_parameter');
    });
  });
});
