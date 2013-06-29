Polymer.register(this, {
	ready: function () {
		window.addEventListener('WebComponentsReady', function () {
            this.apiDefinition = document.querySelector(this.definition);
            this.apiDefinition.addEventListener('api-definition-loaded', this.onDefinitionReady.bind(this));
        }.bind(this));
	},
	onDefinitionReady: function (event) {
		this.resources = [];
		this.api = event.detail.api;
		this.resources = event.detail.resources;
	},
	sidebarClicked: function(event, detail, sender) {
		this.$.operationList.resourcePath = detail.name;
	},
	apiChanged: function (event, detail, sender) {
		this.apiDefinition.src = this.$.apiSelector.value;
	}
});