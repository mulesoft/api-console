"use strict";

let express = require('express');
let app = express();

/**
 * Origin Policy браузера не позволяет загружать со страницы приложения raml-файлы расположенные на других доменах,
 * а добавить Access-Control-Allow-Origin в gitorious нет возможности. Поэтому проблема решается проксированием
 * raml файлов самим приложением.
 */
app.get(/^\/proxy\/(.+\.raml)/, function (req, response) {
	let pageUrl = req.params[0];
	let http = require('http');

	http.get(pageUrl, (ramlResp) => {

		const statusCode = ramlResp.statusCode;

		let error;

		if (statusCode !== 200) {
			error = new Error(`Request Failed.\n Status Code: ${statusCode}`);
		}

		if (error) {
			const message = `Failed to fetch content: ${error.message}.\nRequested url: ${pageUrl}`;
			console.log(error.message);
			// consume response data to free up memory
			ramlResp.resume();
			response.status(400).send(message);

			return;
		}

		let rawData = '';

		ramlResp.on('data', (chunk) => rawData += chunk);
		ramlResp.on('end', () => response.send(rawData));
	}).on('error', (e) => {
		const message = `Failed to fetch content: ${e.message}.\nRequested url: ${pageUrl}`;
		console.log(message);
		response.status(400).send(message);
	});
});

app.use(express.static('dist'));

app.listen(8000);