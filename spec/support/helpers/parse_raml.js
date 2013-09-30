var parseRAML = function(raml, options) {
  options = options || {};
  var into = options.into || "api";

  beforeEach(function() {
    var parsed = {},
        completed = false;

    runs(function() {
      var success = function(result) {
        for (var property in result) {
          parsed[property] = result[property];
        }
        completed = true;
      }

      var error = function() {
        console.log("could not parse: " + raml);
        completed = true;
      }

      RAML.Parser.load(raml).then(success, error);
    });

    waitsFor(function() { return completed; }, "RAML parse took too long", 5000);

    this[into] = parsed;
  });
}
