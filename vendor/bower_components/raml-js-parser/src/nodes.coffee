{MarkedYAMLError} = require './errors'

unique_id = 0

class @ApplicationError extends MarkedYAMLError

class @Node
  constructor: (@tag, @value, @start_mark, @end_mark) ->
    @unique_id = "node_#{unique_id++}"

  clone: ->
    temp = new @constructor(@tag, @value, @start_mark, @end_mark)
    return temp

class @ScalarNode extends @Node
  id: 'scalar'
  constructor: (@tag, @value, @start_mark, @end_mark, @style) ->
    super

  clone: ->
    temp = new @constructor(@tag, @value, @start_mark, @end_mark, @style)
    return temp

  cloneRemoveIs: ->
    return @clone()

  combine: (node) ->
    if @tag is 'tag:yaml.org,2002:null' and node.tag is 'tag:yaml.org,2002:map'
      @value = new exports.MappingNode 'tag:yaml.org,2002:map', [], node.start_mark, node.end_mark
      return @value.combine node
    else if not (node instanceof exports.ScalarNode)
      throw new exports.ApplicationError 'while applying node', null, 'different YAML structures', @start_mark
    @value = node.value

  remove_question_mark_properties: ->

class @CollectionNode extends @Node
  constructor: (@tag, @value, @start_mark, @end_mark, @flow_style) ->
    super

class @SequenceNode extends @CollectionNode
  id: 'sequence'

  clone: ->
    items = []
    for item in @value
      value = item.clone()
      items.push value

    temp = new @constructor(@tag, items, @start_mark, @end_mark, @flow_style)
    return temp

  cloneRemoveIs: ->
    return @clone()

  combine: (node) ->
    unless node instanceof exports.SequenceNode
      throw new exports.ApplicationError 'while applying node', null, 'different YAML structures', @start_mark

    for property in node.value
      value = property.clone()
      @value.push value

  remove_question_mark_properties: ->
    for item in @value
      item.remove_question_mark_properties()

class @MappingNode extends @CollectionNode
  id: 'mapping'

  clone: ->
    properties = []
    for property in @value
      name  = property[0].clone()
      value = property[1].clone()

      properties.push [name, value]

    temp = new @constructor(@tag, properties, @start_mark, @end_mark, @flow_style)
    return temp

  cloneRemoveIs: ->
    properties = []
    for property in @value
      name  = property[0].cloneRemoveIs()
      value = property[1].cloneRemoveIs()

      unless name.value in ['is']
        properties.push [name, value]

    temp = new @constructor(@tag, properties, @start_mark, @end_mark, @flow_style)
    return temp

  cloneForTrait: ->
    properties = []
    for property in @value
      name  = property[0].clone()
      value = property[1].clone()

      unless name.value in ['usage', 'displayName']
        properties.push [name, value]

    temp = new @constructor(@tag, properties, @start_mark, @end_mark, @flow_style)
    return temp

  cloneForResourceType: ->
    properties = []
    for property in @value
      name  = property[0].cloneRemoveIs()
      value = property[1].cloneRemoveIs()

      unless name.value in ['is', 'type', 'usage', 'displayName']
        properties.push [name, value]

    temp = new @constructor( @tag, properties, @start_mark, @end_mark, @flow_style)
    return temp

  combine: (resourceNode) ->
    # We have a special combination strategy in which if the destination node is null,
    # we convert it to a map
    if resourceNode.tag is 'tag:yaml.org,2002:null'
      resourceNode = new exports.MappingNode 'tag:yaml.org,2002:map', [], resourceNode.start_mark, resourceNode.end_mark

    unless resourceNode instanceof exports.MappingNode
      throw new exports.ApplicationError 'while applying node', null, 'different YAML structures', @start_mark

    for resourceProperty in resourceNode.value
      name = resourceProperty[0].value

      node_has_property = @value.some (someProperty) ->
        return (someProperty[0].value == name) or ((someProperty[0].value + '?') == name) or (someProperty[0].value == (name + '?'))

      if node_has_property
        for ownNodeProperty in @value
          ownNodePropertyName = ownNodeProperty[0].value

          if (ownNodePropertyName == name) or
             ((ownNodePropertyName + '?') == name) or (ownNodePropertyName == (name + '?'))

            if (ownNodeProperty[1].tag is 'tag:yaml.org,2002:null') and (resourceProperty[1].tag is 'tag:yaml.org,2002:map')
              nonNullNode = new exports.MappingNode 'tag:yaml.org,2002:map', [], ownNodeProperty[1].start_mark, ownNodeProperty[1].end_mark
              ownNodeProperty[1] = nonNullNode

            ownNodeProperty[1].combine resourceProperty[1]
            # check if the property should still end in '?', if the destination property was optional,
            unless (ownNodeProperty[0].value.slice(-1) == '?') and
                   (resourceProperty[0].value.slice(-1) == '?')
              # remove the '?' at the end of the property name
              if ownNodeProperty[0].value.slice(-1) == '?'
                ownNodeProperty[0].value = ownNodeProperty[0].value.slice(0, -1)
      else
        @value.push [resourceProperty[0].clone(), resourceProperty[1].clone()]

  remove_question_mark_properties: ->
    @value = @value.filter (property) ->
      return property[0].value.slice(-1) isnt '?'

    for property in @value
      property[1].remove_question_mark_properties()
