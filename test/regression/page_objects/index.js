'use strict';

module.exports = {
  create: function (poName) {
    return new (require('../page_objects/' + poName + 'PO'))();
  }
};
