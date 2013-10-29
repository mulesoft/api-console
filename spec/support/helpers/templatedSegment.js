function templatedSegment(parameterName) {
  return {
    parameterName: parameterName,
    toString: function() {
      return '/{' + parameterName + '}';
    }
  };
}

