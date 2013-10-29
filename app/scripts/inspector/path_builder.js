(function () {
  'use strict';

  var PathSegment = function(pathSegment) {
    this.text = pathSegment.toString();
    this.parameterName = pathSegment.parameterName;
    this.templated = !!this.parameterName;
  };

  PathSegment.prototype.toString = function() {
    return this.templated ? this.parameterName : this.text;
  };

  PathSegment.prototype.replaceWith = function(value) {
    if (this.templated) {
      return '/' + value;
    } else {
      return this.toString();
    }
  };

  function convertPathSegment(pathSegment) {
    return new PathSegment(pathSegment);
  }

  function createTemplate(pathSegments) {
    var template = function(context) {
      context = context || {};

      return pathSegments.map(function(pathSegment) {
        return pathSegment.replaceWith(context[pathSegment.parameterName]);
      }).join('');
    };

    template.segments = pathSegments;

    return template;
  }

  RAML.Inspector.PathBuilder = {
    create: function(pathSegments) {
      return createTemplate(pathSegments.map(convertPathSegment));
    }
  };
})();
