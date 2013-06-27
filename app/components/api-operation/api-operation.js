
Polymer.register(this, {
    klass: '',
    ready: function () {
    },
    click: function () {
        this.active = !this.active;
    },
    activeChanged: function() {
        this.klass = this.active ? 'active' : '';
    }
});