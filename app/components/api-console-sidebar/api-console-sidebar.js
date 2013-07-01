Polymer.register(this, {
    resourceClicked: function (event, detail, sender) {
        this.fire('sidebar-resource-element-clicked', sender.templateInstance.model);
    },
    documentationClicked: function (event, detail, sender) {
        this.fire('sidebar-documentation-element-clicked', sender.templateInstance.model);
    }
});