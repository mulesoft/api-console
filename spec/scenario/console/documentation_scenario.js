describe('API Documentation', function() {
  var ptor = protractor.getInstance();

  describe('request documentation', function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      'schemas:',
      '  - an_xml_schema: |',
      '      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">',
      '        <xs:element type="xs:int" name="id"/>',
      '      </xs:schema>',
      '/resource:',
      '  post:',
      '    body:',
      '     text/xml:',
      '       schema: an_xml_schema',
      '       example: |',
      '         <?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '         <id>1511685</id>',
      '/resource/{resourceId}:',
      '  get:',
      '    queryParameters:',
      '      chunk:',
      '        displayName: page',
      '        description: Which page?',
      '        type: integer',
      '        example: 1',
      '        minimum: 1',
      '        maximum: 100',
      '        required: true',
      '      query:',
      '        description: A query parameter',
      '        repeat: true',
      '    headers:',
      '      x-custom-header:',
      '        description: API Key',
      '        type: string',
      '        required: true',
      '        pattern: /^[0-9a-f]{32}$/',
      '        example: 0a724bfa133666c5041019ef5bf5a659',
      '  post:',
      '    body:',
      '      application/x-www-form-urlencoded:',
      '        formParameters:',
      '          name:',
      '            description: The name of the resource to create',
      '            type: string',
      '            example: Comment',
      '      multipart/form-data:',
      '        formParameters:',
      '          file:',
      '            description: The data to use',
      '            type: file'
    );

    loadRamlFixture(raml);

    it('displays information about query parameters and headers', function() {
      var resource = toggleResource(2);
      var method = openMethod(1, resource);

      method.$$('[role="parameter-group"]').then(function(parameterGroups) {
        var headers = parameterGroups[0];
        expect(headers.$("h2").getText()).toEqual("Headers");

        var header = headers.$('[role="parameter"]');
        var expectedText = new RegExp([
          "x-custom-header",
          "required,",
          "string matching /^[0-9a-f]{32}$/",
          "API Key",
          "Example:",
          "0a724bfa133666c5041019ef5bf5a659"
        ].map(escapeRegExp).join('\\s+'), "i");
        expect(header.getText()).toMatch(expectedText);

        var uriParameters = parameterGroups[1];
        expect(uriParameters.$("h2").getText()).toEqual("URI Parameters");

        var uriParam = uriParameters.$('[role="parameter"]');
        var expectedText = new RegExp([
          "resourceId",
        ].map(escapeRegExp).join('\\s+'), "i");
        expect(uriParam.getText()).toMatch(expectedText);

        var queryParameters = parameterGroups[2];
        expect(queryParameters.$("h2").getText()).toEqual("Query Parameters");

        var queryParam = queryParameters.$('[role="parameter"]');
        var expectedText = new RegExp([
          "page",
          "required,",
          "integer between 1-100",
          "Which page?",
          "Example:",
          "1"
        ].map(escapeRegExp).join('\\s+'), "i");
        expect(queryParam.getText()).toMatch(expectedText);
      });
    });

    it("displays information about schemas and examples", function() {
      resource = toggleResource(1);
      method = openMethod(1, resource);

      expect(method.getText()).toMatch(new RegExp('text/xml'));
      expect(method.getText()).toMatch(new RegExp("<id>1511685</id>"));
      expect(method.getText()).toMatch('SHOW SCHEMA');
      var schemaToggle = method.$('.schema-toggle')
      schemaToggle.click();
      expect(method.getText()).toMatch(new RegExp('<xs:element type="xs:int" name="id"/>'));
    });
  });

  describe("responses tab", function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      'schemas:',
      '  - an_xml_schema: |',
      '      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">',
      '        <xs:element type="xs:int" name="id"/>',
      '      </xs:schema>',
      '/resource:',
      '  get:',
      '    responses:',
      '      200:',
      '        description: |',
      '          *Success* description',
      '        headers:',
      '          SomeHeader:',
      '            type: integer',
      '            example: 5',
      '      404:',
      '        description: |',
      '          *Error* description',
      '        body:',
      '          text/xml:',
      '            example: |',
      '              <api-response><status>Error</status></api-response>',
      '            schema: an_xml_schema'
    );

    loadRamlFixture(raml);

    it("displays headers, formatted xml response examples and schemas, and response descriptions with markdown formatting", function() {
      var resource = toggleResource(1);
      var method = openMethod(1, resource);
      var documentation = openDocumentationTab(2, method);

      documentation.findElement(protractor.By.linkText('200')).click();

      var header = documentation.$('[role="parameter"]');

      expect(header.getText()).toMatch('SomeHeader');
      expect(header.getText()).toMatch(/Example: 5/i);

      documentation.findElement(protractor.By.linkText('404')).click();
      ptor.executeScript(function() {
        document.querySelectorAll('.responses .toggle-item.active')[0].scrollIntoView()
      });
      expect(documentation.getText()).toMatch(/<api-response>[\d\s]*<status>[\d\s]*Error[\d\s]*<\/status>[\d\s]*<\/api-response>/);

      var schemaToggle = method.$('.schema-toggle')
      schemaToggle.click();
      expect(documentation.getText()).toMatch(new RegExp('<xs:element type="xs:int" name="id"/>'));

      expect(documentation.getInnerHtml()).toMatch(/<em>Success<\/em> description/);
      expect(documentation.getInnerHtml()).toMatch(/<em>Error<\/em> description/);
    });
  });
});
