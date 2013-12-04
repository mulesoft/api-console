describe("RAML.Directives.markdown", function() {
  var scope, $el;

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    scope = createScope();
    scope.markdownText = "__result__";
  });

  describe("by default", function() {
    beforeEach(function() {
      $el = compileTemplate("<div markdown='markdownText'></div>", scope);
    });

    it("converts the passed text to HTML", function() {
      expect($el.html()).toEqual("<p><strong>result</strong></p>");
    });

    it("refreshes the display when the markdown changes", function() {
      scope.markdownText = "_result_";
      scope.$digest();
      expect($el.html()).toEqual("<p><em>result</em></p>");
    });
  });

  describe("when Showdown returns unsafe HTML", function() {
    var converter;

    beforeEach(function() {
      converter = jasmine.createSpyObj('converter', ['makeHtml']);
      converter.makeHtml.andReturn('<strong>unsaferesult</strong><style>body { color: red; }</style>');
      spyOn(Showdown, 'converter').andReturn(converter);
      $el = compileTemplate("<div markdown='markdownText'></div>", scope);
    });

    it("strips unsafe HTML from the result", function() {
      expect($el.html()).toEqual("<strong>unsaferesult</strong>");
    });

  });

  describe("given a markdown table", function() {
    beforeEach(function() {
      scope.markdownText = [
        '|Some Table Column           |Another Column    |Col|',
        '|----------------------------|------------------|---|',
        '|some *markdown* value       | another **value**|yes|',
        '|some `code` value           | just text        |no |'
      ].join("\n");
      $el = compileTemplate("<div markdown='markdownText'></div>", scope);
    });

    it("converts the passed text to HTML", function() {
      expect($el.html()).toContain("<table>");
      expect($el.html()).toContain("<code>code</code>");
    });
  });
});
