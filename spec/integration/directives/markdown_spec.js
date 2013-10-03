describe("RAML.Directives.markdown", function() {
  var scope, $el, converter;

  beforeEach(module('ramlConsoleApp'));

  beforeEach(function() {
    converter = jasmine.createSpyObj('converter', ['makeHtml']);
    spyOn(Showdown, 'converter').andReturn(converter);
    converter.makeHtml.andReturn('<strong>result</strong>');

    scope = createScope();
    scope.markdownText = "input";
    $el = compileTemplate("<div markdown='markdownText'></div>", scope);
  });

  it("converts the passed text to HTML", function() {
    expect($el.html()).toEqual("<strong>result</strong>");
  });

  it("passes the input markdownText to the Showdown.converter's makeHtml method", function() {
    expect(converter.makeHtml).toHaveBeenCalledWith("input");
  });
});
