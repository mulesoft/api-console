Polymer.register(this, {
    ready: function () {
        window.addEventListener('WebComponentsReady', function () {
            var definition = document.querySelector(this.definition);
            this.resources = [];

            definition.addListener(this.onDefinitionReady.bind(this));
        }.bind(this));
    },
    onDefinitionReady: function (definition) {
        this.definition = definition;
    },
    resourcePathChanged: function () {
        //// TODO: Check errors
        this.resources = this.definition.resources.filter(function (p) {
            return p.name == this.resourcePath;
        }.bind(this)).pop().resources;
    }
});