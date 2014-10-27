util            = require './util'
reader          = require './reader'
scanner         = require './scanner'
parser          = require './parser'
composer        = require './composer'
resolver        = require './resolver'
construct       = require './construct'
validator       = require './validator'
joiner          = require './joiner'
traits          = require './traits'
types           = require './resourceTypes'
schemas         = require './schemas'
protocols       = require './protocols'
securitySchemes = require './securitySchemes'
transformations = require './transformations'

@make_loader = (Reader = reader.Reader, Scanner = scanner.Scanner, Parser = parser.Parser, Composer = composer.Composer, Resolver = resolver.Resolver, Validator = validator.Validator,  ResourceTypes = types.ResourceTypes, Traits = traits.Traits, Schemas = schemas.Schemas, Protocols = protocols.Protocols, Joiner = joiner.Joiner, SecuritySchemes = securitySchemes.SecuritySchemes, Constructor = construct.Constructor, Transformations = transformations.Transformations) -> class
  components = [Reader, Scanner, Composer, Transformations, Parser, Resolver, Validator, Traits, ResourceTypes, Schemas, Protocols, Joiner, Constructor, SecuritySchemes]
  util.extend.apply util, [@::].concat (component.prototype for component in components)

  constructor: (stream, location, settings, @parent = null) ->
    # Reader
    components[0].call @, stream, location

    # Scanner
    components[1].call @, settings

    # Composer
    components[2].call @, settings

    # Transformations
    components[3].call @, settings

    component.call @ for component in components[4..]

@Loader = @make_loader()
