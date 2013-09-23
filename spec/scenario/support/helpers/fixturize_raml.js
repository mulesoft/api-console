(function() {
  var path = require('path'),
      fs = require('fs');

  global.fixturizeRaml = function(raml) {
    var fixturePath = path.join(__dirname, "../../../../app/fixture.yml")

    beforeEach(function() {
      fs.writeFileSync(fixturePath, raml);
    });

    afterEach(function() {
      fs.unlinkSync(fixturePath);
    });

    return path.basename(fixturePath);
  }
})()
