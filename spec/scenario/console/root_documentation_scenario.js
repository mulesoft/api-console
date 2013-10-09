describe('Root-Level Documentation', function() {
  var ptor = protractor.getInstance();

  raml = createRAML(
    'title: Example API',
    'baseUri: http://www.example.com',
    'documentation:',
    '  - title: Getting Started',
    '    content: | ',
    '      *some* **markdown** content',
    '/resource:',
    '  get:',
    '  /{resourceId}:',
    '    get:'
  );

  loadRamlFixture(raml);

  it("displays the root documentation", function() {
    ptor.$('a[role="view-root-documentation"]').click();

    var gettingStartedSection = ptor.$('[role="root-documentation"] section');
    var heading = gettingStartedSection.$("h2");

    expect(heading.getText()).toEqual("Getting Started");

    var content = gettingStartedSection.$("div[markdown]");
    var expectedContent = "<p><em>some</em> <strong>markdown</strong> content</p>";

    expect(content.isDisplayed()).toBeFalsy();

    heading.click();
    expect(content.isDisplayed()).toBeTruthy();
    expect(content.getInnerHtml()).toEqual(expectedContent);
  });
});
