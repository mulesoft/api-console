(function() {
  'use strict';

  function Clone() {}

  RAML.Utils = {
    clone: function(object) {
      Clone.prototype = object;
      return new Clone();
    },

    copy: function(object) {
      var copiedObject = {};
      for (var key in object) {
        copiedObject[key] = object[key];
      }
      return copiedObject;
    },

    isEmpty: function(object) {
      if (object) {
        return Object.keys(object).length === 0;
      } else {
        return true;
      }
    },

    filterEmpty: function (object) {
      var copy = {};

      Object.keys(object).forEach(function(key) {
        var value = object[key];
        var flag = value !== undefined && value !== null && (typeof value !== 'string' || value.trim().length > 0);

        if (flag) {
          copy[key] = value;
        }
      });

      return copy;
    }
  };
})();
