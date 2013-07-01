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
                    // result.resources.forEach(function (resource) {
                    //     that.massage(resource);
                    // });
                    console.log(result);
                    that.fire('api-definition-loaded', result);
                });
            }
        });
    },
    massage: function (resource, parent) {
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
    }
});