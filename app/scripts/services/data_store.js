(function() {
  'use strict';

  RAML.Services.DataStore = function() {
    var store = {};

    return {
      get: function(key, validate) {
        var entry = store[key];
        if (!entry) {
          return;
        }

        if (validate === true) {
          entry.valid = validate;
        }

        if (entry.valid) {
          return entry.value;
        }
      },
      set: function(key, value) {
        store[key] = {
          valid: true,
          value: value
        };
      },
      invalidate: function() {
        Object.keys(store).forEach(function(key) {
          store[key].valid = false;
        });
      }
    };
  };
})();
