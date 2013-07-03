Polymer.register(this, {
    klass: '',
    active: false,
    selectedMethod: '',
    ready: function () {},
    headerClick: function () {
        this.active = !this.active;
        if (this.resource.methods.length && this.active) {
            this.selectOperation(this.resource.methods[0]);
        }
    },
    operationClicked: function (event, detail, sender) {
        this.selectOperation(sender.templateInstance.model.operation);
    },
    selectOperation: function (operation) {
        this.$.operationDetails.operation = operation;
        this.$.operationDetails.$.tryIt.method = operation.method.toUpperCase();
        this.selectedMethod = operation.method;
    }
});