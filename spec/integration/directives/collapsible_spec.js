describe("RAML.Directives.collapsible", function() {
  beforeEach(module('ramlConsoleApp'));

  var $el;

  describe("upon linking", function() {
    beforeEach(function() {
      $el = compileTemplate([
        "<collapsible>",
          "<h3 class='heading' collapsible-toggle>Collapse me!</h3>",
          "<div class='content' collapsible-content>I feel small</div>",
         "</collapsible>"
        ].join("\n"), createScope());

      setFixtures($el);
    });

    it("has the collapsible-content expanded by default", function() {
      expect($(".content")).toBeVisible();
    });

    it("hides the content on clicking the heading", function() {
      $(".heading").click();
      expect($(".content")).not.toBeVisible();
    });
  });

  describe("when given the 'collapsed' attribute", function() {
    beforeEach(function() {
      $el = compileTemplate([
        "<collapsible collapsed>",
          "<h3 class='heading' collapsible-toggle>Collapse me!</h3>",
          "<div class='content' collapsible-content>I feel small</div>",
         "</collapsible>"
        ].join("\n"), createScope());

      setFixtures($el);
    });

    it("has the collapsible-content collapsed", function() {
      expect($(".content")).not.toBeVisible();
    });

  });
});
