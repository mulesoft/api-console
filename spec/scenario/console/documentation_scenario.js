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

  describe('for RAML with query parameters', function() {
    raml = [
      '#%RAML 0.2',
      '---',
      'title: Example API',
      'baseUri: #{test_api_uri}',
      '/resource:',
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
      '        repeat: true'].join('\n');

    loadRamlFixture(raml);

    it('displays information about each parameter', function() {
      ptor.findElement(protractor.By.css('[role="resource"] .accordion-toggle')).click();
      ptor.findElement(protractor.By.css('[role="methodSummary"] .accordion-toggle')).click();

      var table = findParameterTable('Query Parameters');
      expect(table.isDisplayed()).toBeTruthy();

      var param = table.findRow(1);
      verifyCellData(param,
        ["page", "integer", "Which page?", "1", "No", "", "Yes", "1", "100", "", "", "", ""]);

      param = table.findRow(2);
      verifyCellData(param,
        ["order", "string", "", "oldest", "No", "newest", "No", "", "", "5", "7", '["oldest","newest"]', ""]);

      table = findParameterTable('URI Parameters');
      expect(table.isDisplayed()).toBeFalsy();
    });
  });

  describe('for raml with an implicit URI parameter', function() {
    raml = [
      '#%RAML 0.2',
      '---',
      'title: Example API',
      'baseUri: #{test_api_uri}',
      '/resource/#{resourceId}:',
      '  get: !!null'].join('\n');

    loadRamlFixture(raml);

    it('displays information about the URI parameter', function() {
      ptor.findElement(protractor.By.css('[role="resource"] .accordion-toggle')).click();
      ptor.findElement(protractor.By.css('[role="methodSummary"] .accordion-toggle')).click();

      var table = findParameterTable('URI Parameters');
      expect(table.isDisplayed()).toBeTruthy();

      var param = table.findRow(1);
      verifyCellData(param,
        ["resourceId", "string", "", "", "No", "", "Yes", "", "", "", "", "", ""]);

      table = findParameterTable('Query Parameters');
      expect(table.isDisplayed()).toBeFalsy();
    });

  });
});
