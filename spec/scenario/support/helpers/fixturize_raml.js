(function() {
  var path = require('path'), fs = require('fs');

  global.fixturizeRaml = function(raml) {
    var fixturePath = path.join(__dirname, "../../../../app/fixture.yml")

    beforeEach(function() {
      fs.writeFileSync(fixturePath, raml);
    });

    afterEach(function() {
      fs.unlinkSync(fixturePath);
    });

    return path.basename(fixturePath);
  };

  global.loadRamlFixture = function(raml) {
    var ramlFilename = fixturizeRaml(raml);

    beforeEach(function() {
      ptor = protractor.getInstance();
      ptor.get('http://localhost:9001');
      ptor.$('input[type="text"]').sendKeys(ramlFilename);
      ptor.$('button[role="load_from_url"]').click();
    });
  };
})()
