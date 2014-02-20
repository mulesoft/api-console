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

    if (parameter.enum) {
      result += 'one of (' + parameter.enum.join(', ') + ')';
    } else {
      result += parameter.type;
    }

    if (parameter.pattern) {
      result += ' matching ' + parameter.pattern;
    }

    if (parameter.minLength && parameter.maxLength) {
      result += ', ' + parameter.minLength + '-' + parameter.maxLength + ' characters';
    } else if (parameter.minLength && !parameter.maxLength) {
      result += ', at least ' + parameter.minLength + ' characters';
    } else if (parameter.maxLength && !parameter.minLength) {
      result += ', at most ' + parameter.maxLength + ' characters';
    }


    if (parameter.minimum && parameter.maximum) {
      result += ' between ' + parameter.minimum + '-' + parameter.maximum;
    } else if (parameter.minimum && !parameter.maximum) {
      result += ' ≥ ' + parameter.minimum;
    } else if (parameter.maximum && !parameter.minimum) {
      result += ' ≤ ' + parameter.maximum;
    }

    if (parameter.repeat) {
      result += ', repeatable';
    }

    if (parameter.default) {
      result += ', default: ' + parameter.default;
    }

    return result;
  };

  RAML.Controllers.NamedParametersDocumentation = controller;
})();
