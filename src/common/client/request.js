(function() {
  'use strict';

  var CONTENT_TYPE = 'content-type';
  var FORM_DATA = 'multipart/form-data';

  var RequestDsl = function(options) {
    var rawData;
    var queryParams;
    var isMultipartRequest;

    this.data = function(data) {
      if (data === undefined) {
        return RAML.Utils.clone(rawData);
      } else {
        rawData = data;
      }
    };

    this.queryParams = function(parameters) {
      if (parameters === undefined) {
        return RAML.Utils.clone(queryParams);
      } else {
        queryParams = parameters;
      }
    };

    this.queryParam = function(name, value) {
      queryParams = queryParams || {};
      queryParams[name] = value;
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
      var o = RAML.Utils.copy(options);
      o.traditional = true;

      if (rawData) {
        if (isMultipartRequest) {
          var data = new FormData();

          var appendValueForKey = function(key) {
            return function(value) {
              data.append(key, value);
            };
          };

          for (var key in rawData) {
            rawData[key].forEach(appendValueForKey(key));
          }

          o.processData = false;
          o.data = data;
        } else {
          o.processData = true;
          o.data = rawData;
        }
      }

      if (!RAML.Utils.isEmpty(queryParams)) {
        var separator = (options.uri.match('\\?') ? '&' : '?');
        o.uri = options.uri + separator + jQuery.param(queryParams, true);
      }

      if (!RAML.Settings.disableProxy && RAML.Settings.proxy) {
        o.uri = RAML.Settings.proxy + o.uri;
      }

      return o;
    };
  };

  RAML.Client.Request = {
    create: function(uri, method) {
      return new RequestDsl({ uri: uri, method: method.toUpperCase(), contentType: false });
    }
  };
})();
