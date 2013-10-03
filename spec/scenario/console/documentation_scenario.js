describe('API Documentation', function() {
  var ptor = protractor.getInstance();

  var findParameterTable = function (identifier) {
    var table = ptor.findElement(protractor.By.css("[role='" + identifier + "']"));

    table.findRow = function (rowIndex) {
      var selector = protractor.By.css("[role='parameter']:nth-child(" + rowIndex +")");
      var row = table.findElement(selector);

      row.findCell = function (cellIndex) {
        return row.findElement(protractor.By.css("td:nth-child(" + cellIndex + ")"));
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
      '        repeat: true'
    );

    loadRamlFixture(raml);

    it('displays information about each parameter', function() {
      var resource = openResource(1);
      var method = openMethod(1, resource);

      var table = findParameterTable('query-parameters');
      expect(table.isDisplayed()).toBeTruthy();

      var param = table.findRow(1);
      verifyCellData(param,
        ["page", "integer", "Which page?", "1", "No", "", "Yes", "1", "100", "", "", "", ""]);

      param = table.findRow(2);
      verifyCellData(param,
        ["order", "string", "", "oldest", "No", "newest", "No", "", "", "5", "7", '["oldest","newest"]', ""]);

      var table = findParameterTable('uri-parameters');
      expect(table.isDisplayed()).toBeTruthy();

      var param = table.findRow(1);
      verifyCellData(param,
        ["resourceId", "string", "", "", "No", "", "Yes", "", "", "", "", "", ""]);

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

      expect(documentation.getText()).toMatch(/xs:schema/);
      expect(documentation.getText()).toMatch(new RegExp("<id>1511685</id>"));
    });
  });
});
