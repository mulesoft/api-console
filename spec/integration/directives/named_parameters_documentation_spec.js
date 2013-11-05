describe("RAML.Directives.namedParametersDocumentation", function() {
  var directive, scope, $el;
  var parameterHeaderSelector = '[role="parameter"] h4';

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    directive = '<named-parameters-documentation heading="heading" parameters="parameters"></named-parameters-documentation>';
    scope = createScope(function(scope) {
      scope.heading = "URI Parameters";
      // Per the spec, there is always a displayName and type:
      //   If displayName is not specified, it defaults to the property's key
      //   If type is not specified, it defaults to string
      scope.parameters = [{ displayName: 'displayName', type: 'string' }];
    });
  });

  describe("content", function() {
    describe("description", function() {
      it("displays description", function() {
        scope.parameters[0].description = "Some description";
        $el = compileTemplate(directive, scope);
        expect($el.find('[role="parameter"] .info').text().trim()).toMatch(
          /^Some description$/
        );
      });

      it("formats description with markdown", function() {
        scope.parameters[0].description = "Some **bolded text**\n\nSome other text";
        $el = compileTemplate(directive, scope);
        expect($el.find('[role="parameter"] .info [role="description"]').html().trim().replace(/\s+/g, ' ')).toEqual(
          "<p>Some <strong>bolded text</strong></p> <p>Some other text</p>"
        );
      });
    });

    it("displays example", function() {
      scope.parameters[0].example = "value";
      $el = compileTemplate(directive, scope);
      expect($el.find('[role="parameter"] .info').text().trim()).toMatch(
        /^Example: value$/
      );
    });
  });
});
