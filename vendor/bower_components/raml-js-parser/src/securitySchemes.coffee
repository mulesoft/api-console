{MarkedYAMLError} = require './errors'
nodes             = require './nodes'

###
The Schemas throws these.
###
class @SecuritySchemeError extends MarkedYAMLError

  ###
    The Schemas class deals with applying schemas to resources according to the spec
  ###
class @SecuritySchemes
  constructor: ->
    @declaredSchemes = {}

  # Loading is extra careful because it is done before validation (so it can be used for validation)
  load_security_schemes: (node) =>
    if @has_property node, "securitySchemes"
      allschemes = @property_value node, 'securitySchemes'
      if allschemes and typeof allschemes is "object"
        allschemes.forEach (scheme_entry) =>
          if scheme_entry.tag is 'tag:yaml.org,2002:map'
            scheme_entry.value.forEach (scheme) =>
              @declaredSchemes[scheme[0].value] = scheme[1].value

  get_all_schemes: =>
    return @declaredSchemes

  get_security_scheme: (schemaName) =>
    return @declaredSchemes[schemaName]

