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
      var values = object[key].filter(function(value) {
        return value !== undefined && value !== null && (typeof value !== 'string' || value.trim().length > 0);
      });

      if (values.length > 0) {
        copy[key] = values;
      }
    });

    return copy;
  }

  var NamedParameters = function(plain, parameterized) {
    this.plain = copy(plain);
    this.parameterized = copy(parameterized);
    this.values = {};
    Object.keys(this.plain).forEach(function(key) {
      this.values[key] = [];
    }.bind(this));
  };

  NamedParameters.prototype.create = function(name, value) {
    var header = this.parameterized[name].create(value);
    this.plain[header.displayName] = header;
    this.values[header.displayName] = [value];
  };

  NamedParameters.prototype.remove = function(name) {
    delete this.plain[name];
    delete this.values[name];
    return;
  };

  NamedParameters.prototype.data = function() {
    return filterEmpty(this.values);
  };

  RAML.Controllers.TryIt.NamedParameters = NamedParameters;
})();
