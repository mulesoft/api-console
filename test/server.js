'use strict';
/* jshint esnext:true, node:true */
const fs = require('fs');
const http = require('http');
const basicAuth = require('basic-auth');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer'); // v1.0.5
const upload = multer(); // for parsing multipart/form-data
const cookieParser = require('cookie-parser');
const busboy = require('connect-busboy');
const router = express.Router();
const ntlm = require('express-ntlm');

app.use(router);
app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(busboy());
app.use(function(req, res, next) {
  if (!req.is('multipart/*') || !req.busboy) {
    next();
    return;
  }
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding +
      ', mimetype: ' + mimetype);
    file.on('data', function(data) {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
    });
  });
  req.busboy.on('field', function(fieldname, val
    /* fieldnameTruncated, valTruncated, encoding, mimetype */
  ) {
    console.log('Field [' + fieldname + ']: value: ' + val);
  });
  req.busboy.on('finish', function() {
    next();
  });
  req.pipe(req.busboy);
});

app.use('/ntlm', ntlm({
  debug: function() {
    const args = Array.prototype.slice.apply(arguments);
    console.log.apply(null, args);
  }
}));

class TestServer {
  constructor() {
    this.post = 8081;
    app.disable('x-powered-by');
    this.setHandlers();
    this.createServer();
  }

