Polymer.register(this, {
	sourceChanged: function () {
		if (CodeMirror && this.source) {
			CodeMirror.runMode(this.source, "application/json", this.$.output);
		}
	}
});