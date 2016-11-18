(function () {
  'use strict';

  RAML.LoaderUtils = {
    allowedRamlOrigin: function (options) {
      var basepath = '../';
      if (typeof options.ramlOriginCheck === 'string') {
        basepath = options.ramlOriginCheck;
      }
      return basepath;
    },

    // prevent loading stuff from other hosts and/or services
    ramlOriginValidate: function (url, options) {
      var absolutePath = function (href) {
        var link = document.createElement('a');
        link.href = href;
        return link.href;
      };

      var isSameBasePath = function (href, basepath) {
        var absoluteBasepath = absolutePath(basepath);
        var absoluteRamlPath = absolutePath(href);
        return absoluteRamlPath.indexOf(absoluteBasepath, 0) === 0;
      };

      var decodedRamlUrl = decodeURIComponent(url);
      return options && options.ramlOriginCheck && !isSameBasePath(decodedRamlUrl, RAML.LoaderUtils.allowedRamlOrigin(options));
    }
  };
})();
