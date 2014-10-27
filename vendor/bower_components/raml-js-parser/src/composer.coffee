events            = require './events'
{MarkedYAMLError} = require './errors'
nodes             = require './nodes'
raml              = require './raml'
util              = require './util'

class @ComposerError extends MarkedYAMLError

class @Composer

  constructor: ->
    @anchors = {}
    @filesToRead = []

  check_node: ->
    # Drop the STREAM-START event.
    @get_event() if @check_event events.StreamStartEvent

    # Are there more documents available?
    return not @check_event events.StreamEndEvent

  ###
  Get the root node of the next document.
  ###
  get_node: ->
    return @compose_document() unless @check_event events.StreamEndEvent

  getYamlRoot: ->
    # Drop the STREAM-START event.
    @get_event()

    # Compose a document if the stream is not empty.
    document = null
    document = @compose_document() unless @check_event events.StreamEndEvent

    # Ensure that the stream contains no more documents.
    unless @check_event events.StreamEndEvent
      event = @get_event()
      throw new exports.ComposerError 'document scan',
        document.start_mark, 'expected a single document in the stream but found another document', event.start_mark

    # Drop the STREAM-END event.
    @get_event()

    return document

  composeRamlTree: (node, settings)=>
    if settings.validate or settings.transform
      @load_schemas node
      @load_traits node
      @load_types node
      @load_security_schemes node

    if settings.validate
      @validate_document node

    if settings.transform
      @apply_types node
      @apply_traits node
      @apply_schemas node
      @apply_protocols node
      @join_resources node

    return node

  compose_document: ->
    # Drop the DOCUMENT-START event.
    @get_event()

    # Compose the root node.
    node = @compose_node()

    # Drop the DOCUMENT-END node.
    @get_event()

    @anchors = {}
    return node

  getPendingFilesList: ->
    return @filesToRead

  compose_node: (parent, index) ->
    if @check_event events.AliasEvent
      event = @get_event()
      anchor = event.anchor
      throw new exports.ComposerError null, null, "found undefined alias #{anchor}", event.start_mark \
        if anchor not of @anchors
      return @anchors[anchor].clone()

    event = @peek_event()
    anchor = event.anchor
    throw new exports.ComposerError \
      "found duplicate anchor #{anchor}; first occurence", \
      @anchors[anchor].start_mark, 'second occurrence', event.start_mark \
      if anchor isnt null and anchor of @anchors

    @descend_resolver parent, index
    if @check_event events.ScalarEvent
      node = @compose_scalar_node anchor, parent, index
    else if @check_event events.SequenceStartEvent
      node = @compose_sequence_node anchor
    else if @check_event events.MappingStartEvent
      node = @compose_mapping_node anchor
    @ascend_resolver()

    return node

  compose_fixed_scalar_node: (anchor, value) ->
    event = @get_event()
    node = new nodes.ScalarNode 'tag:yaml.org,2002:str', value, event.start_mark,
      event.end_mark, event.style
    @anchors[anchor] = node if anchor isnt null
    return node

  compose_scalar_node: (anchor, parent, key) ->
    event = @get_event()
    tag   = event.tag
    node  = {}

    if tag is null or tag is '!'
      tag = @resolve nodes.ScalarNode, event.value, event.implicit

    if event.tag is '!include'
      if event.value.match(/^\s*$/)
        throw new exports.ComposerError 'while composing scalar out of !include', null, "file name/URL cannot be null", event.start_mark

      extension = event.value.split('.').pop()
      if extension in ['yaml', 'yml', 'raml']
        fileType = 'fragment'
      else
        fileType = 'scalar'

      @filesToRead.push({
        targetUri: event.value,
        type: fileType,
        parentNode: parent,
        parentKey: key,
        event: event,
        includingContext: @src,
        targetFileUri: event.value
      })

      node = undefined
    else
      node = new nodes.ScalarNode tag, event.value, event.start_mark, event.end_mark, event.style

    if anchor and node
      @anchors[anchor] = node

    return node

  compose_sequence_node: (anchor) ->
    start_event = @get_event()
    tag         = start_event.tag

    if tag is null or tag is '!'
      tag = @resolve nodes.SequenceNode, null, start_event.implicit

    node  = new nodes.SequenceNode tag, [], start_event.start_mark, null, start_event.flow_style
    index = 0

    if anchor
      @anchors[anchor] = node

    while not @check_event events.SequenceEndEvent
      # value is undefined in case it's being added later (deferred)
      if value = @compose_node node, index
        node.value[index] = value

      index++

    end_event     = @get_event()
    node.end_mark = end_event.end_mark

    return node

  compose_mapping_node: (anchor) ->
    start_event = @get_event()
    tag = start_event.tag

    if tag is null or tag is '!'
      tag = @resolve nodes.MappingNode, null, start_event.implicit

    node = new nodes.MappingNode tag, [], start_event.start_mark, null,
      start_event.flow_style
    @anchors[anchor] = node if anchor isnt null
    while not @check_event events.MappingEndEvent
      item_key = @compose_node node
      unless util.isScalar(item_key)
        throw new exports.ComposerError 'while composing mapping key', null, "only scalar map keys are allowed in RAML" , item_key.start_mark

      # item_value is undefined in case it's being added later (deferred)
      if item_value = @compose_node node, item_key
        node.value.push [item_key, item_value]

    end_event = @get_event()
    node.end_mark = end_event.end_mark
    return node

