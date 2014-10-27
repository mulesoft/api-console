@errors = require './errors'
@loader = require './loader'
util    = require './util'

class @FileError extends @errors.MarkedYAMLError

class @FileReader
  constructor: (readFileAsyncOverride) ->
    @q    = require 'q'
    @url  = require 'url'

    if readFileAsyncOverride
      @readFileAsyncOverride = readFileAsyncOverride

  ###
  Read file either locally or from the network.
  ###
  readFileAsync: (file) ->
    if @readFileAsyncOverride
      return @readFileAsyncOverride(file)

    targerUrl = @url.parse(file)
    if targerUrl.protocol?
      unless targerUrl.protocol.match(/^https?/i)
        throw new exports.FileError "while reading #{file}", null, "unknown protocol #{targerUrl.protocol}", @start_mark
      else
        return @fetchFileAsync file
    else
      if window?
        return @fetchFileAsync file
      else
        return @fetchLocalFileAsync file

  ###
  Read file from the disk.
  ###
  fetchLocalFileAsync: (file) ->
    deferred = @q.defer()
    require('fs').readFile file, (err, data) =>
      if (err)
        deferred.reject(new exports.FileError "while reading #{file}", null, "cannot read #{file} (#{err})", @start_mark)
      else
        deferred.resolve(data.toString())
    return deferred.promise

  ###
  Read file from the network.
  ###
  fetchFileAsync: (file) ->
    deferred = @q.defer()

    if window?
      xhr = new XMLHttpRequest()
    else
      xhr = new (require('xmlhttprequest').XMLHttpRequest)()

    try
      xhr.open 'GET', file, false
      xhr.setRequestHeader 'Accept', 'application/raml+yaml, */*'
      xhr.onreadystatechange = () =>
        if(xhr.readyState == 4)
          if (typeof xhr.status is 'number' and xhr.status == 200) or
          (typeof xhr.status is 'string' and xhr.status.match /^200/i)
            deferred.resolve(xhr.responseText)
          else
            deferred.reject(new exports.FileError "while fetching #{file}", null, "cannot fetch #{file} (#{xhr.statusText})", @start_mark)
      xhr.send null
      return deferred.promise
    catch error
      throw new exports.FileError "while fetching #{file}", null, "cannot fetch #{file} (#{error}), check that the server is up and that CORS is enabled", @start_mark

