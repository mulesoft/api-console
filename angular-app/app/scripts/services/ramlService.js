'use strict';

angular.module('raml', [])
    .factory('ramlReader', function () {
        return {
            readRootElements: function (raml) {
                var result = {};

                if (typeof raml.title !== 'undefined') {
                    result.title = raml.title;
                } else {
                    throw new Error('title is not defined');
                }

                if (typeof raml.baseUri !== 'undefined') {
                    result.baseUri = raml.baseUri;
                } else {
                    throw new Error('baseUri is not defined');
                }


                if (typeof raml.version !== 'undefined') {
                    result.version = raml.version;
                }

                return result;
            },

            readDocumentation: function (raml) {
                var result = {};

                if (typeof raml.documentation !== 'undefined') {
                    result.documentation = raml.documentation;
                }

                return result;
            },

            convert: function (query) {
                var queryParams = [];
                var param;

                for (var prop in query) {
                    param = query[prop];
                    param.paramName = prop;
                    queryParams.push(param);
                }

                return queryParams;
            },

            readHttpMethodData: function (methodDescriptor) {
                var result = {};

                if (typeof methodDescriptor.method !== 'undefined') {
                    result.name = methodDescriptor.method;
                }

                if (typeof methodDescriptor.summary !== 'undefined') {
                    result.summary = methodDescriptor.summary;
                }

                if (typeof methodDescriptor.responses !== 'undefined') {
                    result.responses = methodDescriptor.responses;

                    for (var prop in result.responses) {
                        if (result.responses[prop] === null) {
                            result.responses[prop] = prop;
                        }
                    }
                }

                if (typeof methodDescriptor.queryParameters !== 'undefined') {
                    result.queryParameters = [];

                    angular.forEach(methodDescriptor.queryParameters, function () {
                        result.queryParameters = this.convert(methodDescriptor.queryParameters);
                    }.bind(this));
                }

                if (typeof methodDescriptor.uriParameters !== 'undefined') {
                    result.uriParameters = methodDescriptor.uriParameters;
                }

                if (typeof methodDescriptor.body !== 'undefined') {
                    result.request = methodDescriptor.body;

                    for (var contentType in result.request) {
                        if (typeof result.request[contentType].formParameters !== 'undefined') {
                            for (var param in result.request[contentType].formParameters) {
                                var temp = JSON.parse(JSON.stringify(result.request[contentType].formParameters[param]));

                                result.request[contentType].formParameters[param].paramName = param;
                                temp.paramName = param;

                                if (temp.type === 'file') {
                                    delete result.request[contentType].formParameters[param];

                                    if (typeof result.request[contentType].formParameters.__files === 'undefined') {
                                        result.request[contentType].formParameters.__files = {};
                                    }

                                    result.request[contentType].formParameters.__files[param] = temp;
                                }
                            }
                        }
                    }
                }

                return result;
            },

            readContentTypes: function (methodDescriptor) {
                var types = [];

                if (typeof methodDescriptor.body !== 'undefined') {
                    for (var type in methodDescriptor.body) {
                        if (types.indexOf(type) === -1) {
                            types.push(type);
                        }
                    }
                }

                // if (typeof methodDescriptor.responses !== 'undefined') {
                //     angular.forEach(methodDescriptor.responses, function (element) {
                //         for (var httpCode in element) {
                //             for (var contentType in methodDescriptor.responses[httpCode]) {
                //                 if (types.indexOf(contentType) === -1) {
                //                     types.push(contentType);
                //                 }
                //             }
                //         }
                //     });
                // }

                return types;
            },

            readTraits: function (traitList, traitsDescription) {
                var traits = [];

                angular.forEach(traitList, function (use) {
                    if (typeof use === 'string' && traits.indexOf(use) === -1) {
                        traits.push(traitsDescription[use].name);
                    } else if (typeof use === 'object') {
                        var keys = Object.keys(use);

                        if (keys.length) {
                            var key = Object.keys(use)[0];

                            if (traits.indexOf(key) === -1) {
                                traits.push(traitsDescription[key].name);
                            }
                        }
                    }
                });

                return traits;
            },

            readResourceData: function (resource, raml) {
                var result = JSON.parse(JSON.stringify(resource));

                if (!resource.methods instanceof Array) {
                    delete result.methods;
                }

                if (typeof result.name === 'undefined') {
                    result.name = result.relativeUri;
                }

                if (typeof result.relativeUri === 'undefined') {
                    throw new Error('relativeUri is not defined');
                }

                if (typeof resource.methods !== 'undefined') {
                    if (resource.methods instanceof Array) {
                        result.methods = {};
                        angular.forEach(resource.methods, function (element) {
                            result.methods[element.method] = this.readHttpMethodData(element);
                            result.methods[element.method].supportedTypes = this.readContentTypes(element);
                        }.bind(this));
                    }
                }

                if (result.traits) {
                    result.traits.concat(this.readTraitsDeep(resource, raml.traits));
                } else {
                    result.traits = this.readTraitsDeep(resource, raml.traits);
                }

                result.absoluteUri = raml.baseUri + result.relativeUri;

                return result;
            },

            readTraitsDeep: function (resource, traitsDetails) {
                var traits = [];

                if (typeof resource.use !== 'undefined') {
                    traits = this.readTraits(resource.use, traitsDetails);
                }

                angular.forEach(resource.methods, function (method) {
                    if (typeof method.use !== 'undefined') {
                        traits = traits.concat(this.readTraits(method.use, traitsDetails));
                    }
                }.bind(this));

                return traits;
            },

            readRootResources: function (raml) {
                var result = {
                    resources: []
                };

                if (typeof raml.resources !== 'undefined') {
                    angular.forEach(raml.resources, function (element) {
                        result.resources.push(this.readResourceData(element, raml));
                    }.bind(this));
                }

                return result;
            },

            read: function (raml) {
                var rootResources = this.readRootResources(raml),
                    rootDocumentation = this.readDocumentation(raml),
                    result;

                angular.forEach(rootResources.resources, function (resource) {
                    var flatResources = this.flatten(resource);

                    delete resource.resources;

                    resource.resources = [];

                    angular.forEach(flatResources, function (el) {
                        var r = this.readResourceData(el, raml);
                        resource.resources.push(r);
                    }.bind(this));
                }.bind(this));

                result = this.readRootElements(raml);
                result.documentation = rootDocumentation.documentation;
                result.resources = rootResources.resources;

                return result;
            },

            flatten: function (resource, container) {
                var result = [],
                    temp, uriPart = resource.relativeUri;

                if (typeof container === 'undefined') {
                    temp = JSON.parse(JSON.stringify(resource));

                    delete temp.resources;

                    if (typeof temp.methods !== 'undefined') {
                        result = [temp];
                    }

                } else {
                    result = container;
                }

                if (typeof resource.resources === 'undefined') {
                    resource.resources = [];
                }

                if (resource.resources.length > 0) {
                    angular.forEach(resource.resources, function (el) {
                        temp = JSON.parse(JSON.stringify(el));

                        delete temp.resources;

                        temp.relativeUri = uriPart + temp.relativeUri;
                        el.relativeUri = temp.relativeUri;

                        result.push(temp);

                        return this.flatten(el, result);
                    }.bind(this));

                    return result;
                } else {
                    return result;
                }
            }
        };
    });