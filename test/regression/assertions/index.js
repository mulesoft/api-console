'use strict';

module.exports = {
  create: function (className) {
    return new (require('../assertions/' + className))(className);
  }
};