###
OO version of the parser, static functions will be removed after consumers move on to use the OO version
OO will offer caching
###
class @RamlParser
  constructor: (@settings = defaultSettings) ->
    @q    = require 'q'
    @url  = require 'url'
    @nodes= require './nodes'
    @loadDefaultSettings(settings)

  loadDefaultSettings: (settings) ->
    Object.keys(defaultSettings).forEach (settingName) =>
      unless settingName of settings
        settings[settingName] = defaultSettings[settingName]

  loadFile: (file, settings = @settings) ->
    try
      return settings.reader.readFileAsync(file)
      .then (stream) =>
        @load stream, file, settings
    catch error
      # return a promise that throws the error
      return @q.fcall =>
        throw new exports.FileError "while fetching #{file}", null, "cannot fetch #{file} (#{error})", null

  composeFile: (file, settings = @settings, parent) ->
    try
      return settings.reader.readFileAsync(file)
      .then (stream) =>
        @compose stream, file, settings, parent
    catch error
      # return a promise that throws the error
      return @q.fcall =>
        throw new exports.FileError "while fetching #{file}", null, "cannot fetch #{file} (#{error})", null

  compose: (stream, location, settings = @settings, parent = { src: location}) ->
    settings.compose = false
    @parseStream(stream, location, settings, parent)

  load: (stream, location, settings = @settings) ->
    settings.compose = true
    @parseStream(stream, location, settings,  { src: location})

  parseStream: (stream, location, settings = @settings, parent) ->
    loader = new exports.loader.Loader stream, location, settings, parent

    return @q.fcall =>
      return loader.getYamlRoot()

    .then (partialTree) =>
      files = loader.getPendingFilesList()
      @getPendingFiles(loader, partialTree, files)

    .then (fullyAssembledTree) =>
      loader.composeRamlTree(fullyAssembledTree, settings)

      if settings.compose
        if fullyAssembledTree?
          return loader.construct_document(fullyAssembledTree)
        else
          return null
      else
        return fullyAssembledTree

  getPendingFiles: (loader, node, files) ->
    loc = []
    lastVisitedNode = undefined
    for file in files
      loc.push @getPendingFile(loader, file)
        .then (overwritingnode) =>
          # we should be able to handle parentless children, but only the last one
          if overwritingnode and !lastVisitedNode
            lastVisitedNode = overwritingnode
    return @q.all(loc).then => return if lastVisitedNode then lastVisitedNode else node

  getPendingFile: (loader, fileInfo) ->
    node    = fileInfo.parentNode
    event   = fileInfo.event
    key     = fileInfo.parentKey
    fileUri = fileInfo.targetFileUri

    if fileInfo.includingContext
      fileUri = @url.resolve(fileInfo.includingContext, fileInfo.targetFileUri)

    if loader.parent and @isInIncludeTagsStack(fileUri, loader)
      throw new exports.FileError 'while composing scalar out of !include', null, "detected circular !include of #{event.value}", event.start_mark

    try
      # This handles included files that are expected to be a YAML structure
      if fileInfo.type is 'fragment'
        return @settings.reader.readFileAsync(fileUri)
        .then (result) =>
          return @compose(result, fileUri, { validate: false, transform: false, compose: true }, loader)
        .then (value) =>
          return @appendNewNodeToParent(node, key, value)
        .catch (error) =>
          @addContextToError(error, event)
      # This handles included files that are expected to be scalars
      else
        return @settings.reader.readFileAsync(fileUri)
        .then (result) =>
          value = new @nodes.ScalarNode('tag:yaml.org,2002:str', result, event.start_mark, event.end_mark, event.style)
          return @appendNewNodeToParent(node, key, value)
        .catch (error) =>
          @addContextToError(error, event)
    catch error
      # Why you ask? in-browser q.catch() will not be called
      @addContextToError(error, event)

  addContextToError: (error, event) ->
    if error.constructor.name == "FileError"
      unless error.problem_mark
        error.problem_mark = event.start_mark
      throw error
    else
      throw new exports.FileError 'while reading file', null, "error: #{error}", event.start_mark

  # detect
  isInIncludeTagsStack:  (include, parent) ->
    while parent = parent.parent
      if parent.src is include
        return true
    return false

  appendNewNodeToParent: (node, key, value) ->
    if node
      if util.isSequence(node)
        node.value[key] = value
      else
        node.value.push [key, value]
      return null
    else
      return value

###
  validate controls whether the stream must be processed as a
###
defaultSettings = { validate: true, transform: true, compose: true, reader: new exports.FileReader(null) }

###
Parse the first RAML document in a stream and produce the corresponding
Javascript object.
###
@loadFile = (file, settings = defaultSettings) ->
  parser = new exports.RamlParser(settings)
  parser.loadFile(file, settings)

###
Parse the first RAML document in a file and produce the corresponding
representation tree.
###
@composeFile = (file, settings = defaultSettings, parent = file) ->
  parser = new exports.RamlParser(settings)
  parser.composeFile(file, settings, parent)

###
Parse the first RAML document in a stream and produce the corresponding
representation tree.
###
@compose = (stream, location, settings = defaultSettings, parent = location) ->
  parser = new exports.RamlParser(settings)
  parser.compose(stream, location, settings, parent)

###
Parse the first RAML document in a stream and produce the corresponding
Javascript object.
###
@load = (stream, location, settings = defaultSettings) ->
  parser = new exports.RamlParser(settings)
  parser.load(stream, location, settings, null)
