Polymer.register(this, {
    resourceChanged: function () {
        var paths = this.resource.relativeUri.split('/'),
            template;

        this.urlParts = [];

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
    tryIt: function () {
        var template = Helpers.joinUrl(this.resource.baseUri, this.resource.relativeUri);

        Helpers.request({
            method: this.method || 'GET',
            url: Helpers.resolveParams(template, this.urlParts),
            callback: function (responseText, xhr) {
                console.log(responseText);
            }
        });
    }
});