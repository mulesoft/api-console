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
		name: req.files.file1.name,
		path: req.files.file1.path,
		type: req.files.file1.type,
		size: req.files.file1.size
	};

	info.coverFile = {
		name: req.files.file0.name,
		path: req.files.file0.path,
		type: req.files.file0.type,
		size: req.files.file0.size
	};

	res.send(info);
});

Project.register(app, '/api/projects');

app.listen(3000);