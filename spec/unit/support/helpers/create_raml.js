(function() {
  var header = ['#%RAML 0.2','---'];

  window.createRAML = function() {
    var lines = Array.prototype.slice.call(arguments, 0);
    return header.concat(lines).join('\n');
  }
})();
