(function() {
  var header = ['#%RAML 0.2','---'];
  global.createRAML = function(lines) {
    return header.concat(lines).join('\n');
  }
})();
