describe("Verifying parser output", function() {
  beforeEach(function() {
    var defaultOptions = {
      type: "string",
      required: true,
      displayName: "something"
    };

    var verifyProperties = function(host, properties) {
      if (!host) {
        return false;
      }

      properties = properties || {};
      var satisfied = true;
      for (var property in properties) {
        if (host[property] !== properties[property]) {
          satisfied = false;
        }
      }

      return satisfied;
    }

    this.addMatchers({
      toHaveDefinedUriParameter: function(name, options) {
        options = options || {};
        var parameter = this.actual[name];
        var defined = verifyExists(parameter);
        var optionsSatisfied = verifyUriParameter(name, parameter, options);

        return defined && optionsSatisfied;
      },

      toHaveDefinedMethod: function(verb, queryParameters) {
        var method = this.actual.methods.filter(function(method) {
          return method.method == verb;
        })[0];
        var defined = verifyExists(method);
        var queryParametersSatisfied = true;

        for (var parameterName in method.queryParameters) {
          var parameter = method.queryParameters[parameterName];
          var options = extend({}, defaultOptions, queryParameters[parameterName])

          if (!verifyProperties(parameter, options)) {
            queryParametersSatisfied = false;
          }
        }

        return defined && queryParametersSatisfied;
      }
    });
  });

  describe("with baseURI params", function() {
    describe("by default, inferred", function() {
      var definition = createRAML(
        'title: MyApi',
        'baseUri: http://example.com/{something}',
        '/resource:',
        '  get: !!null'
      );

      beforeEach(function() {
        this.api = parseRAML(definition);
      });

      it("specifies a default definition in baseUriParameters", function() {
        expect(this.api.baseUriParameters).toBeDefined();
        expect(this.api.baseUriParameters).toHaveDefinedUriParameter("something")
      });
    });

    describe("by default, specified", function() {
      var definition = createRAML(
        'title: MyApi',
        'baseUri: http://example.com/{something}',
        'baseUriParameters:',
        '  something:',
        '    description: something description',
        '/resource:',
        '  get: !!null'
      );

      beforeEach(function() {
        this.api = parseRAML(definition);
      });

      it("specifies a default definition in baseUriParameters", function() {
        expect(this.api.baseUriParameters).toBeDefined();
        expect(this.api.baseUriParameters).toHaveDefinedUriParameter("something", {
          description: "something description"
        });
      });
    });

    describe("when reserved, inferred", function() {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'baseUri: http://example.com/{version}',
        '/resource:',
        '  get:'
      ].join('\n');

      beforeEach(function() {
        this.api = parseRAML(definition);
      });

      it("specifies a default baseUriParameters definition", function() {
        expect(this.api.baseUriParameters).toBeDefined();
        expect(this.api.baseUriParameters).toHaveDefinedUriParameter("version");
      });
    });

    describe("when reserved, specified", function() {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'baseUri: http://example.com/{version}',
        'baseUriParameters:',
        '  version:',
        '    description: version description',
        '/resource:',
        '  get: !!null'
      ].join('\n');

      beforeEach(function() {
        this.api = parseRAML(definition);
      });

      it("specifies a default baseUriParameters definition", function() {
        expect(this.api.baseUriParameters).toBeDefined();
        expect(this.api.baseUriParameters).toHaveDefinedUriParameter("version", {
          description: "version description"
        });
      });
    });
  });

  describe("with a resource that defines query parameters", function() {
    describe("which defines a new method", function() {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'baseUri: http://example.com/',
        '/resource:',
        '  get:',
        '    queryParameters:',
        '      foo: !!null'
      ].join('\n');

      beforeEach(function() {
        this.api = parseRAML(definition);
      });

      it("includes default values for the query parameter", function() {
        var resource = findResource("/resource", this.api);
        expect(resource).toHaveDefinedMethod("get", { foo: { type: "string" }});
      });
    });
  });

  describe("with a resource that includes a resource type", function() {
    describe("which defines a new method", function() {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'baseUri: http://example.com/',
        'resourceTypes:',
        '  - collection:',
        '      get: ',
        '        queryParameters: ',
        '          foo: ',
        '            type: string ',
        '/resource:',
        '  type: collection'
      ].join('\n');

      beforeEach(function() {
        this.api = parseRAML(definition);
      });

      it("applies the method", function() {
        var resource = findResource("/resource", this.api);
        expect(resource).toHaveDefinedMethod("get", { foo: { type: "string" , displayName: "foo"}});
      });
    });
  });
});
