Polymer.register(this, {
    callbacks: [],
    srcChanged: function () {
        var that = this;

        Helpers.request({
            url: this.src,
            callback: function (responseText, xhr) {
                var definition = responseText;

                //// TODO: Check errors!
                RAML.Parser.load(definition).done(function (result) {
                    that.fire('api-definition-loaded', result);
                });
            }
        });
    }
});