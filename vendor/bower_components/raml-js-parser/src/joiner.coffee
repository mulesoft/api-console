{MarkedYAMLError} = require './errors'
nodes             = require './nodes'

###
The Traits throws these.
###
class @JoinError extends MarkedYAMLError

###
The Joiner class groups resources under resource property and groups methods under operations property
###
class @Joiner

  join_resources: (node, call = 0) ->
    resources = []
    if node?.value
      resources = node.value.filter (childNode) -> return childNode[0]?.value.match(/^\//)
    resourcesArray = []
    if resources.length > 0
      # Remove resources from root document
      if node?.value
        node.value = node.value.filter( (childNode) -> return !childNode[0].value.match(/^\//) )
      resourcesName = new nodes.ScalarNode 'tag:yaml.org,2002:str', 'resources', resources[0][0].start_mark, resources[ resources.length - 1 ][1].end_mark
      resources.forEach (resource) =>
        relativeUriName = new nodes.ScalarNode 'tag:yaml.org,2002:str', 'relativeUri', resource[0].start_mark, resource[1].end_mark
        relativeUriValue = new nodes.ScalarNode 'tag:yaml.org,2002:str', resource[0].value, resource[0].start_mark, resource[1].end_mark
        # if the resource is null create a map in its place
        if resource[1].tag is "tag:yaml.org,2002:null"
          resource[1] = new nodes.MappingNode 'tag:yaml.org,2002:map', [], resource[0].start_mark, resource[1].end_mark
        resource[1].value.push [ relativeUriName, relativeUriValue ]
        resourcesArray.push resource[1]
        @join_methods resource[1]
        @join_resources resource[1], ++call
      resourcesValue = new nodes.SequenceNode 'tag:yaml.org,2002:seq', resourcesArray, resources[0][0].start_mark, resources[ resources.length - 1 ][1].end_mark
      node.value.push [ resourcesName, resourcesValue ]

  join_methods: (node) ->
    methods = []
    if node and node.value
      methods = node.value.filter (childNode) =>
        return @isHttpMethod childNode[0]?.value
    methodsArray = []
    if methods.length > 0
      node.value = node.value.filter (childNode) =>
        return not @isHttpMethod childNode[0].value
      methodsName = new nodes.ScalarNode 'tag:yaml.org,2002:str', 'methods', methods[0][0].start_mark, methods[ methods.length - 1 ][1].end_mark

      methods.forEach (method) =>
        methodName = new nodes.ScalarNode 'tag:yaml.org,2002:str', 'method', method[0].start_mark, method[1].end_mark
        methodValue = new nodes.ScalarNode 'tag:yaml.org,2002:str', method[0].value, method[0].start_mark, method[1].end_mark
        if method[1].tag == 'tag:yaml.org,2002:null'
          method[1] = new nodes.MappingNode('tag:yaml.org,2002:map', [], method[1].start_mark, method[1].end_mark)
        method[1].value.push [ methodName, methodValue ]
        methodsArray.push method[1]

      methodsValue = new nodes.SequenceNode 'tag:yaml.org,2002:seq', methodsArray, methods[0][0].start_mark, methods[ methods.length - 1 ][1].end_mark
      node.value.push [ methodsName, methodsValue ]
