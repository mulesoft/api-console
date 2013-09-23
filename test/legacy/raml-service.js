'use strict';

describe('Raml Reader', function () {
    var reader;

    beforeEach(function () {
        var $injector = angular.injector(['raml']);
        reader = $injector.get('ramlReader');
        expect(reader).not.toBe(null);
    });

    it('should read mandatory global elements', function () {
        var raml = {
            title: 'title1',
            baseUri: 'http://www.acme.com'
        }, result = reader.readRootElements(raml);

        expect(result.title).toBe('title1');
        expect(result.baseUri).toBe('http://www.acme.com');
    });

    it('should throw an exception if title is not defined', function () {
        var raml = {};

        expect(function () {
            reader.readRootElements(raml);
        }).toThrow('title is not defined');
    });

    it('should throw an exception if baseUri is not defined', function () {
        var raml = {
            title: ''
        };

        expect(function () {
            reader.readRootElements(raml);
        }).toThrow('baseUri is not defined');
    });

    it('should read version from global elements ', function () {
        var raml = {
            title: '',
            baseUri: '',
            version: 1
        }, result = reader.readRootElements(raml);

        expect(result.version).toBe(1);
    });

    it('should read documentation from global elements ', function () {
        var raml = {
            documentation: [{
                title: 'title1',
                content: 'content1'
            }, {
                title: 'title2',
                content: 'content2'
            }]
        }, result = reader.readDocumentation(raml);

        expect(result.documentation[0].title).toBe('title1');
        expect(result.documentation[0].content).toBe('content1');
        expect(result.documentation.length).toBe(2);
    });

    it('should read root resources', function () {
        var raml = {
            baseUri: 'http://www.acme.com',
            resources: [{
                name: 'name',
                relativeUri: '/resource'
            }]
        }, result = reader.readRootResources(raml);

        expect(result.resources[0].name).toBe('name');
        expect(result.resources[0].relativeUri).toBe('/resource');
        expect(result.resources[0].absoluteUri).toBe('http://www.acme.com/resource');
        expect(result.resources.length).toBe(1);
    });

    it('should use relativeUri as name if name is not defined when reading resources', function () {
        var raml = {
            resources: [{
                relativeUri: '/resource'
            }]
        }, result = reader.readRootResources(raml);

        expect(result.resources[0].name).toBe('/resource');
        expect(result.resources[0].relativeUri).toBe('/resource');
        expect(result.resources.length).toBe(1);
    });

    it('should read basic resource data', function () {
        var resource = {
            name: 'name',
            relativeUri: '/resource',
            description: 'description'
        }, result = reader.readResourceData(resource, 'http://www.acme.com/resource');

        expect(result.name).toBe('name');
        expect(result.relativeUri).toBe('/resource');
        expect(result.description).toBe('description');
    });

    it('should throw an exception if relativeUri is not defined', function () {
        var resource = {};

        expect(function () {
            reader.readResourceData(resource, '');
        }).toThrow('relativeUri is not defined');
    });

    it('should read method info', function () {
        var resource = {
            relativeUri: '/resource',
            methods: [{
                method: 'get',
                summary: 'summary',
                queryParameters: [{
                    param: {
                        description: '',
                        type: '',
                        required: false,
                        example: 'example'
                    }
                }],
                uriParameters: [{
                    param: {
                        description: '',
                        type: '',
                        required: false,
                        example: 'example'
                    }
                }],
                body: {
                    'application/json': {
                        schema: 'schema',
                        example: 'example'
                    }
                },
                responses: [{
                    200: {
                        description: 'description',
                        'application/json': {
                            schema: 'schema',
                            example: 'example'
                        }
                    }
                }]
            }]
        }, result = reader.readResourceData(resource, '');

        expect(result.relativeUri).toBe('/resource');
        expect(result.methods.get.uriParameters.length).toBe(1);
        expect(result.methods.get.queryParameters.length).toBe(1);
        expect(result.methods.get.responses.length).toBe(1);
        expect(result.methods.get.request).not.toBe(null);
    });

    it('should read multiples methods', function () {
        var resource = {
            relativeUri: '/resource',
            methods: [{
                method: 'get',
                summary: 'summary'
            }, {
                method: 'post',
                summary: 'summary'
            }, {
                method: 'put',
                summary: 'summary'
            }, {
                method: 'delete',
                summary: 'summary'
            }, {
                method: 'options',
                summary: 'summary'
            }, {
                method: 'head',
                summary: 'summary'
            }, {
                method: 'patch',
                summary: 'summary'
            }]
        }, result = reader.readResourceData(resource, '');

        expect(result.methods.get).not.toBe(null);
        expect(result.methods.post).not.toBe(null);
        expect(result.methods.put).not.toBe(null);
        expect(result.methods.delete).not.toBe(null);
        expect(result.methods.options).not.toBe(null);
        expect(result.methods.head).not.toBe(null);
        expect(result.methods.patch).not.toBe(null);
    });

    xit('should read supported contentTypes by http method', function () {
        var resource = {
            relativeUri: '/resource',
            methods: [{
                method: 'get',
                responses: [{
                    200: {
                        'application/json': null
                    }
                }]
            }, {
                method: 'post',
                body: {
                    'application/json': null,
                    'application/xml': null
                },
                responses: [{
                    200: {
                        'application/json': null
                    }
                }]
            }, {
                method: 'put'
            }]
        }, result = reader.readResourceData(resource, '');

        expect(result.methods.get.supportedTypes.length).toBe(1);
        expect(result.methods.get.supportedTypes[0]).toBe('application/json');

        expect(result.methods.post.supportedTypes.length).toBe(2);
        expect(result.methods.post.supportedTypes[0]).toBe('application/json');
        expect(result.methods.post.supportedTypes[1]).toBe('application/xml');

        expect(result.methods.put.supportedTypes.length).toBe(1);
        expect(result.methods.put.supportedTypes[0]).toBe('application/json');
    });

    xit('should read traits for a resource', function () {
        var resource = {
            relativeUri: '/resource',
            is: ['trait1', {
                trait2: {}
            }]
        }, result = reader.readResourceData(resource, '');

        expect(result.traits.length).toBe(2);
        expect(result.traits[0]).toBe('trait1');
        expect(result.traits[1]).toBe('trait2');
    });

    it('should flatten a resource', function () {
        var resource = {
            name: 'level1',
            resources: [{
                name: 'level2.1',
                resources: [{
                    name: 'level3',
                    resources: [{
                        name: 'level4',
                        resources: []
                    }]
                }]
            }, {
                name: 'level2.2',
                resources: []
            }]
        }, result = reader.flatten(resource);

        expect(result.length).toBe(4);
    });

    it('e-2-e', function () {
        var raml = {
            title: 'title1',
            baseUri: 'http://www.acme.com',
            version: 1,
            documentation: [{
                title: 'title1',
                content: 'content1'
            }],
            resources: [{
                name: 'level1',
                relativeUri: '/level1',
                resources: [{
                    name: 'level2.1',
                    relativeUri: '/level2.1',
                    resources: [{
                        name: 'level3',
                        relativeUri: '/level3',
                        resources: [{
                            name: 'level4',
                            relativeUri: '/level4',
                            resources: []
                        }]
                    }]
                }, {
                    name: 'level2.2',
                    relativeUri: '/level2.2',
                    resources: []
                }]
            }, {
                relativeUri: '/resource',
                resources: [],
                methods: [{
                    method: 'get',
                    summary: 'summary',
                    queryParameters: [{
                        param: {
                            description: '',
                            type: '',
                            required: false,
                            example: 'example'
                        }
                    }],
                    uriParameters: [{
                        param: {
                            description: '',
                            type: '',
                            required: false,
                            example: 'example'
                        }
                    }],
                    body: {
                        'application/json': {
                            schema: 'schema',
                            example: 'example'
                        }
                    },
                    responses: [{
                        200: {
                            description: 'description',
                            'application/json': {
                                schema: 'schema',
                                example: 'example'
                            }
                        }
                    }]
                }]
            }]
        }, result = reader.read(raml);

        expect(result).not.toBe(null);
    });
});
