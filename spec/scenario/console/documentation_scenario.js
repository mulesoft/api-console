describe('API Documentation', function() {
  var ptor = protractor.getInstance();

  var findParameterTable = function (identifier) {
    var table = ptor.$('[role="' + identifier + '"]');

    table.findRow = function (rowIndex) {
      var row = table.$('[role="parameter"]:nth-child(' + rowIndex + ')');

      row.findCell = function (cellIndex) {
        return row.$('td:nth-child(' + cellIndex + ')');
      }
      return row;
    };

    return table;
  };

  var verifyCellData = function (row, cells) {
    cells.forEach(function(expectedCellText, cellIndex) {
      expect(row.findCell(cellIndex + 1).getText()).toEqual(expectedCellText);
    });
  };


  describe('parameters tab', function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: #{test_api_uri}',
      '/resource/#{resourceId}:',
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
      '      order:',
      '        type: string',
      '        enum: ["oldest", "newest"]',
      '        example: oldest',
      '        minLength: 5',
      '        maxLength: 7',
      '        default: newest',
      '      query:',
      '        description: A query parameter',
      '        repeat: true',
      '    headers:',
      '      x-custom-header:',
      '        description: API Key',
      '        type: string',
      '        pattern: /^[0-9a-f]{32}$/',
      '        example: 0a724bfa133666c5041019ef5bf5a659'
    );

    loadRamlFixture(raml);

    it('displays information about query parameters and headers', function() {
      var resource = openResource(1);
      var method = openMethod(1, resource);

      // query parameters
      var queryParametersTable = findParameterTable('query-parameters');
      expect(queryParametersTable.isDisplayed()).toBeTruthy();

      var queryParam = queryParametersTable.findRow(1);
      verifyCellData(queryParam,
        ["page", "integer", "Which page?", "1", "No", "", "Yes", "1", "100", "", "", "", ""]);

      queryParam = queryParametersTable.findRow(2);
      verifyCellData(queryParam,
        ["order", "string", "", "oldest", "No", "newest", "No", "", "", "5", "7", '["oldest","newest"]', ""]);

      var queryParametersTable = findParameterTable('uri-parameters');
      expect(queryParametersTable.isDisplayed()).toBeTruthy();

      var queryParam = queryParametersTable.findRow(1);
      verifyCellData(queryParam,
        ["resourceId", "string", "", "", jasmine.any(String), "", jasmine.any(String), "", "", "", "", "", ""]);

      // headers
      var headersTable = findParameterTable('headers');
      expect(headersTable.isDisplayed()).toBeTruthy();

      var customHeader = headersTable.findRow(1);
      verifyCellData(
        customHeader,
        ["x-custom-header", "string", "API Key", "0a724bfa133666c5041019ef5bf5a659",
         "No", "", "Yes", "", "", "", "", "", "/^[0-9a-f]{32}$/"]
      );

    });
  });

  describe("requests tab", function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: #{test_api_uri}',
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
      '         <id>1511685</id>'
    );

    loadRamlFixture(raml);

    it("displays examples and schemas for the request body", function() {
      var resource = openResource(1);
      var method = openMethod(1, resource);
      var documentation = openDocumentationTab(2, method);

      expect(documentation.getText()).toMatch(new RegExp('text/xml'));
      expect(documentation.getText()).toMatch(new RegExp('<xs:element type="xs:int" name="id"/>'));
      expect(documentation.getText()).toMatch(new RegExp("<id>1511685</id>"));
    });
  });

  describe("responses tab", function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: #{test_api_uri}',
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

    it("displays formatted xml response examples and schemas, and response descriptions with markdown formatting", function() {
      var resource = openResource(1);
      var method = openMethod(1, resource);
      var documentation = openDocumentationTab(3, method);

      expect(documentation.getText()).toMatch(new RegExp('<xs:element type="xs:int" name="id"/>'));
      expect(documentation.getText()).toMatch(/<api-response>[\d\s]*<status>[\d\s]*Error[\d\s]*<\/status>[\d\s]*<\/api-response>/);

      expect(documentation.getInnerHtml()).toMatch(/<em>Success<\/em> description/);
      expect(documentation.getInnerHtml()).toMatch(/<em>Error<\/em> description/);
    });
  });
});
