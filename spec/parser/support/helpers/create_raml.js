(function() {
  var header = ['#%RAML 0.2','---'];
  window.createRAML = function(lines) {
    return header.concat(lines).join('\n');
  }
})();
