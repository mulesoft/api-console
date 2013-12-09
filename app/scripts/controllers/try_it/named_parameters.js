(function() {
  'use strict';

  function copy(object) {
    var shallow = {};
    if (object) {
      Object.keys(object).forEach(function(key) {
        shallow[key] = object[key];
      });
    }

    return shallow;
  }

  function filterEmpty(object) {
    var copy = {};

    Object.keys(object).forEach(function(key) {
      if (object[key] && (typeof object[key] !== 'string' || object[key].trim().length > 0)) {
        copy[key] = object[key];
      }
    });

    return copy;
  }

  var NamedParameters = function(plain, parameterized) {
    this.plain = copy(plain);
    this.parameterized = copy(parameterized);
    this.values = {};
  };

  NamedParameters.prototype.create = function(name, value) {
    var header = this.parameterized[name].create(value);
    this.plain[header.displayName] = header;
  };

  NamedParameters.prototype.remove = function(name) {
    return delete this.plain[name];
  };

  NamedParameters.prototype.data = function() {
    return filterEmpty(this.values);
  };

  RAML.Controllers.TryIt.NamedParameters = NamedParameters;
})();
