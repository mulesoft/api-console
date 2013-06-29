Polymer.register(this, {
    elementClicked: function (event, detail, sender) {
        // var value = sender.getAttribute('data-value');
        // var value = sender.dataset.value
        // var value = sender.templateInstance.model.name;

        this.fire('sidebar-element-clicked', sender.templateInstance.model);
    }
});