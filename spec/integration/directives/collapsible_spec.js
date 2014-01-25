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

    it("has the collapsible-content collapsed by default", function() {
      expect($(".content")).not.toBeVisible();
    });

    it("shows the content on clicking the heading", function() {
      click($(".heading"));
      expect($(".content")).toBeVisible();
    });
  });

  describe("when given the 'expanded' attribute set to false", function() {
    beforeEach(function() {
      scope = createScope();
      scope.expanded = false;

      $el = compileTemplate([
        "<collapsible expanded='expanded'>",
          "<h3 class='heading' collapsible-toggle>Collapse me!</h3>",
          "<div class='content' collapsible-content>I feel small</div>",
         "</collapsible>"
        ].join("\n"), scope);

      setFixtures($el);
    });

    it("has the collapsible-content collapsed", function() {
      expect($(".content")).not.toBeVisible();
    });
  });

  describe("when given the 'expanded' attribute set to true", function() {
    beforeEach(function() {
      scope = createScope();
      scope.expanded = true;

      $el = compileTemplate([
        "<collapsible expanded='expanded'>",
          "<h3 class='heading' collapsible-toggle>Collapse me!</h3>",
          "<div class='content' collapsible-content>I feel small</div>",
         "</collapsible>"
        ].join("\n"), scope);

      setFixtures($el);
    });

    it("has the collapsible-content expanded", function() {
      expect($(".content")).toBeVisible();
    });
  });

  describe("when given the 'collapsed' attribute set to false", function() {
    beforeEach(function() {
      scope = createScope();
      scope.collapsed = false;

      $el = compileTemplate([
        "<collapsible collapsed='collapsed'>",
          "<h3 class='heading' collapsible-toggle>Collapse me!</h3>",
          "<div class='content' collapsible-content>I feel small</div>",
         "</collapsible>"
        ].join("\n"), scope);

      setFixtures($el);
    });

    it("has the collapsible-content expanded", function() {
      expect($(".content")).toBeVisible();
    });
  });

  describe("when given the 'collapsed' attribute set to true", function() {
    beforeEach(function() {
      scope = createScope();
      scope.collapsed = true;

      $el = compileTemplate([
        "<collapsible collapsed='collapsed'>",
          "<h3 class='heading' collapsible-toggle>Collapse me!</h3>",
          "<div class='content' collapsible-content>I feel small</div>",
         "</collapsible>"
        ].join("\n"), scope);

      setFixtures($el);
    });

    it("has the collapsible-content collapsed", function() {
      expect($(".content")).not.toBeVisible();
    });
  });

  describe("when the 'collapsed' attribute changes", function() {
    beforeEach(function() {
      scope = createScope();
      scope.collapsed = true;

      $el = compileTemplate([
        "<collapsible collapsed='collapsed'>",
          "<h3 class='heading' collapsible-toggle>Collapse me!</h3>",
          "<div class='content' collapsible-content>I feel small</div>",
         "</collapsible>"
        ].join("\n"), scope);

      setFixtures($el);
    });

    it("updates the state of the collapsible", function() {
      expect($(".content")).not.toBeVisible();
      angular.element($el[0]).scope().collapsed = false;
      scope.$digest();
      expect($(".content")).toBeVisible();
    });
  });

});
