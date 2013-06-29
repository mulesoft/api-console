Polymer.register(this, {
	ready: function () {
		window.addEventListener('WebComponentsReady', function () {
            var definition = document.querySelector(this.definition);
            this.resources = [];

            definition.addListener(this.onDefinitionReady.bind(this));
        }.bind(this));
	},
	onDefinitionReady: function (definition) {
		this.api = definition.api;
		this.resources = definition.resources;
	},
	sidebarClicked: function(event, detail, sender) {
		this.$.operationList.resourcePath = detail.name;
	}
});