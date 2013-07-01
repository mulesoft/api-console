Polymer.register(this, {
	ready: function () {
		window.addEventListener('WebComponentsReady', function () {
			var definition = document.querySelector(this.definition);

			definition.addEventListener('api-definition-loaded', this.onDefinitionReady.bind(this));
		}.bind(this));
	},
	onDefinitionReady: function (event) {
		var documentation = event.detail.documentation;

		if (documentation && documentation.length) {
			this.resourcePath = documentation[0].title;
		}
	},
	resourcePathChanged: function () {
		//// TODO: Check errors
		this.documentation = this.definition.documentation.filter(function (p) {
			return p.title == this.resourcePath;
		}.bind(this)).pop();

		this.$.content.innerHTML = this.renderAsHml(this.documentation.content);
	},
	renderAsHml: function (markdown) {
		var converter = new Showdown.converter();

		return converter.makeHtml(markdown);
	}
});