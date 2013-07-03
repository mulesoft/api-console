Polymer.register(this, {
    resources: null,
    documentation: null,
    selectedResource: null,
    selectedDocumentation: null,
    initialize: function () {
        if (this.documentation && this.documentation.length) {
            this.selectDocumentation(this.documentation[0]);
            return;
        }
        if (this.resources && this.resources.length) {
            this.selectResource(this.resources[0]);
            return;
        }
    },
    resourceClicked: function (event, detail, sender) {
        this.selectResource(sender.templateInstance.model);
    },
    documentationClicked: function (event, detail, sender) {
        this.selectDocumentation(sender.templateInstance.model);
    },
    selectResource: function (resource) {
        this.selectedResource = resource.name;
        this.selectedDocumentation = null;
        this.fire('sidebar-resource-element-clicked', resource);
    },
    selectDocumentation: function (documentation) {
        this.selectedDocumentation = documentation.title;
        this.selectedResource = null;
        this.fire('sidebar-documentation-element-clicked', documentation);
    }
});