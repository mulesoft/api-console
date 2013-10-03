describe("RAML.Directives.markdown", function() {
  var scope, $el, converter;

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    converter = jasmine.createSpyObj('converter', ['makeHtml']);
    spyOn(Showdown, 'converter').andReturn(converter);
    scope = createScope();
    scope.markdownText = "input";
  });

  describe("by default", function() {
    beforeEach(function() {
      converter.makeHtml.andReturn('<strong>result</strong>');
      $el = compileTemplate("<div markdown='markdownText'></div>", scope);
    });

    it("converts the passed text to HTML", function() {
      expect($el.html()).toEqual("<strong>result</strong>");
    });

    it("passes the input markdownText to the Showdown.converter's makeHtml method", function() {
      expect(converter.makeHtml).toHaveBeenCalledWith("input");
    });
  });

  describe("when Showdown returns unsafe HTML", function() {
    beforeEach(function() {
      converter.makeHtml.andReturn('<strong>unsaferesult</strong><style>body { color: red; }</style>');
      $el = compileTemplate("<div markdown='markdownText'></div>", scope);
    });

    it("strips unsafe HTML from the result", function() {
      expect($el.html()).toEqual("<strong>unsaferesult</strong>");
    });

  });
});
