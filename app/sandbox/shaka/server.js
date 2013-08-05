var express = require('express'),
	restful = require('node-restful'),
	mongoose = restful.mongoose,
	app = express(),
	format = require('util').format;

app.use(express.bodyParser());
app.use(express.query());

mongoose.connect("mongodb://localhost/shaka");

app.all('/*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

var Project = app.resource = restful.model('projects', mongoose.Schema({
	title: String,
	description: String,
	year: Number
})).methods(['get', 'post', 'put', 'delete']);

app.get('/api/issues', function (req, res) {
	res.send({
		message: 'OK'
	});
});

app.post('/api/issues', function (req, res, next) {
	var info = {};

	info.hPubFile = {
		name: req.files.hpub.name,
		path: req.files.hpub.path,
		type: req.files.hpub.type,
		size: req.files.hpub.size
	};

	info.coverFile = {
		name: req.files.cover.name,
		path: req.files.cover.path,
		type: req.files.cover.type,
		size: req.files.cover.size
	};

	res.send(info);
});

Project.register(app, '/api/projects');

app.listen(3000);