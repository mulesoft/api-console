(function() {
  var splitIntoSegments = function(path) {
    var filtered = path.split("/").filter(function(segment) {
      return segment.trim().length > 0;
    });

    return filtered.map(function(segment) { return "/" + segment; });
  }

  var findResourceForSegment = function(pathSegment, parent) {
    return parent.resources.filter(function(resource) {
      return resource.relativeUri == pathSegment;
    })[0];
  };

  window.findResource = function(path, api) {
    var pathSegments = splitIntoSegments(path),
        resource = api;

    pathSegments.forEach(function(pathSegment) {
      if (resource) {
        resource = findResourceForSegment(pathSegment, resource);
      }
    });

    return resource;
  }
})();
