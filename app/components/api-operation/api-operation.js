
Polymer.register(this, {
    ready: function () {
        this.klass = '';

        if (this.active) {
            this.klass = "active";
        }
    }
});