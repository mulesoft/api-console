describe("RAML.Directives.pathBuilder", function() {
  var scope, el;

  function createScope(cb) {
    var scope;
    inject(function($rootScope) {
      scope = $rootScope.$new();
      cb(scope);
    });

    return scope
  }

  function compileTemplate(tempalte, scope) {
    var compiled;
    inject(function($compile) {
      compiled = $compile(tempalte)(scope);
      scope.$digest();
    });

    return $(compiled);
  }

  function createPathBuilderScope(pathSegments) {
    return createScope(function(scope) {
      scope.method = {};
      scope.resource = { pathSegments: pathSegments };
    });
  }

  beforeEach(module('ramlConsoleApp'));

  describe("a resource with no templated parameters", function() {
    beforeEach(function() {
      scope = createPathBuilderScope(['/resource', '/search']);
      el = compileTemplate('<path-builder></path-builder>', scope);
    });

    it("renders the path segments", function() {
      expect(el).toHaveText(/\/resource[\s\S]*\/search/)
    });
  });

  describe("a resource with templated parameters", function() {
    beforeEach(function() {
      scope = createPathBuilderScope(['/resource', '/{resourceId}']);
      el = compileTemplate('<path-builder></path-builder>', scope);
    });

    it("renders templated path segments as input fields", function() {
      expect(el).toHaveText(/\/resource[\s\S]*/);
      expect(el.find('input')).toHaveAttr('placeholder', '/{resourceId}');
    });
  });
});
