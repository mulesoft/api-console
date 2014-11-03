'use strict';

var factory = require('../page_objects');
var Server = require('../helpers/server');

module.exports = function() {
  it('should diplay a RAML', function () {
    // Arrange
    var po     = factory.create('resources');
    var server = new Server(3001, 'minimum.raml', 'directive.tpl.html');

    // Act
    server.start();
    browser.get('http://localhost:3001');

    // Assert
    expect(po.title.isPresent()).toBe(true);
    expect(po.getTitle()).toBe('Example API');
  });

  it('should display error page if RAML is wrong', function () {
    // Arrange
    var po     = factory.create('error');
    var server = new Server(3002, 'wrong.raml', 'directive.tpl.html');

    // Act
    server.start();
    browser.get('http://localhost:3002');

    // Assert
    expect(po.title.isPresent()).toBe(true);
    expect(po.getTitle()).toBe('Error while loading http://localhost:3002/raml/wrong.raml');

    expect(po.errorMessage.isPresent()).toBe(true);
    expect(po.getErrorMessage()).toBe('unknown property ti tle');

    expect(po.errorSnippet.isPresent()).toBe(true);
    expect(po.getErrorSnippet()).toBe('ti tle: Example API');

    po.getRaml().then(function (value) {
      var expected = po.examples.minimum.join('').replace(/ /g, '');

      value = value.split('\n').join('').replace(/ /g, '');

      expect(value).toBe(expected);
    });
  });
};
