{MarkedYAMLError} = require './errors'
nodes             = require './nodes'
util              = require './util'

###
The ResourceTypes throws these.
###
class @ResourceTypeError extends MarkedYAMLError

###
The ResourceTypes class deals with applying ResourceTypes to resources according to the spec
###
class @ResourceTypes
  constructor: ->
    @declaredTypes = {}

  # Loading is extra careful because it is done before validation (so it can be used for validation)
  load_types: (node) =>
    @load_default_media_type(node)
    if @has_property node, 'resourceTypes'
      allTypes = @property_value node, 'resourceTypes'
      if allTypes and typeof allTypes is 'object'
        allTypes.forEach (type_item) =>
          if type_item and typeof type_item is 'object' and typeof type_item.value is 'object'
            type_item.value.forEach (type) =>
              @declaredTypes[type[0].value] = type

  has_types: (node) =>
    if Object.keys(@declaredTypes).length == 0 and @has_property node, 'resourceTypes'
      @load_types node
    return Object.keys(@declaredTypes).length > 0

  get_type: (typeName) =>
    return @declaredTypes[typeName]

  apply_types: (node, resourceUri = "") =>
    return unless util.isMapping(node)
    if @has_types node
      resources = @child_resources node
      resources.forEach (resource) =>
        @apply_default_media_type_to_resource resource[1]

        if @has_property resource[1], 'type'
          type = @get_property resource[1], 'type'
          @apply_type resourceUri + resource[0].value, resource, type
        @apply_types resource[1], resourceUri + resource[0].value
    else
      resources = @child_resources node
      resources.forEach (resource) =>
        @apply_default_media_type_to_resource resource[1]

  apply_type: (resourceUri, resource, typeKey) =>
    tempType = @resolve_inheritance_chain resourceUri, typeKey
    tempType.combine resource[1]
    resource[1] = tempType
    resource[1].remove_question_mark_properties()

  # calculates and resolve the inheritance chain from a starting type to the root_parent, applies parameters and traits
  # in all steps in the middle
  resolve_inheritance_chain: (resourceUri, typeKey) ->
    childTypeName = @key_or_value typeKey
    childType     = @apply_parameters_to_type resourceUri, childTypeName, typeKey

    typesToApply  = [childTypeName]
    compiledTypes = {}
    compiledTypes[childTypeName] = childType

    @apply_default_media_type_to_resource childType
    @apply_traits_to_resource resourceUri, childType, false

    # unwind the inheritance chain and check for circular references, while resolving final type shape
    while @has_property childType, 'type'
      typeKey        = @get_property childType, 'type'
      parentTypeName = @key_or_value typeKey

      if parentTypeName of compiledTypes
        pathToCircularRef = typesToApply.concat(parentTypeName).join(' -> ')
        childTypeProperty = @get_type(childTypeName)[0]
        throw new exports.ResourceTypeError 'while applying resourceTypes', null, "circular reference of \"#{parentTypeName}\" has been detected: #{pathToCircularRef}", childTypeProperty.start_mark

      # apply parameters
      parentType = @apply_parameters_to_type resourceUri, parentTypeName, typeKey
      @apply_default_media_type_to_resource parentType

      # apply traits
      @apply_traits_to_resource resourceUri, parentType, false

      # go to the next level in inheritance chain
      childTypeName = parentTypeName
      childType     = parentType

      compiledTypes[childTypeName] = childType
      typesToApply.push childTypeName

    rootType = typesToApply.pop()
    baseType = compiledTypes[rootType].cloneForResourceType()
    result   = baseType

    while inheritsFrom = typesToApply.pop()
      baseType = compiledTypes[inheritsFrom].cloneForResourceType()
      result.combine baseType

    return result

  apply_parameters_to_type: (resourceUri, typeName, typeKey) =>
    unless typeName?.trim()
      throw new exports.ResourceTypeError 'while applying resource type', null, 'resource type name must be provided', typeKey.start_mark

    unless type = @get_type typeName
      throw new exports.ResourceTypeError 'while applying resource type', null, "there is no resource type named #{typeName}", typeKey.start_mark

    type       = type[1].clone()
    parameters = @_get_parameters_from_type_key resourceUri, typeKey

    @apply_parameters type, parameters, typeKey

    return type

  _get_parameters_from_type_key: (resourceUri, typeKey) ->
    result   = {}
    reserved = {
      resourcePath: resourceUri.replace(/\/\/*/g, '/'),
      resourcePathName: @extractResourcePathName resourceUri
    }

    if util.isMapping typeKey
      parameters = @value_or_undefined typeKey
      if util.isMapping parameters[0][1]
        for parameter in parameters[0][1].value
          if parameter[0].value of reserved
            throw new exports.ResourceTypeError 'while applying parameters', null, "invalid parameter name: #{parameter[0].value} is reserved", parameter[0].start_mark
          result[parameter[0].value] = parameter[1].value

    return util.extend result, reserved
