describe('API Documentation', function() {
  var ptor = protractor.getInstance();

  var findParameterRow = function (paramIndex) {
    var param = ptor.findElement(protractor.By.css("[role='parameter']:nth-child(" + paramIndex +")"));

    return {
      row: param,
      findCell: function (cellIndex) {
        return param.findElement(protractor.By.css("td:nth-child(" + cellIndex + ")"));
      }
    }
  };

  var verifyCellData = function (row, cells) {
    cells.forEach(function(expectedCellText, cellIndex) {
      expect(row.findCell(cellIndex + 1).getText()).toEqual(expectedCellText);
    });
  };

  describe('for query parameters', function() {
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
      '        description: Which page to display',
      '        type: integer',
      '        example: 1',
      '        minimum: 1',
      '        maximum: 100',
      '        required: true',
      '      order:',
      '        description: The sort order of resources',
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

      waitUntilTextEquals(ptor.findElement(protractor.By.css("[role='parameters'] caption")), "Attributes");

      var param = findParameterRow(1);
      verifyCellData(param, ["page", "integer", "Which page to display", "1", "No",
        "", "Yes", "1", "100", "", "", "", ""]);

      param = findParameterRow(2);
      verifyCellData(param, ["order", "string", "The sort order of resources", "oldest", "No",
        "newest", "Yes","", "", "5", "7", '["oldest","newest"]', ""]);
    });
  });

});
