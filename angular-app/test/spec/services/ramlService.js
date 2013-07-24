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

    it('should read supported contentTypes by http method', function () {
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

    it('should read traits for a resource', function () {
        var resource = {
            relativeUri: '/resource',
            use: ['trait1', {
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

// {
//     "title": "La Liga",
//     "version": 1,
//     "documentation": [{
//         "title": "Getting Started",
//         "content": "This sample API has been created as part of your APIkit project. It is located in src/main/api and it has been designed using RAML (Restful\nAPI Modeling Language). Feel free to poke around.\n"
//     }],
//     "resources": [{
//         "name": "Teams",
//         "description": "A collection of teams that are participating in La Liga. Teams API allow you add, remove and retrieve individual team information from La Liga.\n",
//         "relativeUri": "/teams",
//         "methods": [{
//             "summary": "Obtain information from a collection of teams simultaneously",
//             "queryParameters": {
//                 "city": {
//                     "description": "Filter the list of teams by home city.\n",
//                     "type": "string",
//                     "required": false,
//                     "example": "Barcelona"
//                 }
//             },
//             "responses": {
//                 "200": {
//                     "application/json": {
//                         "schema": "{\n    \"$schema\": \"http://json-schema.org/draft-03/schema\",\n    \"items\": {\n        \"description\": \"The team is the basic unit for keeping track of a roster of players. With the Team APIs, you can obtain team-related information, like the team name, stats, points, and more.\",\n        \"name\": \"Team\",\n        \"properties\": {\n            \"homeCity\": {\n                \"description\": \"Name of the city to which this team belongs\",\n                \"type\": \"string\"\n            },\n            \"id\": {\n                \"description\": \"A three-letter code that identifies the team id\",\n                \"maxLength\": 3,\n                \"minLength\": 3,\n                \"type\": \"string\"\n            },\n            \"name\": {\n                \"description\": \"Name of the team\",\n                \"type\": \"string\"\n            },\n            \"required\": [\n                \"id\",\n                \"name\",\n                \"homeCity\"\n            ],\n            \"stadium\": {\n                \"description\": \"Name of the stadium\",\n                \"type\": \"string\"\n            }\n        },\n        \"type\": \"object\"\n    },\n    \"name\": \"Teams\",\n    \"required\": true,\n    \"type\": \"array\"\n}\n",
//                         "example": "[{\n  \"name\": \"Athletic Bilbao\",\n  \"id\": \"ATH\",\n  \"homeCity\": \"Bilbao\",\n  \"stadium\": \"San Mames\"\n},\n{\n  \"name\": \"Atletico Madrid\",\n  \"id\": \"ATL\",\n  \"homeCity\": \"Madrid\",\n  \"stadium\": \"Vicente Calderon\"\n},\n{\n  \"name\": \"Barcelona\",\n  \"id\": \"BAR\",\n  \"homeCity\": \"Barcelona\",\n  \"stadium\": \"Camp Nou\"\n},\n{\n  \"name\": \"Betis\",\n  \"id\": \"BET\",\n  \"homeCity\": \"Seville\",\n  \"stadium\": \"Benito Villamarin\"\n},\n{\n  \"name\": \"Espanyol\",\n  \"id\": \"ESP\",\n  \"homeCity\": \"Barcelona\",\n  \"stadium\": \"Cornella-El Prat\"\n},\n{\n  \"name\": \"Getafe\",\n  \"id\": \"GET\",\n  \"homeCity\": \"Getafe\",\n  \"stadium\": \"Coliseum Alfonso Perez\"\n},\n{\n  \"name\": \"Granada\",\n  \"id\": \"GRA\",\n  \"homeCity\": \"Granada\",\n  \"stadium\": \"Nuevo Los Carmenes\"\n},\n{\n  \"name\": \"Levante\",\n  \"id\": \"LEV\",\n  \"homeCity\": \"Valencia\",\n  \"stadium\": \"Ciutat de Valencia\"\n},\n{\n  \"name\": \"Malaga\",\n  \"id\": \"MAL\",\n  \"homeCity\": \"Malaga\",\n  \"stadium\": \"La Roselda\"\n},\n{\n  \"name\": \"Mallorca\",\n  \"id\": \"MAL\",\n  \"homeCity\": \"Palma\",\n  \"stadium\": \"Iberostar Stadium\"\n},\n{\n  \"name\": \"Osasuna\",\n  \"id\": \"OSA\",\n  \"homeCity\": \"Pamplona\",\n  \"stadium\": \"El Sadar\"\n},\n{\n  \"name\": \"Racing Santander\",\n  \"id\": \"RAC\",\n  \"homeCity\": \"Santander\",\n  \"stadium\": \"El Sardinero\"\n},\n{\n  \"name\": \"Rayo Vallecano\",\n  \"id\": \"RAY\",\n  \"homeCity\": \"Madrid\",\n  \"stadium\": \"Campo de Vallecas\"\n},\n{\n  \"name\": \"Real Madrid\",\n  \"id\": \"RMA\",\n  \"homeCity\": \"Madrid\",\n  \"stadium\": \"Santiago Bernabeu\"\n},\n{\n  \"name\": \"Real Sociedad\",\n  \"id\": \"RSC\",\n  \"homeCity\": \"San Sebastian\",\n  \"stadium\": \"Anoeta\"\n},\n{\n  \"name\": \"Sevilla\",\n  \"id\": \"SEV\",\n  \"homeCity\": \"Seville\",\n  \"stadium\": \"Ramon Sanchez Pizjuan\"\n},\n{\n  \"name\": \"Sporting de Gijon\",\n  \"id\": \"SPG\",\n  \"homeCity\": \"Gijon\",\n  \"stadium\": \"El Molinon\"\n},\n{\n  \"name\": \"Valencia\",\n  \"id\": \"VAL\",\n  \"homeCity\": \"Valencia\",\n  \"stadium\": \"Mestalla\"\n},\n{\n  \"name\": \"Villareal\",\n  \"id\": \"VIL\",\n  \"homeCity\": \"Vila-real\",\n  \"stadium\": \"El Madrigal\"\n},\n{\n  \"name\": \"Zaragoza\",\n  \"id\": \"ZAR\",\n  \"homeCity\": \"Zaragoza\",\n  \"stadium\": \"La Romareda\"\n}]\n"
//                     }
//                 }
//             },
//             "method": "get"
//         }, {
//             "summary": "Add a new team to the league",
//             "body": {
//                 "application/json": {
//                     "example": "{\n  \"name\": \"Barcelona\",\n  \"id\": \"BAR\",\n  \"homeCity\": \"Barcelona\",\n  \"stadium\": \"Camp Nou\"\n}\n",
//                     "schema": "{\n    \"$schema\": \"http://json-schema.org/draft-03/schema\",\n    \"properties\": {\n        \"homeCity\": {\n            \"description\": \"Name of the city to which this team belongs\",\n            \"type\": \"string\"\n        },\n        \"id\": {\n            \"description\": \"A three-letter code that identifies the team id\",\n            \"maxLength\": 3,\n            \"minLength\": 3,\n            \"type\": \"string\"\n        },\n        \"name\": {\n            \"description\": \"Name of the team\",\n            \"type\": \"string\"\n        },\n        \"required\": [\n            \"id\",\n            \"name\",\n            \"homeCity\"\n        ],\n        \"stadium\": {\n            \"description\": \"Name of the stadium\",\n            \"type\": \"string\"\n        }\n    },\n    \"type\": \"object\"\n    \"name\": \"Team\"\n}\n"
//                 }
//             },
//             "responses": {
//                 "201": {
//                     "description": "The team has been succesfully created\n",
//                     "headers": {
//                         "Location": {
//                             "type": "string",
//                             "description": "Location of the newly created team"
//                         }
//                     }
//                 }
//             },
//             "method": "post"
//         }],
//         "resources": [{
//             "name": "Team",
//             "description": "The team is the basic unit for keeping track of a roster of players that are participating together in La Liga. With the Team APIs, you can obtain team-related information, like the team name, stats, points, and more.\n",
//             "uriParameters": {
//                 "teamId": {
//                     "description": "Three letter code that identifies the team.\n",
//                     "type": "string",
//                     "minLength": 3,
//                     "maxLength": 3,
//                     "example": "BAR"
//                 }
//             },
//             "relativeUri": "/{teamId}",
//             "methods": [{
//                 "summary": "Retrieve team-related information such as the name, the home city, the stadium, current position, and other statistical information about a team.",
//                 "responses": {
//                     "200": {
//                         "application/json": {
//                             "example": "{\n  \"name\": \"Barcelona\",\n  \"id\": \"BAR\",\n  \"homeCity\": \"Barcelona\",\n  \"stadium\": \"Camp Nou\",\n  \"matches\": 24\n}\n",
//                             "schema": "{\n    \"$schema\": \"http://json-schema.org/draft-03/schema\",\n    \"properties\": {\n        \"homeCity\": {\n            \"description\": \"Name of the city to which this team belongs\",\n            \"type\": \"string\"\n        },\n        \"matches\": {\n            \"description\": \"The total number of matches that has been played by this team between all seasons\",\n            \"type\": \"integer\",\n            \"minimum\": 0\n        },\n        \"id\": {\n            \"description\": \"A three-letter code that identifies the team id\",\n            \"maxLength\": 3,\n            \"minLength\": 3,\n            \"type\": \"string\"\n        },\n        \"name\": {\n            \"description\": \"Name of the team\",\n            \"type\": \"string\"\n        },\n        \"required\": [\n            \"id\",\n            \"name\",\n            \"homeCity\"\n        ],\n        \"stadium\": {\n            \"description\": \"Name of the stadium\",\n            \"type\": \"string\"\n        }\n    },\n    \"type\": \"object\"\n    \"name\": \"Team\"\n}\n"
//                         }
//                     },
//                     "404": {
//                         "description": "Unable to find a team with that identifier\n"
//                     }
//                 },
//                 "method": "get"
//             }, {
//                 "summary": "Update team details such as the name of the home stadium, or the name of the team itself.",
//                 "body": {
//                     "application/json": {
//                         "example": "{\n  \"name\": \"Barcelona\",\n  \"stadium\": \"Camp Nou\"\n}\n",
//                         "schema": "{\n    \"$schema\": \"http://json-schema.org/draft-03/schema\",\n    \"properties\": {\n        \"homeCity\": {\n            \"description\": \"Name of the city to which this team belongs\",\n            \"type\": \"string\"\n        },\n        \"name\": {\n            \"description\": \"Name of the team\",\n            \"type\": \"string\"\n        },\n        \"stadium\": {\n            \"description\": \"Name of the stadium\",\n            \"type\": \"string\"\n        }\n    },\n    \"type\": \"object\"\n    \"name\": \"Team\"\n}\n"
//                     }
//                 },
//                 "responses": {
//                     "204": {
//                         "description": "The team has been succesfully updated\n"
//                     },
//                     "404": {
//                         "description": "Unable to find a team with that identifier\n"
//                     }
//                 },
//                 "method": "patch"
//             }, {
//                 "summary": "Remove a team from the league. Notice that this operation is non-reversible and all data associated with the team, including its statistics will be lost. Use with caution.",
//                 "responses": {
//                     "204": {
//                         "description": "The resource has been succesfully removed.\n"
//                     },
//                     "404": {
//                         "description": "Unable to find a team with that identifier\n"
//                     }
//                 },
//                 "method": "delete"
//             }]
//         }]
//     }]
// }