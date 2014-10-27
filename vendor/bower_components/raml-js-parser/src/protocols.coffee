url               = require 'url'
{MarkedYAMLError} = require './errors'
nodes             = require './nodes'
util              = require './util'

###
The Protocols class deals with applying protocols to methods according to the spec
###
class @Protocols
  apply_protocols: (node) =>
    if protocols = @apply_protocols_to_root node
      @apply_protocols_to_resources node, protocols

  apply_protocols_to_root: (node) ->
    if @has_property node, 'protocols'
      return @get_property node, 'protocols'

    unless baseUri = @property_value node, 'baseUri'
      return

    parsedBaseUri = url.parse(baseUri)
    protocol      = (parsedBaseUri.protocol or 'http:').slice(0, -1).toUpperCase()
    protocols     = [
      new nodes.ScalarNode('tag:yaml.org,2002:str', 'protocols', node.start_mark, node.end_mark),
      new nodes.SequenceNode('tag:yaml.org,2002:seq', [
          new nodes.ScalarNode('tag:yaml.org,2002:str', protocol, node.start_mark, node.end_mark)
      ], node.start_mark, node.end_mark)
    ]
    node.value.push(protocols)
    return protocols[1]

  apply_protocols_to_resources: (node, protocols) ->
    for resource in @child_resources node
      @apply_protocols_to_resources resource, protocols
      @apply_protocols_to_methods   resource, protocols

  apply_protocols_to_methods: (node, protocols) ->
    for method in @child_methods node[1]
      unless @has_property method[1], 'protocols'
        unless util.isMapping method[1]
          method[1] = new nodes.MappingNode 'tag:yaml.org,2002:map', [], method[1].start_mark, method[1].end_mark

        method[1].value.push [
          new nodes.ScalarNode('tag:yaml.org,2002:str', 'protocols', method[0].start_mark, method[0].end_mark),
          protocols.clone()
        ]