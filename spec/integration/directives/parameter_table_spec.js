describe("RAML.Directives.parameterTable", function() {
  var directive, scope, $el;

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    directive = '<parameter-table heading="heading" parameters="parameters"></parameter-table>';
    scope = createScope(function(scope) {
      scope.heading = "URI Parameters";
      // Per the spec, there is always a displayName and type:
      //   If displayName is not specified, it defaults to the property's key
      //   If type is not specified, it defaults to string
      scope.parameters = [{ displayName: 'displayName', type: 'string' }];
    });
  });

  describe("header", function() {
    describe("given only a displayName and type", function() {
      beforeEach(function() {
        $el = compileTemplate(directive, scope);
      });

      it("displays the only the displayName", function() {
        expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
          /^displayName\s+string$/
        );
      });
    });

    it("displays required", function() {
      scope.parameters[0].required = true;
      $el = compileTemplate(directive, scope);
      expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
        /^displayName\s+required,\s+string$/
      );
    });

    describe("given an enum", function() {
      beforeEach(function() {
        scope.parameters[0].enum = ['one', 'two', 'three'];
        $el = compileTemplate(directive, scope);
      });

      it("displays the enum options instead of type string", function() {
        expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
          /^displayName\s+one of\s+\(one,\s+two,\s+three\)$/
        );
      });
    });

    describe("given a pattern", function() {
      beforeEach(function() {
        scope.parameters[0].pattern = "/some regex/";
        $el = compileTemplate(directive, scope);
      });

      it("displays the pattern", function() {
        expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
          /^displayName\s+string matching\s+\/some regex\/$/
        );
      });
    });

    describe("minLength and maxLength", function() {
      describe("given only a minLength", function() {
        beforeEach(function() {
          scope.parameters[0].minLength = "8";
          $el = compileTemplate(directive, scope);
        });

        it("displays the minLength", function() {
          expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
            /^displayName\s+string,\s+at least 8 characters$/
          );
        });
      });

      describe("given only a maxLength", function() {
        beforeEach(function() {
          scope.parameters[0].maxLength = "8";
          $el = compileTemplate(directive, scope);
        });

        it("displays the maxLength", function() {
          expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
            /^displayName\s+string,\s+at most 8 characters$/
          );
        });
      });

      describe("given a minLength and maxLength", function() {
        beforeEach(function() {
          scope.parameters[0].minLength = "8";
          scope.parameters[0].maxLength = "20";
          $el = compileTemplate(directive, scope);
        });

        it("displays the minLength and maxLength", function() {
          expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
            /^displayName\s+string,\s+8-20 characters$/
          );
        });
      });
    });

    describe("minimum and maximum", function() {
      describe("given only a minimum", function() {
        beforeEach(function() {
          scope.parameters[0].type = "integer";
          scope.parameters[0].minimum = "8";
          $el = compileTemplate(directive, scope);
        });

        it("displays the minimum", function() {
          expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
            /^displayName\s+integer\s+≥ 8$/
          );
        });
      });

      describe("given only a maximum", function() {
        beforeEach(function() {
          scope.parameters[0].type = "integer";
          scope.parameters[0].maximum = "8";
          $el = compileTemplate(directive, scope);
        });

        it("displays the maximum", function() {
          expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
            /^displayName\s+integer\s+≤ 8$/
          );
        });
      });

      describe("given a minimum and maximum", function() {
        beforeEach(function() {
          scope.parameters[0].type = "integer";
          scope.parameters[0].minimum = "8";
          scope.parameters[0].maximum = "20";
          $el = compileTemplate(directive, scope);
        });

        it("displays the minLength and maxLength", function() {
          expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
            /^displayName\s+integer\s+between 8-20$/
          );
        });
      });
    });

    describe("repeat", function() {
      describe("when true", function() {
        beforeEach(function() {
          scope.parameters[0].repeat = true;
          $el = compileTemplate(directive, scope);
        });

        it("displays 'repeatable'", function() {
          expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
            /^displayName\s+string,\s+repeatable$/
          );
        });
      });

      describe("when false", function() {
        beforeEach(function() {
          scope.parameters[0].repeat = false;
          $el = compileTemplate(directive, scope);
        });

        it("displays nothing", function() {
          expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
            /^displayName\s+string$/
          );
        });
      });
    });

    it("displays default", function() {
      scope.parameters[0].default = "some default value";
      $el = compileTemplate(directive, scope);
      expect($el.find('[role="parameter"] h4').text().trim()).toMatch(
        /^displayName\s+string, default: some default value$/
      );
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
        /^Example value$/
      );
    });
  });
});
