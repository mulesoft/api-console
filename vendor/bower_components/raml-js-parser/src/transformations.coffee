uritemplate = require 'uritemplate'
nodes       = require './nodes'
util              = require './util'

###
   Applies transformations to the RAML
###
class @Transformations
  constructor: (@settings) ->
    @declaredSchemas = {}

  applyTransformations: (rootObject) =>
    if @settings.transform
      @applyTransformationsToRoot rootObject
      resources = rootObject.resources
      @applyTransformationsToResources(rootObject, resources)

  applyAstTransformations: (document) =>
    if @settings.transform
      @transform_document(document)

  load_default_media_type: (node) =>
    return unless util.isMapping node or node?.value
    @mediaType = @property_value node, 'mediaType'

  get_media_type: () =>
    return @mediaType

  applyTransformationsToRoot: (rootObject) ->
    if rootObject.baseUri

      template = uritemplate.parse rootObject.baseUri
      expressions = template.expressions.filter((expr) -> return 'templateText' of expr).map (expression) -> expression.templateText

      if expressions.length
        rootObject.baseUriParameters = {} unless rootObject.baseUriParameters

      expressions.forEach (parameterName) ->
        unless parameterName of rootObject.baseUriParameters
          rootObject.baseUriParameters[parameterName] =
          {
            type: "string",
            required: true,
            displayName: parameterName
          }

          if parameterName is "version"
            rootObject.baseUriParameters[parameterName].enum = [ rootObject.version ]

  applyTransformationsToResources: (rootObject, resources) ->
    if resources?.length
      for resource in resources
        inheritedSecScheme = if resource.securedBy then resource.securedBy else rootObject?.securedBy
        if resource.methods?.length
          for method in resource.methods
            unless "securedBy" of method
              if inheritedSecScheme
                method.securedBy = inheritedSecScheme

        pathParts = resource.relativeUri.split('\/')
        pathParts.shift() while !pathParts[0] and pathParts.length
        resource.relativeUriPathSegments = pathParts

        template = uritemplate.parse resource.relativeUri
        expressions = template.expressions.filter((expr) -> return 'templateText' of expr).map (expression) -> expression.templateText

        if expressions.length
          resource.uriParameters = {} unless resource.uriParameters

        for parameterName in expressions
          unless parameterName of resource.uriParameters
            resource.uriParameters[parameterName] =
            {
              type: "string",
              required: true,
              displayName: parameterName
            }

        @applyTransformationsToResources rootObject, resource.resources

  ###
  Media Type pivot when using default mediaType property
  ###
  apply_default_media_type_to_resource: (resource) =>
    return unless @mediaType
    return unless util.isMapping resource

    for childResource in @child_resources resource
      @apply_default_media_type_to_resource childResource[1]

    for method in @child_methods resource
      @apply_default_media_type_to_method method[1]

  apply_default_media_type_to_method: (method) ->
    return unless @mediaType
    return unless util.isMapping method
    # resource->methods->body
    if @has_property(method, 'body')
      @apply_default_media_type_to_body @get_property(method, 'body')

    # resource->methods->responses->items->body
    if @has_property(method, 'responses')
      responses = @get_property method, 'responses'
      return unless responses and responses.value
      responses.value.forEach (response) =>
        if @has_property(response[1], 'body')
          @apply_default_media_type_to_body @get_property(response[1], 'body')

  apply_default_media_type_to_body: (body) ->
    return unless util.isMapping body
    if body?.value?[0]?[0]?.value
      key = body.value[0][0].value
      unless key.match(/\//)
        responseType = new nodes.MappingNode 'tag:yaml.org,2002:map', [], body.start_mark, body.end_mark
        responseTypeKey = new nodes.ScalarNode 'tag:yaml.org,2002:str', @mediaType, body.start_mark, body.end_mark
        responseType.value.push [responseTypeKey, body.clone()]
        body.value =  responseType.value

  noop: ->

  transform_types: (typeProperty) ->
    types = typeProperty.value
    types.forEach (type_entry) =>
      type_entry.value.forEach (type) =>
        @transform_resource type, true

  transform_traits: (traitProperty) ->
    traits = traitProperty.value
    traits.forEach (trait_entry) =>
      trait_entry.value.forEach (trait) =>
        @transform_method trait[1], true

  transform_named_params: (property, allowParameterKeys, requiredByDefault = true) ->
    if util.isNull property[1]
      return

    property[1].value.forEach (param) =>
      if util.isNull param[1]
        param[1] = new nodes.MappingNode('tag:yaml.org,2002:map', [], param[1].start_mark, param[1].end_mark)

      @transform_common_parameter_properties param[0].value, param[1], allowParameterKeys, requiredByDefault

  transform_common_parameter_properties: (parameterName, node, allowParameterKeys, requiredByDefault) ->
    if util.isSequence(node)
      node.value.forEach (parameter) =>
        @transform_named_parameter(parameterName, parameter, allowParameterKeys, requiredByDefault)
    else
      @transform_named_parameter(parameterName, node, allowParameterKeys, requiredByDefault)

  transform_named_parameter: (parameterName, node, allowParameterKeys, requiredByDefault) ->
    hasDisplayName = false
    hasRequired    = false
    hasType        = false

    node.value.forEach (childNode) =>
      return if allowParameterKeys && @isParameterKey(childNode)
      canonicalPropertyName = @canonicalizePropertyName childNode[0].value, allowParameterKeys
      switch canonicalPropertyName
        when "pattern"      then @noop()
        when "default"      then @noop()
        when "enum"         then @noop()
        when "description"  then @noop()
        when "example"      then @noop()
        when "minLength"    then @noop()
        when "maxLength"    then @noop()
        when "minimum"      then @noop()
        when "maximum"      then @noop()
        when "repeat"       then @noop()
        when "displayName"  then hasDisplayName = true
        when "type"         then hasType = true
        when "required"     then hasRequired = true
        else @noop()

    unless hasDisplayName
      @add_key_value_to_node(node, 'displayName', 'tag:yaml.org,2002:str', @canonicalizePropertyName(parameterName, allowParameterKeys))

    unless hasRequired
      if requiredByDefault
        @add_key_value_to_node(node, 'required', 'tag:yaml.org,2002:bool', 'true')

    unless hasType
      @add_key_value_to_node(node, 'type', 'tag:yaml.org,2002:str', 'string')

  add_key_value_to_node: (node, keyName, valueTag, value) =>
    propertyName = new nodes.ScalarNode 'tag:yaml.org,2002:str', keyName, node.start_mark, node.end_mark
    propertyValue = new nodes.ScalarNode valueTag, value, node.start_mark, node.end_mark
    node.value.push([propertyName, propertyValue])

  transform_document: (node) ->
    if node?.value
      node.value.forEach (property) =>
        switch property[0].value
          when "title"              then @noop()
          when "securitySchemes"    then @noop()
          when "schemas"            then @noop()
          when "version"            then @noop()
          when "documentation"      then @noop()
          when "mediaType"          then @noop()
          when "securedBy"          then @noop()
          when "baseUri"            then @noop()
          when "traits"             then @transform_traits property[1]
          when "baseUriParameters"  then @transform_named_params property, false
          when "resourceTypes"      then @transform_types property[1]
          when "resources"          then property[1]?.value.forEach (resource) => @transform_resource resource
          else @noop()

  transform_resource: (resource, allowParameterKeys = false) ->
    if resource.value
      resource.value.forEach (property) =>
        isKnownCommonProperty = @transform_common_properties property, allowParameterKeys
        unless isKnownCommonProperty
          if @isHttpMethod property[0].value, allowParameterKeys
            @transform_method property[1], allowParameterKeys
          else
            canonicalKey = @canonicalizePropertyName(property[0].value, allowParameterKeys)
            switch canonicalKey
              when "type"               then @noop()
              when "usage"              then @noop()
              when "securedBy"          then @noop()
              when "uriParameters"      then @transform_named_params property, allowParameterKeys
              when "baseUriParameters"  then @transform_named_params property, allowParameterKeys
              when "resources"          then property[1]?.value.forEach (resource) => @transform_resource resource
              when "methods"            then property[1]?.value.forEach (method) => @transform_method method, allowParameterKeys
              else @noop()

  transform_method: (method, allowParameterKeys) ->
    return if util.isNull method
    method.value.forEach (property) =>
      return if @transform_common_properties property, allowParameterKeys
      canonicalKey = @canonicalizePropertyName(property[0].value, allowParameterKeys)
      switch canonicalKey
        when "securedBy"        then @noop()
        when "usage"            then @noop()
        when "headers"          then @transform_named_params property, allowParameterKeys, false
        when "queryParameters"  then @transform_named_params property, allowParameterKeys, false
        when "baseUriParameters"then @transform_named_params property, allowParameterKeys
        when "body"             then @transform_body property, allowParameterKeys
        when "responses"        then @transform_responses property, allowParameterKeys
        else @noop()

  transform_responses: (responses, allowParameterKeys) ->
    return if util.isNull responses[1]
    responses[1].value.forEach (response) => @transform_response response, allowParameterKeys

  transform_response: (response, allowParameterKeys) ->
    if util.isMapping response[1]
      response[1].value.forEach (property) =>
        canonicalKey = @canonicalizePropertyName(property[0].value, allowParameterKeys)
        switch canonicalKey
          when "description"  then @noop()
          when "body"         then @transform_body property, allowParameterKeys
          when "headers"      then @transform_named_params property, allowParameterKeys, false
          else @noop()

  isContentTypeString: (value) =>
    return value?.match(/^[^\/]+\/[^\/]+$/)

  transform_body: (property, allowParameterKeys) ->
    return if util.isNull property[1]
    property[1].value?.forEach (bodyProperty) =>
      if @isParameterKey(bodyProperty) then @noop()
      else if @isContentTypeString(bodyProperty[0].value) then @transform_body bodyProperty, allowParameterKeys
      else
        canonicalProperty = @canonicalizePropertyName( bodyProperty[0].value, allowParameterKeys)
        switch canonicalProperty
          when "example"        then @noop()
          when "schema"         then @noop()
          when "formParameters" then @transform_named_params bodyProperty, allowParameterKeys, false
          else @noop()

  transform_common_properties: (property, allowParameterKeys) ->
    if @isParameterKey(property)
      return true
    else
      canonicalProperty = @canonicalizePropertyName( property[0].value, allowParameterKeys)
      switch canonicalProperty
        when "displayName"  then return true
        when "description"  then return true
        when "is"           then return true
        else @noop()
    return false
