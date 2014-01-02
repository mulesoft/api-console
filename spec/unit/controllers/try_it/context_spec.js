describe("RAML.Controllers.TryIt.Context", function() {
  var context;

  var raml = createRAML(
    'title: the API',
    '/resource:',
    '  get:',
    '    queryParameters:',
    '      foo:',
    '    headers:',
    '      boo:'
  );

  parseRAML(raml);
  parseRAML(raml, { into: "revisedApi"});

  beforeEach(function() {
    var inspected = RAML.Inspector.create(this.api);
    context = new RAML.Controllers.TryIt.Context(inspected.resources[0].methods[0]);
  });

});
