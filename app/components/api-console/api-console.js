Polymer.register(this, {
	ready: function () {
		var definition = document.querySelector(this.definition);
		this.resources = [];

		definition.addListener(this.onDefinitionReady.bind(this));
	},
	onDefinitionReady: function (definition) {
		this.api = definition.api;
		this.resources = definition.resources;
	}
});