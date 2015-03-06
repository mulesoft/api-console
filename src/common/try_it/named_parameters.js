(function() {
  'use strict';

  function copy(object) {
    var shallow = {};
    Object.keys(object || {}).forEach(function(key) {
      shallow[key] = new RAML.Services.TryIt.NamedParameter(object[key]);
    });

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
    this.parameterized = parameterized;

    Object.keys(parameterized || {}).forEach(function(key) {
      parameterized[key].created = [];
    });

    this.values = {};
    Object.keys(this.plain).forEach(function(key) {
      this.values[key] = [undefined];
    }.bind(this));
  };

  NamedParameters.prototype.clear = function (info) {
    var that = this;
    Object.keys(this.values).map(function (key) {
      if (typeof info[key][0].enum === 'undefined' || info[key][0].overwritten === true) {
        that.values[key] = [''];
      }
    });
  };

  NamedParameters.prototype.reset = function (info, field) {
    var that = this;
    if (info) {
      Object.keys(info).map(function (key) {
        if (typeof field === 'undefined' || field === key) {
          if (typeof info[key][0].enum === 'undefined') {
            if (info[key][0].type === 'date' && typeof info[key][0].example === 'object') {
              info[key][0].example = info[key][0].example.toUTCString();
            }

            that.values[key][0] = info[key][0].example;
          }
        }
      });
    }
  };

  NamedParameters.prototype.create = function(name, value) {
    var parameters = this.parameterized[name];

    var definition = parameters.map(function(parameterizedHeader) {
      return parameterizedHeader.create(value);
    });

    var parameterizedName = definition[0].displayName;

    parameters.created.push(parameterizedName);
    this.plain[parameterizedName] = new RAML.Services.TryIt.NamedParameter(definition);
    this.values[parameterizedName] = [undefined];
  };

  NamedParameters.prototype.remove = function(name) {
    delete this.plain[name];
    delete this.values[name];
    return;
  };

  NamedParameters.prototype.data = function() {
    return filterEmpty(this.values);
  };

  NamedParameters.prototype.copyFrom = function(oldParameters) {
    var parameters = this;

    Object.keys(oldParameters.parameterized || {}).forEach(function(key) {
      if (parameters.parameterized[key]) {
        oldParameters.parameterized[key].created.forEach(function(createdParam) {
          parameters.plain[createdParam] = oldParameters.plain[createdParam];
        });
      }
    });

    var keys = Object.keys(oldParameters.plain || {}).filter(function(key) {
      return parameters.plain[key];
    });

    keys.forEach(function(key) {
      parameters.values[key] = oldParameters.values[key];
    });
  };

  RAML.Services.TryIt.NamedParameters = NamedParameters;
})();
