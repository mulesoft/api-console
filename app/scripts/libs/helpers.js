var Helpers = (function () {
	return {
		joinUrl: function (url1, url2) {
			if (url1.lastIndexOf('/') === url1.length - 1) {
				url1 = url1.substring(0, url1.lastIndexOf('/'));
			}

			if (url2.indexOf('/') !== 0) {
				url2 = '/' + url2;
			}

			return url1 + url2;
		},
		resolveParams: function (urlTemplate, params) {
			if (params) {
				params.forEach(function (p) {
					if (p.value) {
						urlTemplate = urlTemplate.replace(p.name, p.value);
					}
				});
			}

			return urlTemplate;
		},
		makeReadyStateHandler: function (xhr, callback) {
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					callback && callback.call(null, xhr.responseText, xhr);
				}
			};
		},
		setRequestHeaders: function (xhr, headers) {
			if (headers) {
				for (var name in headers) {
					xhr.setRequestHeader(name, headers[name]);
				}
			}
		},
		toQueryString: function (params) {
			var r = [];
			for (var n in params) {
				var v = params[n];
				n = encodeURIComponent(n);
				r.push(v == null ? n : (n + '=' + encodeURIComponent(v)));
			}
			return r.join('&');
		},
		/**
		 * Sends a HTTP request to the server and returns the XHR object.
		 *
		 * @method request
		 * @param {Object} inOptions
		 *    @param {String} inOptions.url The url to which the request is sent.
		 *    @param {String} inOptions.method The HTTP method to use, default is GET.
		 *    @param {boolean} inOptions.sync By default, all requests are sent asynchronously.
		 *        To send synchronous requests, set to true.
		 *    @param {Object} inOptions.params Data to be sent to the server.
		 *    @param {Object} inOptions.body The content for the request body for POST method.
		 *    @param {Object} inOptions.headers HTTP request headers.
		 *    @param {Object} inOptions.callback Called when request is completed.
		 * @returns {Object} XHR object.
		 */
		request: function (options) {
			var xhr = new XMLHttpRequest();
			var url = options.url;
			var method = options.method || 'GET';
			var async = !options.sync;
			var params = this.toQueryString(options.params);
			if (params && method == 'GET') {
				url += (url.indexOf('?') > 0 ? '&' : '?') + params;
			}
			xhr.open(method, url, async);
			this.makeReadyStateHandler(xhr, options.callback);

			this.setRequestHeaders(xhr, options.headers);
			xhr.send(method == 'POST' ? (options.body || params) : null);
			if (!async) {
				xhr.onreadystatechange(xhr);
			}
			return xhr;
		}
	};
})();