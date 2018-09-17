(function () {
  /* jshint -W034 */
  'use strict';

  if (typeof Object.assign !== 'function') {
    Object.defineProperty(Object, 'assign', {
      value: function assign(target, varArgs) {
        'use strict';
        if (target == null) { throw new TypeError('Cannot convert undefined or null to object'); }

        var to = Object(target);

        for (var index = 1; index < varArgs.length; index++) {
          var nextSource = varArgs[index];

          if (nextSource != null) {
            for (var nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }
})();
