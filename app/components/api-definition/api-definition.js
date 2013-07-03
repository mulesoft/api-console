Polymer.register(this, {
    callbacks: [],
    srcChanged: function () {
        var that = this;

        RAML.Parser.loadFile(this.src).done(function (result) {
            result.resources.forEach(function (resource) {
                that.massage(resource);
            });
            console.log(result);

            that.fire('api-definition-loaded', result);
        });
    },
    massage: function (resource, parent) {
        resource.use = this.readTraits(resource.use);

        if (resource.resources) {
            var temp = JSON.parse(JSON.stringify(resource));

            delete temp.resources;

            temp.relativeUri = '';
            resource.resources.unshift(temp);

            resource.resources.forEach(function (r) {
                r.relativeUri = resource.relativeUri + r.relativeUri;

                if (parent) {
                    parent.resources.push(r);
                }
                
                this.massage(r, resource);
            }.bind(this));
        } else {
            var exists = parent.resources.filter(function (p) {
                return p.name == p.name;
            }.bind(this)).pop();

            if (parent && !exists) {
                parent.resources.push(resource);
            }
        }
    },
    readTraits: function (usages) {
        var temp = [];

        if (usages) {
            usages.forEach(function (use) {
                if (typeof use === 'string' && temp.indexOf(use) === -1) {
                    temp.push(use);
                } else if (typeof use === 'object') {
                    var keys = Object.keys(use);

                    if (keys.length) {
                        var key = Object.keys(use)[0];

                        if (temp.indexOf(key) === -1) {
                            temp.push(key);
                        }
                    }
                }
            });
        }

        return temp;
    }
});