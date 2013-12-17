describe("RAML.Directives.namedParametersDocumentation", function() {
  var scope, $el, template = '<named-parameters-documentation heading="heading" parameters="parameters"></named-parameters-documentation>';

  function createScopeForNamedParametersDocumentation(heading) {
    var definitions = Array.prototype.slice.call(arguments, 1);
    // Per the spec, there is always a displayName and type:
    //   If displayName is not specified, it defaults to the property's key
    //   If type is not specified, it defaults to string
    definitions.forEach(function(definition) {
      definition.displayName = "display name";
    });

    return createScope(function(scope) {
      scope.heading = heading;
      scope.parameters = [ definitions ];
    });
  }

  beforeEach(module('ramlConsoleApp'));

  describe("by default", function() {
    beforeEach(function() {
      scope = createScopeForNamedParametersDocumentation("URI Parameters", {
        type: 'string',
        description: "Some description"
      });
      $el = compileTemplate(template, scope);
      $parameterEl = $el.find('[role="parameter"]');
    });

    it("displays description", function() {
      expect($parameterEl.find('[role="description"]').text().trim()).toMatch(/^Some description$/);
    });

    it("displays example", function() {
      expect($parameterEl.find('[role="example"]').length).toEqual(0);
    });
  });

  describe("with an example", function() {
    beforeEach(function() {
      scope = createScopeForNamedParametersDocumentation("URI Parameters", {
        type: 'string',
        description: "Some description",
        example: "value"
      });
      $el = compileTemplate(template, scope);
      $parameterEl = $el.find('[role="parameter"]');
    });

    it("displays example", function() {
      expect($parameterEl.find('[role="example"]').text().trim()).toMatch(/^value$/);
    });
  });

  describe("with multiple types", function() {
    beforeEach(function() {
      scope = createScopeForNamedParametersDocumentation("URI Parameters", {type: 'string'}, {type: 'file'});
      $el = compileTemplate(template, scope);
      $parameterEl = $el.find('[role="parameter"]');
    });

    it("displays documentation for each type", function() {
      expect($parameterEl.find('[role="description"]').length).toEqual(2);
    });
  });

  describe("when the description has markdown", function() {
    beforeEach(function() {
      scope = createScopeForNamedParametersDocumentation("URI Parameters", {
        type: 'string',
        description: "Some **bolded text**\n\nSome other text"
      });
      $el = compileTemplate(template, scope);
    });

    it("formats description with markdown", function() {
      expect($el.find('[role="parameter"] .info [role="description"]').html().trim().replace(/\s+/g, ' ')).toEqual(
        "<p>Some <strong>bolded text</strong></p> <p>Some other text</p>"
      );
    });
  });
});
