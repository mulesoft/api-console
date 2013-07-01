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
		this.documentation = event.detail.documentation;
	},
	resourceElementClicked: function(event, detail, sender) {
		this.$.operationList.resourcePath = detail.name;
		this.$.documentation.hidden = true;
		this.$.operationList.hidden = false;
	},
	documentationElementClicked: function(event, detail, sender) {
		this.$.documentation.hidden = false;
		this.$.operationList.hidden = true;
		this.$.documentation.resourcePath = detail.title;
	},
	apiChanged: function (event, detail, sender) {
		this.apiDefinition.src = this.$.apiSelector.value;
	}
});