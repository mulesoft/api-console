function createHttpMock() {
  var options = {};

  var mock = {
    when: function(method, url, data) {
      options.type = method;
      options.url = url;
      if (data) {
        options.data = data;
      }

      return mock;
    },

    respondWith: function(status, content) {
      options.status = status;
      options.responseText = content;

      return mock;
    },

    toOptions: function() {
      return options;
    }
  };

  return mock;
}

function mockHttp(cb) {
  $.mockjaxSettings.logging = false;

  beforeEach(function() {
    var mock = createHttpMock();
    cb(mock);
    $.mockjax(mock.toOptions());
  });

  afterEach(function() {
    $.mockjaxClear();
  });
}
