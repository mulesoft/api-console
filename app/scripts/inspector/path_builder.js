(function () {
  'use strict';

  var PathSegment = function() {};

  function convertPathSegment(pathSegment) {
    PathSegment.prototype = pathSegment;
    var clone = new PathSegment();

    clone.text = pathSegment.toString();
    clone.parameterName = pathSegment.parameterName;
    clone.templated = !!clone.parameterName;
    clone.toString = function() {
      return this.templated ? this.parameterName : this.text;
    };

    clone.replaceWith = function(value) {
      if (this.templated) {
        return '/' + value;
      } else {
        return this.toString();
      }
    };

    return clone;
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
