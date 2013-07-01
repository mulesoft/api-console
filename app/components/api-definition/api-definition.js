Polymer.register(this, {
    callbacks: [],
    srcChanged: function () {
        var that = this;

        Helpers.request({
            url: this.src,
            callback: function (responseText, xhr) {
                var definition = responseText;

                //// TODO: Check errors!
                RAML.Parser.load(definition).done(function (result) {
                    result.resources.forEach(function (resource) {
                        that.massage(resource);
                    });

                    that.fire('api-definition-loaded', result);
                });
            }
        });
    },
    massage: function (resource, parent) {
        resource.use = this.readTraits(resource.use);

        if (resource.resources) {
            resource.resources.forEach(function (r) {
                r.relativeUri = resource.relativeUri + r.relativeUri;

                if (parent) {
                    parent.resources.push(r);
                }
                this.massage(r, resource);
            }.bind(this));
        } else {
            if (parent) {
                parent.resources.push(resource);
            }
        }
    },
    readTraits: function (usages) {
        var temp = [];

        if (usages) {
            usages.forEach(function (use) {
                if (typeof use === 'string') {
                    temp.push(use);
                } else if (typeof use === 'object') {
                    var keys = Object.keys(use);

                    if (keys.length) {
                        temp.push(Object.keys(use)[0]);
                    }
                }
            });
        }

        return temp;
    }
});