'use strict';

console.log('loading copy_vendor.js');

exports.name = 'copyVendor';

exports.createConfig = function(context, block) {
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  console.log(context);
  console.log(block);
  console.log(block.dest);
};