  basicAuth(req, res, next) {
    const user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
      return this.unauthorized(res);
    }
    if (user.name === 'test' && user.pass === 'test') {
      return next();
    } else {
      return this.unauthorized(res);
    }
  }

  /**
   * To be called when the user is not basic authenticated.
   *
   * @param {Object} res
   * @return {Object}
   */
  unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required (test:test)');
    return res.sendStatus(401);
  }

  createServer() {
    const httpServer = http.createServer(app);
    httpServer.listen(this.post, () => {
      console.log('HTTP started (' + this.post + ').');
    });
  }

  setHandlers() {
    this._setMain();
    this._setBasicAuth();
    this._setMeta();
    this._setJson();
    this._setXML();
    this._setCookie();
    this._setPost();
    this._setPut();
    this._setDelete();
    this._setMultipard();
    this._setRedirect();
    this._setErrors();
    this._setEmptyResponses();
    this._setNtlm();
    this._seStatusCodes();
  }

  _setMain() {
    app.get('/', (req, res) => {
      res.set('Content-Type', 'text/html');
      res.send('<h1>Non SSL connection made</h1>');
    });

    app.delete('/', (req, res) => {
      res.sendStatus(204);
    });

    app.get('/no-response', () => {
      // res.sendStatus(204);
    });

    app.get('/issue787', (req, res) => {
      res.status(204);
      res.set('Content-Type', 'application/json');
      res.set('X-Test', 'value');
      res.send('{"code":204,"message":"No Content"}');
      res.end();
    });
  }

  _setBasicAuth() {
    app.get('/auth', this.basicAuth.bind(this), (req, res) => {
      res.set('Content-Type', 'text/html');
      res.send('<h1>You are authenticated</h1>');
    });
  }

  _setMeta() {
    app.get('/meta', (req, res) => {
      // res.status(200).send('OK');
      res.set('Content-Type', 'text/html');
      res.set('Link', '</.meta>; rel=meta');
      res.send('<h1>You should see  </.meta>; rel=meta in the Link header  </h1>');
    });
  }

  _setJson() {
    app.get('/json', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/json1.json', 'utf8');
      // res.status(200).send('OK');
      res.set('Content-Type', 'application/json');
      res.send(json);
    });
    app.get('/json/2', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/json2.json', 'utf8');
      // res.status(200).send('OK');
      res.set('Content-Type', 'application/json');
      res.send(json);
    });
    app.get('/json/3', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/quicker-response-export.json', 'utf8');
      // res.status(200).send('OK');
      res.set('Content-Type', 'application/json');
      res.send(json);
    });
    app.get('/json/4', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/slow-response-export.json', 'utf8');
      // res.status(200).send('OK');
      res.set('Content-Type', 'application/json');
      res.send(json);
    });
    app.get('/json/error', (req, res) => {
      let json = fs.readFileSync('./tasks/test-data/json1.json', 'utf8');
      res.set('Content-Type', 'application/json');
      json = '[Eroor]: An error occured' + json;
      res.send(json);
    });
    app.get('/json/html', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/json1.json', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(json);
    });
  }

  _setXML() {
    app.get('/xml', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/xml1.xml', 'utf8');
      res.set('Content-Type', 'application/xml');
      res.send(json);
    });
    app.get('/xml2', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/xml2.xml', 'utf8');
      res.set('Content-Type', 'application/xml');
      res.send(json);
    });
    app.get('/xml3', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/xml3.xml', 'utf8');
      res.set('Content-Type', 'application/xml');
      res.send(json);
    });
    app.get('/xml4', (req, res) => {
      const json = fs.readFileSync('./tasks/test-data/xml4.xml', 'utf8');
      res.set('Content-Type', 'application/xml');
      res.send(json);
    });
  }

  uuid() {
    // jscs:disable
    /* jshint ignore:start */
    const lut = [];
    for (let i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    const fn = function() {
      const d0 = Math.random() * 0xffffffff | 0;
      const d1 = Math.random() * 0xffffffff | 0;
      const d2 = Math.random() * 0xffffffff | 0;
      const d3 = Math.random() * 0xffffffff | 0;
      return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] +
        lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' +
        lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] +
        lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    };
    return fn();
    // jscs:enable
    /* jshint ignore:end */
  }

  _setCookie() {
    // set random cookies
    app.get('/cookies/random', (req, res) => {
      const Chance = require('chance');
      const chance = new Chance();
      for (let i = 0; i < 10; i++) {
        const value = chance.string({
          length: chance.integer({
            min: 10,
            max: 100
          })
        });
        const opts = {};
        if (chance.bool()) {
          opts.expires = 0;
        }
        if (chance.bool()) {
          opts.httpOnly = true;
        }
        if (chance.bool()) {
          opts.domain = chance.domain();
        }
        res.cookie(chance.word(), value, opts);
      }
      res.cookie('rememberme', '1', {
        maxAge: 900000,
        httpOnly: true,
        domain: 'localhost',
        path: '/cookie',
        secure: true
      });
      res.set('Content-Type', 'text/html');
      res.send('<h1>Cookies are set</h1>');
    });
    // set cookies getting param keys as cookie name and param value as cookie value.
    app.get('/cookies/set', (req, res) => {
      let params = req.query;
      console.log('Dumping params');
      console.log(params);
      Object.keys(params).forEach((key) => {
        res.cookie(key, params[key], {
          path: '/'
        });
      });
      res.redirect('/cookies');
    });
    // delete cookies getting param keys as cookie name and param value as cookie value.
    app.get('/cookies/delete', (req, res) => {
      let params = req.query;
      Object.keys(params).forEach((key) => {
        res.cookie(key, params[key], {
          path: '/',
          maxAge: -86400000
        });
      });
      res.redirect('/cookies');
    });
    // list cookies
    app.get('/cookies', function(req, res) {
      let resp = {
        cookies: req.cookies
      };
      res.set('Content-Type', 'application/json');
      res.send(resp);
    });
  }

  _setPost() {
    app.post('/', upload.array(), (req, res) => {
      const response = Object.assign({}, {
        'body': req.body,
        'query': req.query
      });
      res.set('Content-Type', 'application/json');
      res.send(response);
    });
  }

  _setMultipard() {
    app.post('/post', (req, res) => {
      console.log('Calling /post');
      console.log(req.body, req.query);
      res.set('Connection', 'close');
      res.set('Content-Type', 'text/html');
      res.send('Post with success');
    });
  }

  _setPut() {
    app.put('/', (req, res) => {
      res.send('PUT request to homepage');
    });
  }

  _setDelete() {
    app.delete('/', (req, res) => {
      res.send('DELETE request to homepage');
    });
  }

  _setRedirect() {
    app.get('/fake-redirect', (req, res) => {
      res.status(200);
      res.set('Location', 'http://localhost:' + this.post + '/redirect/dest');
      res.set('Content-Type', 'application/json');
      res.set('Content-Length', 0);
      res.end();
    });
    app.get('/relative-redirect', (req, res) => {
      res.redirect('/relative-redirect/step-1');
    });
    app.get('/relative-redirect/step-1', (req, res) => {
      res.redirect('/relative-redirect/step-2');
    });
    app.get('/relative-redirect/step-2', (req, res) => {
      res.redirect('/redirect/dest');
    });
    app.get('/redirect', (req, res) => {
      res.redirect('http://localhost:' + this.post + '/redirect/dest');
    });
    app.post('/post-redirect', (req, res) => {
      res.redirect(303, 'http://localhost:' + this.post + '/redirect/dest');
    });
    app.get('/get-redirect', (req, res) => {
      res.redirect(303, 'http://localhost:' + this.post + '/redirect/dest');
    });
    app.get('/redirect/dest', (req, res) => {
      res.set('Content-Type', 'text/html');
      res.send('<h1>You have been redirected</h1>');
    });

    // Redirect the request with defined status code
    app.all('/redirect/:status', (req, res) => {
      let status = parseInt(req.params.status);
      if (status !== status) {
        res.set('Content-Type', 'text/html');
        res.send('<h1>Unknown status to send.</h1>');
        return;
      }
      res.redirect(status, 'http://localhost:' + this.post + '/redirect/dest');
    });
    // Redirect request n times.
    app.all('/redirect/n/:count', (req, res) => {
      let count = Number(req.params.count);
      if (count !== count) {
        count = 0;
      }

      if (count <= 0) {
        res.set('Content-Type', 'text/html');
        res.send('<h1>You have been redirected</h1>');
      } else {
        let url = 'http://localhost:' + this.post + '/redirect/n/';
        url += (count - 1);
        res.redirect(url);
      }
    });
  }

  _setErrors() {
    app.get('/not-found', (req, res) => {
      res.status(404).end();
    });
    app.get('/status-error', (req, res) => {
      res.status(604).end();
    });
  }

  _setEmptyResponses() {
    app.all('/empty', (req, res) => {
      const defaultStatus = 200;
      let status = req.params.status;
      if (status) {
        status = Number(status);
        if (status !== status) {
          status = defaultStatus;
        }
      } else {
        status = defaultStatus;
      }
      res.removeHeader('Date');
      res.removeHeader('Connection');
      res.removeHeader('Content-Length');
      res.removeHeader('Transfer-Encoding');
      res.status(status).end();
    });

    app.all('/null', (req, res) => {
      res.set('Content-Type', 'application/json');
      res.send('null');
    });
  }

  _setNtlm() {
    app.get('/ntlm', (req, res) => {
      res.status(200);
      res.set('Location', 'http://localhost:' + this.post + '/redirect/dest');
      res.set('Content-Type', 'application/json');
      res.send({
        state: 'authotized',
        type: 'ntlm'
      });
      res.end();
    });
    app.post('/ntlm', (req, res) => {
      res.status(200);
      const response = Object.assign({}, {
        body: req.body,
        query: req.query,
        headers: req.headers
      });
      console.log(req.body, req.query);
      console.log(req.headers);
      console.log(req);
      res.set('Content-Type', 'application/json');
      res.send(response);
      res.end();
    });
  }

  _seStatusCodes() {
    app.get('/status', (req, res) => {
      const params = req.query;
      let status = params.status ? parseInt(params.status) : 200;
      const statusText = params.text || 200;
      if (status !== status) {
        status = 200;
      }
      res.statusMessage = statusText;
      res.status(status).end();
    });
  }
}

new TestServer();
