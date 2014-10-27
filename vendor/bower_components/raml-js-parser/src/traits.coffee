{MarkedYAMLError} = require './errors'
nodes             = require './nodes'
inflection        = require 'inflection'
util              = require './util'

###
The Traits throws these.
###
class @TraitError extends MarkedYAMLError

###
###
class @ParameterError extends MarkedYAMLError


###
The Traits class deals with applying traits to resources according to the spec
###
class @Traits
  constructor: ->
    @declaredTraits = {}

  # Loading is extra careful because it is done before validation (so it can be used for validation)
  load_traits: (node) ->
    if @has_property node, 'traits'
      allTraits = @property_value node, 'traits'
      if allTraits and typeof allTraits is "object"
        allTraits.forEach (trait_item) =>
          if trait_item and typeof trait_item is "object" and typeof trait_item.value is "object"
            trait_item.value.forEach (trait) =>
              @declaredTraits[trait[0].value] = trait

  has_traits: (node) ->
    if @declaredTraits.length == 0 and @has_property node, 'traits'
      @load_traits node
    return Object.keys(@declaredTraits).length > 0

  get_trait: (traitName) ->
    if traitName of @declaredTraits
      return @declaredTraits[traitName][1]
    return null

  apply_traits: (node, resourceUri = "", removeQs = true) ->
    return unless util.isMapping(node)
    if @has_traits node
      resources = @child_resources node
      resources.forEach (resource) =>
        @apply_traits_to_resource resourceUri + resource[0].value, resource[1], removeQs

  apply_traits_to_resource: (resourceUri, resource, removeQs) ->
    return unless util.isMapping resource
    methods = @child_methods resource
    # apply traits at the resource level, which is basically the same as applying to each method in the resource
    if @has_property resource, 'is'
      uses = @property_value resource, 'is'
      uses.forEach (use) =>
        methods.forEach (method) =>
          @apply_trait resourceUri, method, use

    # iterate over all methods and apply all their traits
    methods.forEach (method) =>
      if @has_property method[1], 'is'
        uses = @property_value method[1], 'is'
        uses.forEach (use) =>
          @apply_trait resourceUri, method, use

    if removeQs
      resource.remove_question_mark_properties()

    @apply_traits resource, resourceUri, removeQs

  apply_trait: (resourceUri, method, useKey) ->
    traitName = @key_or_value useKey
    unless traitName?.trim()
      throw new exports.TraitError 'while applying trait', null, 'trait name must be provided', useKey.start_mark

    unless trait = @get_trait traitName
      throw new exports.TraitError 'while applying trait', null, "there is no trait named #{traitName}", useKey.start_mark

    plainParameters = @get_parameters_from_is_key resourceUri, method[0].value, useKey
    temp = trait.cloneForTrait()

    # by applying the parameter mapping first, we allow users to rename things in the trait,
    # and then merge it with the resource

    @apply_parameters temp, plainParameters, useKey
    @apply_default_media_type_to_method temp
    temp.combine method[1]
    method[1] = temp

  apply_parameters: (resource, parameters, useKey) ->
    @_apply_parameters resource, parameters, useKey, usedParameters = {
      resourcePath: true,
      resourcePathName: true,
      methodName  : true
    }

    for parameterName of parameters
      unless usedParameters[parameterName]
        throw new exports.ParameterError 'while applying parameters', null, "unused parameter: #{parameterName}", useKey.start_mark

  _apply_parameters: (resource, parameters, useKey, usedParameters) ->
    unless resource
      return

    if util.isString(resource)
      if parameterUse = resource.value.match(/<<\s*([^\|\s>]+)\s*(\|.*)?\s*>>/g)
        parameterUse.forEach (parameter) =>
          parameterName = parameter?.trim()?.replace(/[<>]+/g, '').trim()
          [parameterName, method] = parameterName.split(/\s*\|\s*/)

          unless parameterName of parameters
            throw new exports.ParameterError 'while applying parameters', null, "value was not provided for parameter: #{parameterName}", useKey.start_mark

          value = parameters[parameterName]
          usedParameters[parameterName] = true

          if method
            if method.match(/!\s*singularize/)
              value = inflection.singularize(value)
            else if method.match(/!\s*pluralize/)
              value = inflection.pluralize(value)
            else
              throw new exports.ParameterError 'while validating parameter', null, 'unknown function applied to parameter', resource.start_mark

          resource.value = resource.value.replace parameter, value
      return

    if util.isSequence(resource)
      resource.value.forEach (node) =>
        @_apply_parameters node, parameters, useKey, usedParameters
      return

    if util.isMapping(resource)
      resource.value.forEach (property) =>
        @_apply_parameters property[0], parameters, useKey, usedParameters
        @_apply_parameters property[1], parameters, useKey, usedParameters
      return

  get_parameters_from_is_key: (resourceUri, methodName, typeKey) ->
    result   = {}
    reserved = {
      methodName  : methodName,
      resourcePath: resourceUri.replace(/\/\/*/g, '/'),
      resourcePathName: @extractResourcePathName resourceUri
    }

    if util.isMapping typeKey
      parameters = @value_or_undefined typeKey
      if util.isMapping parameters[0][1]
        for parameter in parameters[0][1].value
          if parameter[0].value of reserved
            throw new exports.TraitError 'while applying parameters', null, "invalid parameter name: #{parameter[0].value} is reserved", parameter[0].start_mark
          result[parameter[0].value] = parameter[1].value

    return util.extend result, reserved

  extractResourcePathName: (resourceUri) ->
    pathSegments = resourceUri.split(/\//)
    while segment = pathSegments.pop()
      unless segment?.match(/[{}]/)
        return segment
    return ""
