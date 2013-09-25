(function() {
  window.extend = function(destination) {
    var sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach(function(source) {
      for (var property in source) {
        destination[property] = source[property];
      }
    });

    return destination;
  };
})();
