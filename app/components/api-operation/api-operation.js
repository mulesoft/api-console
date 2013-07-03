Polymer.register(this, {
    klass: '',
    active: false,
    selectedMethod: '',
    ready: function () {},
    headerClick: function (event) {
        if (event.defaultPrevented) {
            return;
        }

        this.active = !this.active;
        if (this.resource.methods.length && this.active) {
            this.selectOperation(this.resource.methods[0]);
        }
    },
    operationClicked: function (event, detail, sender) {
        this.selectOperation(sender.templateInstance.model.operation);
        this.preventDefault(event);

        return false;
    },
    selectOperation: function (operation) {
        this.$.operationDetails.operation = operation;
        this.$.operationDetails.$.tryIt.method = operation.method.toUpperCase();
        this.selectedMethod = operation.method;
    },
    preventDefault: function (event) {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation();
    }
});