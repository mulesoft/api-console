Polymer.register(this, {
    ready: function () {
        window.addEventListener('WebComponentsReady', function () {
            var definition = document.querySelector(this.definition);

            definition.addEventListener('api-definition-loaded', this.onDefinitionReady.bind(this));
        }.bind(this));
    },
    onDefinitionReady: function (event) {
        this.resources = [];
        this.definition = event.detail;
    },
    resourcePathChanged: function () {
        //// TODO: Check errors
        var filterdList = this.definition.resources.filter(function (p) {
            return p.name == this.resourcePath;
        }.bind(this)).pop();

        filterdList.resources.forEach(function (resource) {
            resource.baseUri = this.definition.baseUri.replace('{version}', this.definition.version);
        }.bind(this));

        this.resources = filterdList.resources;
    }
});