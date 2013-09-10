'use strict';

angular.module('helpers', [])
    .factory('commons', function () {
        return {
            extend: function (destination, source) {
                for (var elem in source) {
                    if (source.hasOwnProperty(elem)) {
                        if (source[elem]) {
                            destination[elem] = source[elem];
                        }
                    }
                }

                return destination;
            },
            getAbsoluteUri: function (baseUri, relativeUri) {
                return baseUri + relativeUri;
            },
            joinUrl: function (url1, url2) {
                if (url1.lastIndexOf('/') === url1.length - 1) {
                    url1 = url1.substring(0, url1.lastIndexOf('/'));
                }

                if (url2.indexOf('/') !== 0) {
                    url2 = '/' + url2;
                }

                return url1 + url2;
            },
            toUriParams: function (object) {
                var result = '';

                for (var param in object) {
                    result = result + param + '=' + object[param] + '&';
                }

                return result.replace(/\&$/, ';');
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
            processUrlParts: function (url) {
                var urlParts = [];
                var parts = url.split('}');

                parts.forEach(function (part) {
                    var splitted = (part || '').split('{');

                    if (splitted.length) {
                        urlParts.push({
                            name: splitted[0],
                            editable: false
                        });
                    }
                    if (splitted.length === 2) {
                        urlParts.push({
                            name: '{' + splitted[1] + '}',
                            editable: true,
                            memberName: splitted[1]
                        });
                    }
                });

                return urlParts;
            },
            makeReadyStateHandler: function (xhr, callback) {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && callback) {
                        callback.call(null, xhr.responseText, xhr);
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
                    r.push(v === null ? n : (n + '=' + encodeURIComponent(v)));
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
                if (params && method === 'GET') {
                    url += (url.indexOf('?') > 0 ? '&' : '?') + params;
                }
                xhr.open(method, url, async);
                this.makeReadyStateHandler(xhr, options.callback);

                this.setRequestHeaders(xhr, options.headers);
                xhr.send(method === 'POST' || method === 'PUT' ? (options.body || params) : null);
                if (!async) {
                    xhr.onreadystatechange(xhr);
                }
                return xhr;
            }
        };
    });