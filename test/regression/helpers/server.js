'use strict';

function Server(port, src, template) {
  this.src      = src;
  this.port     = port;
  this.template = template;

  this.start = function () {
    var serveStatic  = require('serve-static');
    var connect      = require('connect');
    var app          = connect();
    var http         = require('http');
    var fs           = require('fs');
    var that         = this;
    var templatePath = 'test/regression/assets';
    var distPath     = 'dist';

    if (process.cwd().indexOf('regression') > 0) {
      templatePath = 'assets';
      distPath = '../../dist';
    }

    if (this.template) {
      app.use('/', function (req, res, next) {
        var template = fs.readFileSync(templatePath + '/' + that.template).toString();

        if (req.url === '/') {
          template = template.replace('@src', 'http://localhost:' + that.port + '/raml/' + that.src);
          res.write(template);
          res.end();
        } else {
          next();
        }
      });
    }

    app.use(serveStatic(templatePath));
    app.use(serveStatic(distPath));

    this.server = http.createServer(app);
    this.server.listen(this.port);
  };

  this.close = function () {
    this.server.close();
  };
}

module.exports = Server;
