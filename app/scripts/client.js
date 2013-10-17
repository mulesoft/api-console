(function() {
  var CONTENT_TYPE = "content-type";

  var Client = function(parsed) {
    this.securitySchemes = parsed.securitySchemes;
  }

  Client.prototype.securityScheme = function(name) {
    var result = undefined;

    this.securitySchemes.forEach(function(scheme) {
      if (scheme[name]) {
        result = scheme[name];
      }
    });

    if (result !== undefined) {
      return result;
    } else {
      throw new Error("Undefined Security Scheme: " + name);
    }
  };

  var RequestDsl = function(options) {
    this.data = function(data) {
      options.data = data;
    }

    this.header = function(name, value) {
      options.headers = options.headers || {};
      options.headers[name] = value;

      if (name.toLowerCase() == CONTENT_TYPE) {
        options.contentType = value;
      }
    }

    this.headers = function(headers) {
      options.headers = {};
      options.contentType = undefined;

      for (var name in headers) {
        this.header(name, headers[name])
      }
    }

    this.toOptions = function() {
      return options;
    }
  }

  Client.prototype.createRequest = function(url, method) {
    var request = {};
    RequestDsl.call(request, { url: url, type: method });

    return request;
  }


  RAML.Client = {
    create: function(parsed) {
      return new Client(parsed);
    }
  };
})();
