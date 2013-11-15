(function() {
  'use strict';

  var CONTENT_TYPE = 'content-type';
  var FORM_DATA = 'multipart/form-data';

  var RequestDsl = function(options) {
    var rawData;
    var isMultipartRequest;

    this.data = function(data) {
      rawData = data;
    };

    this.queryParam = function(name, value) {
      rawData = rawData || {};
      rawData[name] = value;
    };

    this.header = function(name, value) {
      options.headers = options.headers || {};

      if (name.toLowerCase() === CONTENT_TYPE) {
        if (value === FORM_DATA) {
          isMultipartRequest = true;
          return;
        } else {
          isMultipartRequest = false;
          options.contentType = value;
        }
      }

      options.headers[name] = value;
    };

    this.headers = function(headers) {
      options.headers = {};
      isMultipartRequest = false;
      options.contentType = false;

      for (var name in headers) {
        this.header(name, headers[name]);
      }
    };

    this.toOptions = function() {
      if (rawData) {
        if (isMultipartRequest) {
          var data = new FormData();

          for (var key in rawData) {
            data.append(key, rawData[key]);
          }

          options.processData = false;
          options.data = data;
        } else {
          options.processData = true;
          options.data = rawData;
        }
      }

      return options;
    };
  };

  RAML.Client.Request = {
    create: function(url, method) {
      var request = {};
      RequestDsl.call(request, { url: url, type: method, contentType: false });

      return request;
    }
  };
})();
