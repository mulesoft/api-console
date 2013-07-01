Polymer.register(this, {
    ready: function () {},

    preventDefault: function (event) {
        event.stopPropagation();
    }
});