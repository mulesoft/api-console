{MarkedYAMLError} = require './errors'
nodes             = require './nodes'

###
The Schemas throws these.
###
class @SchemaError extends MarkedYAMLError

###
  The Schemas class deals with applying schemas to resources according to the spec
###
class @Schemas
  constructor: ->
    @declaredSchemas = {}

  # Loading is extra careful because it is done before validation (so it can be used for validation)
  load_schemas: (node) =>
    if @has_property node, "schemas"
      allSchemas = @property_value node, 'schemas'
      if allSchemas and typeof allSchemas is "object"
        allSchemas.forEach (schema_entry) =>
          if schema_entry and typeof schema_entry is "object" and typeof schema_entry.value is "object"
            schema_entry.value.forEach (schema) =>
              @declaredSchemas[schema[0].value] = schema

  has_schemas: (node) =>
    if @declaredSchemas.length == 0 and @has_property node, "schemas"
      @load_schemas node
    return Object.keys(@declaredSchemas).length > 0

  get_all_schemas: =>
    return @declaredSchemas

  apply_schemas: (node) =>
    resources = @child_resources node
    schemas = @get_schemas_used resources
    schemas.forEach (schema) =>
      if schema[1].value of @declaredSchemas
        schema[1].value = @declaredSchemas[schema[1].value][1].value

  get_schemas_used: (resources) =>
    schemas = []
    resources.forEach (resource) =>
      properties = @get_properties resource[1], "schema"
      schemas = schemas.concat properties
    return schemas
