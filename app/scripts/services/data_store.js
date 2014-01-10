(function() {
  'use strict';

  RAML.Services.DataStore = function() {
    var store = {};

    return {
      get: function(key) {
        var entry = store[key];
        if (!entry) {
          return;
        } else {
          return entry.value;
        }
      },
      set: function(key, value) {
        store[key] = {
          valid: true,
          value: value
        };
      },
      reset: function() {
        store = {};
      }
    };
  };
})();
