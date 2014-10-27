url               = require 'url'
uritemplate       = require 'uritemplate'
{MarkedYAMLError} = require './errors'
nodes             = require './nodes'
traits            = require './traits'
util              = require './util'
jsonlint          = require 'json-lint'

###
The Validator throws these.
###
class @ValidationError extends MarkedYAMLError

###
A collection of multiple validation errors
###
class @ValidationErrors extends MarkedYAMLError
  constructor: (validation_errors) ->
    @validation_errors = validation_errors

  get_validation_errors: ->
    return @validation_errors

###
The Validator class deals with validating a YAML file according to the spec
###
class @Validator
  constructor: ->
    @validations = [@validate_root, @validate_root_properties, @validate_base_uri_parameters, @valid_absolute_uris]

  validate_document: (node) ->
    for validation in @validations
      validation.call @, node
    return true

  validate_security_schemes: (schemesProperty) ->
    unless util.isSequence schemesProperty
      throw new exports.ValidationError 'while validating securitySchemes', null, 'invalid security schemes property, it must be an array', schemesProperty.start_mark

    for scheme_entry in schemesProperty.value
      unless util.isMapping scheme_entry
        throw new exports.ValidationError 'while validating securitySchemes', null, 'invalid security scheme property, it must be a map', scheme_entry.start_mark

      for scheme in scheme_entry.value
        unless util.isMapping scheme[1]
          throw new exports.ValidationError 'while validating securitySchemes', null, 'invalid security scheme property, it must be a map', scheme[0].start_mark

        @validate_security_scheme scheme[1]

  trackRepeatedProperties: (properties, key, property, section = "RAML", errorMessage = "a property with the same name already exists") ->
    if key of properties
      throw new exports.ValidationError "while validating #{section}", null, "#{errorMessage}: '#{key}'", property.start_mark
    properties[key] = property

  validate_security_scheme: (scheme) ->
    type = null
    settings = null
    schemeProperties = {}
    for property in scheme.value
      @trackRepeatedProperties(schemeProperties, property[0].value, property[0], 'while validating security scheme', "property already used in security scheme")

      switch property[0].value
        when "description"
          unless util.isScalar property[1]
            throw new exports.ValidationError 'while validating security scheme', null, 'schemes description must be a string', property[1].start_mark
        when "type"
          type = property[1].value
          unless util.isString(property[1]) and type.match(/^(OAuth 1.0|OAuth 2.0|Basic Authentication|Digest Authentication|x-.+)$/)
            throw new exports.ValidationError 'while validating security scheme', null, 'schemes type must be any of: "OAuth 1.0", "OAuth 2.0", "Basic Authentication", "Digest Authentication", "x-\{.+\}"', property[1].start_mark
        when "describedBy"
          @validate_method property, true, "security scheme"
        when "settings"
          settings = property
          unless util.isNullableMapping property[1]
            throw new exports.ValidationError 'while validating security scheme', null, 'schemes settings must be a map', property[1].start_mark
        else
          throw new exports.ValidationError 'while validating security scheme', null, "property: '#{property[0].value}' is invalid in a security scheme", property[0].start_mark
    unless type
      throw new exports.ValidationError 'while validating security scheme', null, 'schemes type must be any of: "OAuth 1.0", "OAuth 2.0", "Basic Authentication", "Digest Authentication", "x-\{.+\}"', scheme.start_mark
    else if type is "OAuth 2.0"
      unless settings
        throw new exports.ValidationError 'while validating security scheme', null, 'for OAuth 2.0 settings must be a map', scheme.start_mark
      @validate_oauth2_settings settings
      # validate settings
    else if type is "OAuth 1.0"
      unless settings
        throw new exports.ValidationError 'while validating security scheme', null, 'for OAuth 1.0 settings must be a map', scheme.start_mark
      @validate_oauth1_settings settings

  validate_oauth2_settings: (settings) ->
    settingProperties = {}

    for property in settings[1].value
      @trackRepeatedProperties(settingProperties, property[0].value, property[0], 'while validating security scheme', "setting with the same name already exists")

      switch property[0].value
        when "authorizationUri"
          unless util.isString property[1]
            throw new exports.ValidationError 'while validating security scheme', null, 'authorizationUri must be a URL', property[0].start_mark

        when  "accessTokenUri"
          unless util.isString property[1]
            throw new exports.ValidationError 'while validating security scheme', null, 'accessTokenUri must be a URL', property[0].start_mark

    for propertyName in ['accessTokenUri', 'authorizationUri']
      unless  propertyName of settingProperties
        throw new exports.ValidationError 'while validating security scheme', null, "OAuth 2.0 settings must have #{propertyName} property", settings[0].start_mark

  validate_oauth1_settings: (settings) ->
    settingProperties = {}

    for property in settings[1].value
      @trackRepeatedProperties(settingProperties, property[0].value, property[0], 'while validating security scheme', "setting with the same name already exists")

      switch property[0].value
        when "requestTokenUri"
          unless util.isString property[1]
            throw new exports.ValidationError 'while validating security scheme', null, 'requestTokenUri must be a URL', property[0].start_mark

        when "authorizationUri"
          unless util.isString property[1]
            throw new exports.ValidationError 'while validating security scheme', null, 'authorizationUri must be a URL', property[0].start_mark

        when "tokenCredentialsUri"
          unless util.isString property[1]
            throw new exports.ValidationError 'while validating security scheme', null, 'tokenCredentialsUri must be a URL', property[0].start_mark

    for propertyName in ['requestTokenUri', 'authorizationUri', 'tokenCredentialsUri']
      unless  propertyName of settingProperties
        throw new exports.ValidationError 'while validating security scheme', null, "OAuth 1.0 settings must have #{propertyName} property", settings[0].start_mark

  validate_root_schemas: (schemas) ->
    unless util.isSequence schemas
      throw new exports.ValidationError 'while validating schemas', null, 'schemas property must be an array', schemas.start_mark
    schemaList = @get_all_schemas()
    for schemaName, schema of schemaList
      unless schema[1].tag and util.isString schema[1]
        throw new exports.ValidationError 'while validating schemas', null, 'schema ' + schemaName + ' must be a string', schema[0].start_mark
      @validateSchema schema[1]

  validate_root: (node) ->
    unless node or util.isNull node
      throw new exports.ValidationError 'while validating root', null, 'empty document', node?.start_mark

    unless util.isMapping node
      throw new exports.ValidationError 'while validating root', null, 'document must be a map', node.start_mark

  validate_base_uri_parameters: () ->
    unless @baseUriParameters
      return

    unless @baseUri
      throw new exports.ValidationError 'while validating uri parameters', null, 'uri parameters defined when there is no baseUri', @baseUriParameters.start_mark

    unless util.isNullableMapping @baseUriParameters
      throw new exports.ValidationError 'while validating uri parameters', null, 'base uri parameters must be a map', @baseUriParameters.start_mark

    @validate_uri_parameters @baseUri, @baseUriParameters, false, false, [ "version" ]

  validate_uri_parameters: (uri, uriProperty, allowParameterKeys, skipParameterUseCheck, reservedNames = []) ->
    try
      template = uritemplate.parse uri
    catch err
      throw new exports.ValidationError 'while validating uri parameters', null, err?.options?.message, uriProperty.start_mark
    expressions = template.expressions.filter((expr) -> return "templateText" of expr ).map (expression) -> expression.templateText
    uriParameters = {}
    if typeof uriProperty.value is "object"
      for uriParameter in uriProperty.value
        parameterName = @canonicalizePropertyName(uriParameter[0].value, allowParameterKeys)
        @trackRepeatedProperties(uriParameters, parameterName, uriProperty, 'while validating URI parameters', "URI parameter with the same name already exists")

        if parameterName in reservedNames
          throw new exports.ValidationError 'while validating baseUri', null, uriParameter[0].value + ' parameter not allowed here', uriParameter[0].start_mark
        unless util.isNullableMapping(uriParameter[1], allowParameterKeys) or util.isNullableSequence(uriParameter[1], allowParameterKeys)
          throw new exports.ValidationError 'while validating baseUri', null, 'URI parameter must be a map', uriParameter[0].start_mark
        unless util.isNull(uriParameter[1])
          @valid_common_parameter_properties uriParameter[1], allowParameterKeys
        unless skipParameterUseCheck or @isParameterKey(uriParameter) or parameterName in expressions
          throw new exports.ValidationError 'while validating baseUri', null, uriParameter[0].value + ' uri parameter unused', uriParameter[0].start_mark

  validate_types: (typeProperty) ->
    types = typeProperty.value
    unless util.isSequence typeProperty
      throw new exports.ValidationError 'while validating resource types', null, 'invalid resourceTypes definition, it must be an array', typeProperty.start_mark

    for type_entry in types
      unless util.isMapping type_entry
        throw new exports.ValidationError 'while validating resource types', null, 'invalid resourceType definition, it must be a map', type_entry.start_mark

      for type in type_entry.value
        if @isParameterKey type
          throw new exports.ValidationError 'while validating resource types', null, 'parameter key cannot be used as a resource type name', type[0].start_mark

        unless util.isMapping type[1]
          throw new exports.ValidationError 'while validating resource types', null, 'invalid resourceType definition, it must be a map', type[1].start_mark

        @validate_resource type, true, 'resource type'

  validate_traits: (traitProperty) ->
    traits = traitProperty.value
    unless Array.isArray traits
      throw new exports.ValidationError 'while validating traits', null, 'invalid traits definition, it must be an array', traitProperty.start_mark

    for trait_entry in traits
      unless Array.isArray trait_entry.value
        throw new exports.ValidationError 'while validating traits', null, 'invalid traits definition, it must be an array', traitProperty.start_mark

      for trait in trait_entry.value
        if @isParameterKey trait
          throw new exports.ValidationError 'while validating traits', null, 'parameter key cannot be used as a trait name', trait[0].start_mark

        unless util.isMapping trait[1]
          throw new exports.ValidationError 'while validating traits', null, 'invalid trait definition, it must be a map', trait[1].start_mark

        @valid_traits_properties trait

  valid_traits_properties: (node) ->
    return unless node[1].value
    return unless util.isMapping node[1]
    invalid = node[1].value.filter (childNode) ->
      return (  childNode[0].value is "is" or
                childNode[0].value is "type" )
    if invalid.length > 0
      throw new exports.ValidationError 'while validating trait properties', null, "property: '" + invalid[0][0].value + "' is invalid in a trait", invalid[0][0].start_mark

    @validate_method node, true, 'trait'

  canonicalizePropertyName: (propertyName, mustRemoveQuestionMark)   ->
    if mustRemoveQuestionMark and propertyName.slice(-1) is '?'
      return propertyName.slice(0,-1)
    return propertyName

  valid_common_parameter_properties: (node, allowParameterKeys) ->
    return unless node.value
    if util.isSequence(node)
      if node.value.length == 0
        throw new exports.ValidationError 'while validating parameter properties', null, 'named parameter needs at least one type', node.start_mark
      unless node.value.length > 1
        throw new exports.ValidationError 'while validating parameter properties', null, 'single type for variably typed parameter', node.start_mark
      for parameter in node.value
        @validate_named_parameter(parameter, allowParameterKeys)
    else
      @validate_named_parameter(node, allowParameterKeys)

  validate_named_parameter: (node, allowParameterKeys) ->
    parameterProperties = {}
    parameterType = "string"
    for childNode in node.value
      propertyName = childNode[0].value
      propertyValue = childNode[1].value
      @trackRepeatedProperties(parameterProperties, @canonicalizePropertyName(childNode[0].value, true), childNode[0], 'while validating parameter properties', "parameter property already used")
      booleanValues = ["true", "false"]

      if allowParameterKeys
        continue if @isParameterKey(childNode) or @isParameterValue(childNode)

      canonicalPropertyName = @canonicalizePropertyName propertyName, allowParameterKeys
      valid = true

      switch propertyName
        when "displayName"
          unless util.isScalar (childNode[1])
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of displayName must be a scalar', childNode[1].start_mark
        when "pattern"
          unless util.isScalar (childNode[1])
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of pattern must be a scalar', childNode[1].start_mark
        when "default"
          unless util.isScalar (childNode[1])
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of default must be a scalar', childNode[1].start_mark
        when "description"
          unless util.isScalar (childNode[1])
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of description must be a scalar', childNode[1].start_mark
        when "example"
          unless util.isScalar (childNode[1])
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of example must be a scalar', childNode[1].start_mark
        when "minLength"
          if isNaN(propertyValue)
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of minLength must be a number', childNode[1].start_mark
        when "maxLength"
          if isNaN(propertyValue)
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of maxLength must be a number', childNode[1].start_mark
        when "minimum"
          if isNaN(propertyValue)
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of minimum must be a number', childNode[1].start_mark
        when "maximum"
          if isNaN(propertyValue)
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of maximum must be a number', childNode[1].start_mark
        when "type"
          parameterType = propertyValue
          validTypes = ['string', 'number', 'integer', 'date', 'boolean', 'file']
          unless  propertyValue in validTypes
            throw new exports.ValidationError 'while validating parameter properties', null, 'type can be either of: string, number, integer, file, date or boolean ', childNode[1].start_mark
        when "required"
          unless propertyValue in booleanValues
            throw new exports.ValidationError 'while validating parameter properties', null, 'required can be any either true or false', childNode[1].start_mark
        when "repeat"
          unless propertyValue in booleanValues
            throw new exports.ValidationError 'while validating parameter properties', null, 'repeat can be any either true or false', childNode[1].start_mark
        else
          valid = false

      switch canonicalPropertyName
        when "enum"
          unless util.isNullableSequence(childNode[1])
            throw new exports.ValidationError 'while validating parameter properties', null, 'the value of enum must be an array', childNode[1].start_mark
          unless childNode[1].value.length
            throw new exports.ValidationError 'while validating parameter properties', null, 'enum is empty', childNode[1].start_mark
          enumValues = @get_list_values (childNode[1].value)
          if @hasDuplicates(enumValues)
            throw new exports.ValidationError 'while validating parameter properties', null, 'enum contains duplicated values', childNode[1].start_mark
        else
          unless valid
            throw new exports.ValidationError 'while validating parameter properties', null, "unknown property #{propertyName}", childNode[0].start_mark

    # Validate that we are not using incorrect properties for a non string
    unless parameterType is "string"
      for unusableProperty in ['enum', 'pattern', 'minLength', 'maxLength']
        if unusableProperty of parameterProperties
          throw new exports.ValidationError 'while validating parameter properties', null, "property #{unusableProperty} can only be used if type is 'string'", parameterProperties[unusableProperty].start_mark

    # Validate that we are not using incorrect properties for a non numeric parameter
    unless parameterType is "number" or parameterType is "integer"
      for unusableProperty in ['minimum', 'maximum']
        if unusableProperty of parameterProperties
          throw new exports.ValidationError 'while validating parameter properties', null, "property #{unusableProperty} can only be used if type is 'number' or 'integer'", parameterProperties[unusableProperty].start_mark

  get_list_values: (node) =>
    return node.map (item) => item.value

  validate_root_properties: (node) ->
    checkVersion   = false
    rootProperties = {}

    if node?.value
      for property in node.value
        if property[0].value.match(/^\//)
          @trackRepeatedProperties(rootProperties, @canonicalizePropertyName(property[0].value, true), property[0], 'while validating root properties', "resource already declared")
        else
          @trackRepeatedProperties(rootProperties, property[0].value, property[0], 'while validating root properties', 'root property already used')

        switch property[0].value
          when 'title'
            unless util.isScalar(property[1])
              throw new exports.ValidationError 'while validating root properties', null, 'title must be a string', property[0].start_mark

          when 'baseUri'
            unless util.isScalar(property[1])
              throw new exports.ValidationError 'while validating root properties', null, 'baseUri must be a string', property[0].start_mark
            @baseUri = property[1].value
            checkVersion = @validate_base_uri property[1]

          when 'securitySchemes'
            @validate_security_schemes property[1]

          when 'schemas'
            @validate_root_schemas property[1]

          when 'version'
            unless util.isScalar(property[1])
              throw new exports.ValidationError 'while validating root properties', null, 'version must be a string', property[0].start_mark
            unless util.isNull(property[1])
              property[1].tag = 'tag:yaml.org,2002:str'
          when 'traits'
            @validate_traits property[1]

          when 'documentation'
            unless util.isSequence property[1]
              throw new exports.ValidationError 'while validating root properties', null, 'documentation must be an array', property[0].start_mark
            @validate_documentation property[1]

          when 'mediaType'
            unless util.isString property[1]
              throw new exports.ValidationError 'while validating root properties', null, 'mediaType must be a scalar', property[0].start_mark

          when 'baseUriParameters'
            @baseUriParameters = property[1]
            util.isNoop property[1]

          when 'resourceTypes'
            @validate_types property[1]

          when 'securedBy'
            @validate_secured_by property

          when 'protocols'
            @validate_protocols_property property

          else
            if property[0].value.match(/^\//)
              @validate_resource property
            else
              throw new exports.ValidationError 'while validating root properties', null, "unknown property #{property[0].value}", property[0].start_mark

    unless 'title' of rootProperties
      throw new exports.ValidationError 'while validating root properties', null, 'missing title', node.start_mark

    if checkVersion and not ('version' of rootProperties)
      throw new exports.ValidationError 'while validating version', null, 'missing version', node.start_mark

  validate_documentation: (documentation_property) ->
    unless documentation_property.value.length
      throw new exports.ValidationError 'while validating documentation section', null, 'there must be at least one document in the documentation section', documentation_property.start_mark
    for docSection in documentation_property.value
      @validate_doc_section docSection

  validate_doc_section: (docSection) ->
    unless util.isMapping docSection
      throw new exports.ValidationError 'while validating documentation section', null, 'each documentation section must be a map', docSection.start_mark
    docProperties = {}
    for property in docSection.value
      @trackRepeatedProperties(docProperties, property[0].value, property[0], 'while validating documentation section', "property already used")
      switch property[0].value
        when "title"
          unless util.isScalar(property[1]) and not util.isNull(property[1])
            throw new exports.ValidationError 'while validating documentation section', null, 'title must be a string', property[0].start_mark
        when "content"
          unless util.isScalar(property[1]) and not util.isNull(property[1])
            throw new exports.ValidationError 'while validating documentation section', null, 'content must be a string', property[0].start_mark
        else
          throw new exports.ValidationError 'while validating root properties', null, 'unknown property ' + property[0].value, property[0].start_mark
    unless "content" of docProperties
      throw new exports.ValidationError 'while validating documentation section', null, 'a documentation entry must have content property', docSection.start_mark
    unless "title" of docProperties
      throw new exports.ValidationError 'while validating documentation section', null, 'a documentation entry must have title property', docSection.start_mark

  child_resources: (node) ->
    if node and util.isMapping node
      return node.value.filter (childNode) -> return childNode[0].value.match(/^\//)
    return []

  validate_resource: (resource, allowParameterKeys = false, context = "resource") ->
    unless resource[1] and util.isNullableMapping(resource[1])
      throw new exports.ValidationError 'while validating resources', null, 'resource is not a map', resource[1].start_mark
    if resource[0].value
      try
        template = uritemplate.parse resource[0].value
      catch err
        throw new exports.ValidationError 'while validating resource', null, "Resource name is invalid: " + err?.options?.message, resource[0].start_mark

    return if util.isNull resource[1]

    if resource[1].value
      resourceProperties = {}
      for property in resource[1].value
        if property[0].value.match(/^\//)
          @trackRepeatedProperties(resourceProperties, @canonicalizePropertyName(property[0].value, true), property[0], 'while validating resource', "resource already declared")
        else if @isHttpMethod property[0].value, allowParameterKeys
          @trackRepeatedProperties(resourceProperties, @canonicalizePropertyName(property[0].value, true), property[0], 'while validating resource', "method already declared")
        else
          @trackRepeatedProperties(resourceProperties, @canonicalizePropertyName(property[0].value, true), property[0], 'while validating resource', "property already used")

        unless @validate_common_properties property, allowParameterKeys
          if property[0].value.match(/^\//)
            if allowParameterKeys
              throw new exports.ValidationError 'while validating trait properties', null, 'resource type cannot define child resources', property[0].start_mark
            @validate_resource property, allowParameterKeys
          else if @isHttpMethod property[0].value, allowParameterKeys
            @validate_method property, allowParameterKeys, 'method'
          else
            key = property[0].value
            canonicalKey = @canonicalizePropertyName(key, allowParameterKeys)
            valid = true

            # these properties are allowed to be parametrized in resource types
            switch canonicalKey
              when "uriParameters"
                unless util.isNullableMapping(property[1])
                  throw new exports.ValidationError 'while validating uri parameters', null, 'uri parameters must be a map', property[0].start_mark
                @validate_uri_parameters resource[0].value, property[1], allowParameterKeys, allowParameterKeys
              when "baseUriParameters"
                unless @baseUri
                  throw new exports.ValidationError 'while validating uri parameters', null, 'base uri parameters defined when there is no baseUri', property[0].start_mark
                unless util.isNullableMapping(property[1])
                  throw new exports.ValidationError 'while validating uri parameters', null, 'base uri parameters must be a map', property[0].start_mark
                @validate_uri_parameters @baseUri, property[1], allowParameterKeys
              else
                valid = false

            # these properties belong to the resource/resource type and cannot be optional
            switch key
              when "type"
                @validate_type_property property, allowParameterKeys
              when "usage"
                unless allowParameterKeys
                  throw new exports.ValidationError 'while validating resources', null, "property: '" + property[0].value + "' is invalid in a resource", property[0].start_mark
              when "securedBy"
                @validate_secured_by property
              else
                unless valid
                  throw new exports.ValidationError 'while validating resources', null, "property: '" + property[0].value + "' is invalid in a #{context}", property[0].start_mark

  validate_secured_by: (property) ->
    unless util.isSequence property[1]
      throw new exports.ValidationError 'while validating securityScheme', null, "property 'securedBy' must be an array", property[0].start_mark

    secSchemes = @get_list_values (property[1].value)
    if @hasDuplicates(secSchemes)
      throw new exports.ValidationError 'while validating securityScheme consumption', null, 'securitySchemes can only be referenced once in a securedBy property', property[0].start_mark

    for secScheme in property[1].value
      if util.isSequence secScheme
        throw new exports.ValidationError 'while validating securityScheme consumption', null, 'securityScheme reference cannot be an array', secScheme.start_mark
      unless util.isNull secScheme
        securitySchemeName = @key_or_value secScheme
        unless @get_security_scheme securitySchemeName
          throw new exports.ValidationError 'while validating securityScheme consumption', null, 'there is no securityScheme named ' + securitySchemeName, secScheme.start_mark

  validate_protocols_property: (property) ->
    unless util.isSequence property[1]
      throw new exports.ValidationError 'while validating protocols', null, 'property must be an array', property[0].start_mark

    for protocol in property[1].value
      unless util.isString protocol
        throw new exports.ValidationError 'while validating protocols', null, 'value must be a string', protocol.start_mark

      unless protocol.value in ['HTTP', 'HTTPS']
        throw new exports.ValidationError 'while validating protocols', null, 'only HTTP and HTTPS values are allowed', protocol.start_mark

  validate_type_property: (property) ->
    unless util.isMapping(property[1]) or util.isString(property[1])
      throw new exports.ValidationError 'while validating resource types', null, "property 'type' must be a string or a map", property[0].start_mark

    if util.isMapping property[1]
      if property[1].value.length > 1
        throw new exports.ValidationError 'while validating resource types', null, 'a resource or resourceType can inherit from a single resourceType', property[0].start_mark

    typeName = @key_or_value property[1]
    unless typeName?.trim()
      throw new exports.ValidationError 'while validating resource type consumption', null, 'resource type name must be provided', property[1].start_mark

    unless @isParameterKeyValue(typeName) or @get_type(typeName)
      throw new exports.ValidationError 'while validating resource type consumption', null, "there is no resource type named #{typeName}", property[1].start_mark

    if util.isMapping property[1]
      for parameter in property[1].value
        unless util.isNull(parameter[1]) or util.isMapping(parameter[1])
          throw new exports.ValidationError 'while validating resource consumption', null, 'resource type parameters must be in a map', parameter[1].start_mark

  validate_method: (method, allowParameterKeys, context = 'method') ->
    if util.isNull method[1]
      return

    unless util.isMapping method[1]
      throw new exports.ValidationError 'while validating methods', null, "method must be a map", method[0].start_mark

    methodProperties = {}
    for property in method[1].value
      @trackRepeatedProperties(methodProperties, @canonicalizePropertyName(property[0].value, true), property[0], 'while validating method', "property already used")
      continue if @validate_common_properties property, allowParameterKeys, context

      key          = property[0].value
      canonicalKey = @canonicalizePropertyName(key, allowParameterKeys)
      valid        = true

      # these properties are allowed in resources and traits
      switch canonicalKey
        when 'headers'
          @validate_headers property, allowParameterKeys

        when 'queryParameters'
          @validate_query_params property, allowParameterKeys

        when 'body'
          @validate_body property, allowParameterKeys, null, false

        when 'responses'
          @validate_responses property, allowParameterKeys

        when 'baseUriParameters'
          unless @baseUri
            throw new exports.ValidationError 'while validating uri parameters', null, 'base uri parameters defined when there is no baseUri', property[0].start_mark

          unless util.isNullableMapping(property[1])
            throw new exports.ValidationError 'while validating uri parameters', null, 'base uri parameters must be a map', property[0].start_mark

          @validate_uri_parameters @baseUri, property[1], allowParameterKeys

        when 'protocols'
          @validate_protocols_property property

        else
          valid = false

      # property securedBy in a trait/type does not get passed to the resource
      switch key
        when 'securedBy'
          @validate_secured_by property

        when 'usage'
          unless allowParameterKeys and context is 'trait'
            throw new exports.ValidationError 'while validating resources', null, "property: 'usage' is invalid in a #{context}", property[0].start_mark

        else
          unless valid
            throw new exports.ValidationError 'while validating resources', null, "property: '#{property[0].value}' is invalid in a #{context}", property[0].start_mark

  validate_responses: (responses, allowParameterKeys) ->
    if util.isNull responses[1]
      return
    unless util.isMapping responses[1]
      throw new exports.ValidationError 'while validating responses', null, "property: 'responses' must be a map", responses[0].start_mark
    responseValues = {}
    for response in responses[1].value
      unless util.isNullableMapping response[1]
        throw new exports.ValidationError 'while validating responses', null, 'each response must be a map', response[1].start_mark
      @trackRepeatedProperties(responseValues, @canonicalizePropertyName(response[0].value, true), response[0], 'while validating responses', "response code already used")
      @validate_response response, allowParameterKeys

  validate_query_params: (property, allowParameterKeys) ->
    if util.isNull property[1]
      return
    unless util.isMapping property[1]
      throw new exports.ValidationError 'while validating query parameters', null, "property: 'queryParameters' must be a map", property[0].start_mark
    queryParameters = {}
    for param in property[1].value
      unless util.isNullableMapping(param[1]) or util.isNullableSequence(param[1])
        throw new exports.ValidationError 'while validating query parameters', null, "each query parameter must be a map", param[1].start_mark
      @trackRepeatedProperties(queryParameters, @canonicalizePropertyName(param[0].value, true), param[0], 'while validating query parameter', "parameter name already used")
      @valid_common_parameter_properties param[1], allowParameterKeys

  validate_form_params: (property, allowParameterKeys) ->
    if util.isNull property[1]
      return
    unless util.isMapping property[1]
      throw new exports.ValidationError 'while validating query parameters', null, "property: 'formParameters' must be a map", property[0].start_mark
    formParameters = {}
    for param in property[1].value
      unless util.isNullableMapping(param[1]) or util.isNullableSequence(param[1])
        throw new exports.ValidationError 'while validating query parameters', null, 'each form parameter must be a map', param[1].start_mark
      @trackRepeatedProperties(formParameters, @canonicalizePropertyName(param[0].value, true), param[0], 'while validating form parameter', "parameter name already used")
      @valid_common_parameter_properties param[1], allowParameterKeys

  validate_headers: (property, allowParameterKeys) ->
    if util.isNull property[1]
      return
    unless util.isMapping property[1]
      throw new exports.ValidationError 'while validating headers', null, "property: 'headers' must be a map", property[0].start_mark
    headerNames = {}
    for param in property[1].value
      unless util.isNullableMapping(param[1]) or util.isNullableSequence(param[1])
        throw new exports.ValidationError 'while validating query parameters', null, "each header must be a map", param[1].start_mark
      @trackRepeatedProperties(headerNames, @canonicalizePropertyName(param[0].value, true), param[0], 'while validating headers', "header name already used")
      @valid_common_parameter_properties param[1], allowParameterKeys

  validate_response: (response, allowParameterKeys) ->
    if util.isSequence response[0]
      unless response[0].value.length
        throw new exports.ValidationError 'while validating responses', null, 'there must be at least one response code', response[0].start_mark
      for responseCode in response[0].value
        unless @isParameterKey(responseCode) or util.isInteger(responseCode) or !isNaN(@canonicalizePropertyName(responseCode, allowParameterKeys))
          throw new exports.ValidationError 'while validating responses', null, "each response key must be an integer", responseCode.start_mark
    else unless @isParameterKey(response) or util.isInteger(response[0]) or !isNaN(@canonicalizePropertyName(response[0].value, allowParameterKeys))
      throw new exports.ValidationError 'while validating responses', null, "each response key must be an integer", response[0].start_mark
    unless util.isNullableMapping response[1]
      throw new exports.ValidationError 'while validating responses', null, "each response property must be a map", response[0].start_mark

    if util.isMapping response[1]
      responseProperties = {}
      for property in response[1].value
        canonicalKey = @canonicalizePropertyName(property[0].value, allowParameterKeys)
        @trackRepeatedProperties(responseProperties, canonicalKey, property[0], 'while validating responses', "property already used")
        valid = true
        unless @isParameterKey(property)
          switch property[0].value
            when "description"
              unless util.isScalar(property[1])
                throw new exports.ValidationError 'while validating responses', null, 'property description must be a string', response[0].start_mark
            else
              valid = false

          switch canonicalKey
            when "body"
              @validate_body property, allowParameterKeys, null, true
            when "headers"
              unless util.isNullableMapping(property[1])
                throw new exports.ValidationError 'while validating resources', null, "property 'headers' must be a map", property[0].start_mark
              @validate_headers property
            else
              unless valid
                throw new exports.ValidationError 'while validating response', null, "property: '" + property[0].value + "' is invalid in a response", property[0].start_mark

  isHttpMethod: (value, allowParameterKeys = false) ->
    if value
      value = @canonicalizePropertyName value, allowParameterKeys
      return value.toLowerCase() in [
        # RFC2616
        'options',
        'get',
        'head',
        'post',
        'put',
        'delete',
        'trace',
        'connect',
        # RFC5789
        'patch'
      ]
    return false

  isParameterValue: (property) ->
    return @isParameterKey(property, false)

  isParameterKey: (property, checkKey = true) ->
    offset = if checkKey then 0 else 1
    unless checkKey or util.isScalar(property[1])
      return false

    # Check key or property
    if @isParameterKeyValue property[offset].value
      return true
    else if property[offset].value.match(/<<\s*([^\|\s>]+)\s*\|.*\s*>>/g)
      throw new exports.ValidationError 'while validating parameter', null, "unknown function applied to property name" , property[0].start_mark
    return false

  isParameterKeyValue: (value) ->
    if value.match(/<<\s*([^\|\s>]+)\s*>>/g) \
        or value.match(/<<\s*([^\|\s>]+)\s*(\|\s*\!\s*(singularize|pluralize))?\s*>>/g)
      return true
    return false

  validate_body: (property, allowParameterKeys, bodyMode = null, isResponseBody) ->
    if util.isNull property[1]
      return
    unless util.isMapping property[1]
      throw new exports.ValidationError 'while validating body', null, "property: body specification must be a map", property[0].start_mark
    implicitMode = ["implicit", "forcedImplicit"]
    bodyProperties = {}
    for bodyProperty in property[1].value
      @trackRepeatedProperties(bodyProperties, @canonicalizePropertyName(bodyProperty[0].value, true), bodyProperty[0], 'while validating body', "property already used")

      if @isParameterKey(bodyProperty)
        unless allowParameterKeys
          throw new exports.ValidationError 'while validating body', null, "property '" + bodyProperty[0].value + "' is invalid in a resource", bodyProperty[0].start_mark
      else if bodyProperty[0].value.match(/^[^\/]+\/[^\/]+$/)
        if bodyMode and bodyMode != "explicit"
          throw new exports.ValidationError 'while validating body', null, "not compatible with implicit default Media Type", bodyProperty[0].start_mark
        bodyMode = "explicit"
        @validate_body bodyProperty, allowParameterKeys, "forcedImplicit", isResponseBody
      else
        key = bodyProperty[0].value
        canonicalProperty = @canonicalizePropertyName( key, allowParameterKeys)
        valid = true
        switch canonicalProperty
          when "formParameters"
            if bodyMode and bodyMode not in implicitMode
              throw new exports.ValidationError 'while validating body', null, "not compatible with explicit Media Type", bodyProperty[0].start_mark
            bodyMode ?= "implicit"
            @validate_form_params bodyProperty, allowParameterKeys
          else
            valid = false

        switch key
          when "example"
            if bodyMode and bodyMode not in implicitMode
              throw new exports.ValidationError 'while validating body', null, "not compatible with explicit Media Type", bodyProperty[0].start_mark
            bodyMode ?= "implicit"
            unless util.isScalar(bodyProperty[1])
              throw new exports.ValidationError 'while validating body', null, "example must be a string", bodyProperty[0].start_mark
          when "schema"
            if bodyMode and bodyMode not in implicitMode
              throw new exports.ValidationError 'while validating body', null, "not compatible with explicit Media Type", bodyProperty[0].start_mark
            bodyMode ?= "implicit"
            unless util.isScalar(bodyProperty[1])
              throw new exports.ValidationError 'while validating body', null, "schema must be a string", bodyProperty[0].start_mark

            @validateSchema bodyProperty[1]
          else
            unless valid
              throw new exports.ValidationError 'while validating body', null, "property: '" + bodyProperty[0].value + "' is invalid in a body", bodyProperty[0].start_mark

    if "formParameters" of bodyProperties
      start_mark = bodyProperties.formParameters.start_mark

      if isResponseBody
        throw new exports.ValidationError 'while validating body', null, "formParameters cannot be used to describe response bodies", start_mark

      if "schema" of bodyProperties or "example" of bodyProperties
        throw new exports.ValidationError 'while validating body', null, "formParameters cannot be used together with the example or schema properties", start_mark

    if bodyMode is "implicit"
      unless @get_media_type()
        throw new exports.ValidationError 'while validating body', null, "body tries to use default Media Type, but mediaType is null", property[0].start_mark

  validateSchema: (property) ->
    # validate schema here
    if @isXmlSchema property.value
      undefined #noop
    else if @isJsonSchema property.value
      lint = jsonlint(property.value)
      if lint.error
        mark = @create_mark(property.start_mark.line + lint.line, 0)
        if property.end_mark.line is mark.line and property.end_mark.column is 0
          # The error is beyond the scope of the current property
          # rewind the error, make sure that it does
          mark.line--
        throw new exports.ValidationError 'while validating body', null, "schema is not valid JSON error: '#{lint.error}'", mark

      try
        schema = JSON.parse(property.value)
      catch error
        throw new exports.ValidationError 'while validating body', null, "schema is not valid JSON error: '#{error}'", property.start_mark

  isJsonSchema: (string) ->
    return string?.match(/^\s*\{/)

  isXmlSchema: (string) ->
    # Does it match something of the form?
    # <?xml?>
    # <xs:schema
    return string?.match(/^\s*(<\?xml[^>]+>)?[\s\n]*<xs:schema/)

  validate_common_properties: (property, allowParameterKeys, context) ->
    if @isParameterKey(property)
      unless allowParameterKeys
        throw new exports.ValidationError 'while validating resources', null, "property '" + property[0].value + "' is invalid in a resource", property[0].start_mark
      return true
    else
      switch property[0].value
        when "displayName"
          if context is 'method'
            return false
          unless util.isScalar(property[1])
            throw new exports.ValidationError 'while validating resources', null, "property 'displayName' must be a string", property[0].start_mark
          return true

        when "description"
          unless util.isScalar(property[1])
            throw new exports.ValidationError 'while validating resources', null, "property 'description' must be a string", property[0].start_mark
          return true

        when "is"
          unless util.isSequence property[1]
            throw new exports.ValidationError 'while validating resources', null, "property 'is' must be an array", property[0].start_mark

          for use in property[1].value
            @validate_trait_use use

          return true
    return false

  validate_trait_use: (node) ->
    unless util.isScalar(node) or util.isMapping(node)
      throw new exports.ValidationError 'while validating trait consumption', null, 'trait must be a string or a map', node.start_mark

    traitName = @key_or_value node
    unless traitName?.trim()
      throw new exports.ValidationError 'while validating trait consumption', null, 'trait name must be provided', node.start_mark

    unless @isParameterKeyValue(traitName) or @get_trait(traitName)
      throw new exports.ValidationError 'while validating trait consumption', null, "there is no trait named #{traitName}", node.start_mark

    if util.isScalar node
      return

    traitValue = node.value[0][1]
    unless util.isNull(traitValue) or util.isMapping(traitValue)
      throw new exports.ValidationError 'while validating trait consumption', null, 'trait must be a map', traitValue.start_mark

    if util.isNull traitValue
      return

    for parameter in traitValue.value
      unless util.isScalar parameter[1]
        throw new exports.ValidationError 'while validating trait consumption', null, 'parameter value must be a scalar', parameter[1].start_mark

  child_methods: (node) ->
    unless node and util.isMapping node
      return []
    return node.value.filter (childNode) => return @isHttpMethod childNode[0].value

  has_property: (node, property) ->
    if node and util.isMapping node
      return node.value.some((childNode) -> return childNode[0].value and typeof childNode[0].value != "object" and childNode[0].value is property)
    return false

  property_value: (node, property) ->
    filteredNodes = node.value.filter (childNode) ->
      return typeof childNode[0].value != "object" and childNode[0].value is property
    if (filteredNodes.length)
      return filteredNodes[0][1].value

  get_property: (node, property) ->
    if node and util.isMapping node
      filteredNodes = node.value.filter (childNode) =>
        return util.isString(childNode[0]) and childNode[0].value is property
      if filteredNodes.length > 0
        if filteredNodes[0].length > 0
          return filteredNodes[0][1]
    return []

  get_properties: (node, property) =>
    properties = []
    if node and util.isMapping node
      for prop in node.value
        if util.isString(prop[0]) and prop[0].value is property
          properties.push prop
        else
          properties = properties.concat @get_properties prop[1], property
    return properties

  valid_absolute_uris: (node ) ->
    uris = @get_absolute_uris node
    if repeatedUri = @hasDuplicatesUris(uris)
      throw new exports.ValidationError 'while validating trait consumption', null, "two resources share same URI #{repeatedUri.uri}", repeatedUri.mark

  get_absolute_uris: ( node, parentPath ) ->
    response = []
    unless util.isNullableMapping node
      throw new exports.ValidationError 'while validating resources', null, 'resource is not a map', node.start_mark
    child_resources = @child_resources node
    for childResource in child_resources
      if parentPath?
        uri = parentPath + childResource[0].value
      else
        uri = childResource[0].value
      response.push { uri: uri, mark: childResource[0].start_mark }
      response = response.concat( @get_absolute_uris(childResource[1], uri) )
    return response

  key_or_value: (node) ->
    if node instanceof nodes.ScalarNode
      return node.value
    if node instanceof nodes.MappingNode
      possibleKeyName = node?.value?[0]?[0]?.value
      if possibleKeyName
        return possibleKeyName
    return null

  value_or_undefined: (node) ->
    if node instanceof nodes.MappingNode
      return node.value
    return undefined

  validate_base_uri: (baseUriNode) ->
    baseUri = baseUriNode.value?.trim()
    unless baseUri
      throw new exports.ValidationError 'while validating baseUri', null, 'baseUri must have a value', baseUriNode.start_mark

    protocol = ((url.parse baseUri).protocol or 'http:').slice(0, -1).toUpperCase()
    unless protocol in ['HTTP', 'HTTPS']
      throw new exports.ValidationError 'while validating baseUri', null, 'baseUri protocol must be either HTTP or HTTPS', baseUriNode.start_mark

    try
      template = uritemplate.parse baseUri
    catch err
      throw new exports.ValidationError 'while validating baseUri', null, err?.options?.message, baseUriNode.start_mark

    expressions = template.expressions.filter((expr) -> return 'templateText' of expr).map (expression) -> expression.templateText
    if 'version' in expressions
      return true

  get_validation_errors: ->
    return @validation_errors

  is_valid: ->
    return @validation_errors.length == 0

  hasDuplicatesUris: (array) ->
    output = {}
    for item in array
      if item.uri of output
        return item
      output[item.uri] = item
    return false

  hasDuplicates: (array) ->
    output = {}
    for item in array
      if item of output
        return true
      output[item] = true
    return false
