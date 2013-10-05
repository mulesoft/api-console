(function(scope) {
  var header = ['#%RAML 0.8','---'];

  scope.createRAML = function(lines) {
    var lines = Array.prototype.slice.call(arguments, 0);
    return header.concat(lines).join('\n');
  }
})(typeof(global) !== "undefined" ? global : window);
