(function () {
  'use strict';

  var templateMatcher = /\{(.*)\}/;

  var PathSegment = function(pathSegment) {
    this.text = pathSegment;

    var match = pathSegment.match(templateMatcher);
    this.templated = !!match;
    if (match) {
      this.parameterName = match[1];
    }
  }

  PathSegment.prototype.toString = function() {
    return this.text;
  }

  PathSegment.prototype.replaceWith = function(value) {
     if (this.templated) {
       return "/" + value;
     } else {
       return this.toString();
     }
  }

  function convertPathSegment(pathSegment) {
    return new PathSegment(pathSegment);
  }

  function createTemplate(pathSegments) {
    var template = function(context) {
      context = context || {};

      return pathSegments.map(function(pathSegment) {
        return pathSegment.replaceWith(context[pathSegment.parameterName]);
      }).join("");
    }

    template.segments = pathSegments;

    return template
  }

  RAML.Inspector.PathBuilder = {
    create: function(pathSegments) {
      return createTemplate(pathSegments.map(convertPathSegment));
    }
  }
})();
