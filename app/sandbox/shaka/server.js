var express = require('express'),
	restful = require('node-restful'),
	mongoose = restful.mongoose,
	app = express();

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

Project.register(app, '/api/projects');

app.listen(3000);