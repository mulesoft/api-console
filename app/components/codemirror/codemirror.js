Polymer.register(this, {
    sourceChanged: function () {
        if (CodeMirror && this.source) {
            CodeMirror.runMode(JSON.stringify(JSON.parse(this.source), null, 2), "application/json", this.$.output);
        }

        if (!this.source) {
            this.$.output.innerHTML = '';
        }
    }
});