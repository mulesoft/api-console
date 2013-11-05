(function() {
  'use strict';

  var CONTENT_TYPE = 'content-type';

  var RequestDsl = function(options) {
    this.data = function(data) {
      options.data = data;
    };

    this.queryParam = function(name, value) {
      options.data = options.data || {};
      options.data[name] = value;
    };

    this.header = function(name, value) {
      options.headers = options.headers || {};
      options.headers[name] = value;

      if (name.toLowerCase() === CONTENT_TYPE) {
        options.contentType = value;
      }
    };

    this.headers = function(headers) {
      options.headers = {};
      options.contentType = undefined;

      for (var name in headers) {
        this.header(name, headers[name]);
      }
    };

    this.toOptions = function() {
      return options;
    };
  };

  RAML.Client.Request = {
    create: function(url, method) {
      var request = {};
      RequestDsl.call(request, { url: url, type: method });

      return request;
    }
  };
})();
