Polymer.register(this, {
    ready: function () {
        this.$.response.hidden = true;
        this.model = {
            response: {},
            request: {}
        };
    },
    methodChanged: function () {
        this.build();
        this.model.request = {};
        this.model.response.body = '';
        this.model.response = {};

        //// TOOD: clean codemirror
    },
    resourceChanged: function () {
        this.build();
    },
    build: function () {
        var paths = this.resource.relativeUri.split('/'),
            template;

        this.urlParts = [];

        this.method = this.method || 'GET';

        this.methodInfo = this.resource.methods.filter(function (p) {
            return p.method.toUpperCase() == this.method;
        }.bind(this)).pop();

        var temp = [];

        this.methodInfo = JSON.parse(JSON.stringify(this.methodInfo));

        for (var prop in this.methodInfo.query) {
            var queryParam = this.methodInfo.query[prop];

            queryParam.name = prop;

            temp.push(queryParam);
        }

        this.methodInfo.query = temp;

        paths.forEach(function (path) {
            template = path.match(/{(.*?)}/ig);

            if (template) {
                this.urlParts.push({
                    name: template[0],
                    isTemplate: true
                });
            } else {
                if (path) {
                    this.urlParts.push({
                        name: path,
                        isTemplate: false
                    });
                }
            }
        }.bind(this));
    },
    tryIt: function (event, detail, sender) {
        var template = Helpers.joinUrl(this.resource.baseUri, this.resource.relativeUri);

        this.model.response.url = Helpers.resolveParams(template, this.urlParts);
        this.$.response.hidden = false;

        var parameters = {};

        this.methodInfo.query.forEach(function (q) {
            if (q.value) {
                parameters[q.name] = q.value;
            }
        });

        var options = {
            params: parameters,
            method: this.method || 'GET',
            url: Helpers.resolveParams(template, this.urlParts),
            callback: function (responseText, xhr) {
                this.model.response.url += (this.model.response.url.indexOf('?') > 0 ? '&' : '?') + this.toQueryString(parameters);
                this.model.response.body = responseText;
                this.model.response.statusCode = xhr.status;
                this.model.response.headers = xhr.getAllResponseHeaders();
            }.bind(this)
        };

        if (this.model.request.body) {
            options.body = this.model.request.body;
            options.headers = {
                'content-type': 'application/json'
            };
        }

        Helpers.request(options);

        event.stopPropagation();
    },
    toQueryString: function (params) {
        var r = [];
        for (var n in params) {
            var v = params[n];
            n = encodeURIComponent(n);
            r.push(v == null ? n : (n + '=' + encodeURIComponent(v)));
        }
        return r.join('&');
    }
});