function templatedSegment(parameterName, constraints) {
  constraints = constraints || {};

  var templated = {
    parameterName: parameterName,
    toString: function() {
      return '/{' + parameterName + '}';
    }
  }

  Object.keys(constraints).forEach(function(key) {
    templated[key] = constraints[key];
  });

  return templated;
}

