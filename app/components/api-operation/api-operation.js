Polymer.register(this, {
    klass: '',
    active: false,
    ready: function () {},
    click: function () {
        this.active = !this.active;
    }
});