Polymer.register(this, {
	ready: function () {},
	tryIt: function () {
		Helpers.request({
			method: this.method || 'GET',
			url: Helpers.joinUrl(this.resource.baseUri, this.resource.relativeUri),
			callback: function (responseText, xhr) {
				console.log(responseText);
			}
		});
	}
});