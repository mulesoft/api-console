'use strict';

(function() {
  var controller = function($scope) {
    $scope.namedParametersDocumentation = this;
  };

  controller.prototype.constraints = function(parameter) {
    var result = '';

    if (parameter.required) {
      result += 'required, ';
    }

    if (Array.isArray(parameter.enum)) {
      result += 'one of (' + parameter.enum.join(', ') + ')';
    } else {
      result += parameter.type;
    }

    if (parameter.pattern) {
      result += ' matching ' + parameter.pattern;
    }

    if (parameter.minLength != null && parameter.maxLength != null) {
      result += ', ' + parameter.minLength + '-' + parameter.maxLength + ' characters';
    } else if (parameter.minLength != null && parameter.maxLength == null) {
      result += ', at least ' + parameter.minLength + ' characters';
    } else if (parameter.maxLength != null && parameter.minLength == null) {
      result += ', at most ' + parameter.maxLength + ' characters';
    }

    if (parameter.minimum != null && parameter.maximum != null) {
      result += ' between ' + parameter.minimum + '-' + parameter.maximum;
    } else if (parameter.minimum != null && parameter.maximum == null) {
      result += ' ≥ ' + parameter.minimum;
    } else if (parameter.maximum != null && parameter.minimum == null) {
      result += ' ≤ ' + parameter.maximum;
    }

    if (parameter.repeat) {
      result += ', repeatable';
    }

    if (parameter.default != null) {
      result += ', default: ' + parameter.default;
    }

    return result;
  };

  RAML.Controllers.NamedParametersDocumentation = controller;
})();
