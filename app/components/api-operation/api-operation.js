Polymer.register(this, {
	klass: '',
	active: false,
	ready: function () {},
	headerClick: function () {
		this.active = !this.active;
	},
	operationClicked: function (event, detail, sender) {
		var selector = sender.parentElement.querySelectorAll('li');

		for (var i = 0; i < selector.length; i++) {
			selector[i].className = "";
		}

		sender.className = "active";
		this.$.operationDetails.$.tryIt.method = sender.templateInstance.model.operation.method.toUpperCase();
	}
});