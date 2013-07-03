Polymer.register(this, {
    ready: function () {
        window.addEventListener('WebComponentsReady', function () {
            this.apiDefinition = document.querySelector(this.definition);
            this.apiDefinition.addEventListener('api-definition-loaded', this.onDefinitionReady.bind(this));
        }.bind(this));
    },
    onDefinitionReady: function (event) {
        this.resources = [];
        this.api = event.detail.api;
        this.resources = event.detail.resources;
        this.documentation = event.detail.documentation;
        this.$.operationList.resourcePath = null;
        this.$.documentation.resourcePath = null;
        this.$.sidebar.initialize();
        this.$.navbar.api = event.detail;
    },
    resourceElementClicked: function(event, detail, sender) {
        this.$.operationList.resourcePath = detail.name;
        this.$.documentation.resourcePath = null;
    },
    documentationElementClicked: function(event, detail, sender) {
        this.$.documentation.resourcePath = detail.title;
        this.$.operationList.resourcePath = null;
    },
    apiChanged: function (event, detail, sender) {
        this.apiDefinition.src = this.$.apiSelector.value;
    }
});