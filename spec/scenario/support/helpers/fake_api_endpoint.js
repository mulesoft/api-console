(function() {
  var path = require('path'),
      fs = require('fs');

  global.fakeApiEndpoint = function(filename, content) {
    var fixturePath = path.join(__dirname, "../../../../app/" + filename)

    beforeEach(function() {
      fs.writeFileSync(fixturePath, content);
    });

    afterEach(function() {
      fs.unlinkSync(fixturePath);
    });
  }
})()
