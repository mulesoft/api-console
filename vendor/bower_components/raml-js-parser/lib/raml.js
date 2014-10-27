(function() {
  var defaultSettings, util, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.errors = require('./errors');

  this.loader = require('./loader');

  util = require('./util');

  this.FileError = (function(_super) {
    __extends(FileError, _super);

    function FileError() {
      _ref = FileError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return FileError;

  })(this.errors.MarkedYAMLError);

  this.FileReader = (function() {
    function FileReader(readFileAsyncOverride) {
      this.q = require('q');
      this.url = require('url');
      if (readFileAsyncOverride) {
        this.readFileAsyncOverride = readFileAsyncOverride;
      }
    }

    /*
    Read file either locally or from the network.
    */


    FileReader.prototype.readFileAsync = function(file) {
      var targerUrl;
      if (this.readFileAsyncOverride) {
        return this.readFileAsyncOverride(file);
      }
      targerUrl = this.url.parse(file);
      if (targerUrl.protocol != null) {
        if (!targerUrl.protocol.match(/^https?/i)) {
          throw new exports.FileError("while reading " + file, null, "unknown protocol " + targerUrl.protocol, this.start_mark);
        } else {
          return this.fetchFileAsync(file);
        }
      } else {
        if (typeof window !== "undefined" && window !== null) {
          return this.fetchFileAsync(file);
        } else {
          return this.fetchLocalFileAsync(file);
        }
      }
    };

    /*
    Read file from the disk.
    */


    FileReader.prototype.fetchLocalFileAsync = function(file) {
      var deferred,
        _this = this;
      deferred = this.q.defer();
      require('fs').readFile(file, function(err, data) {
        if (err) {
          return deferred.reject(new exports.FileError("while reading " + file, null, "cannot read " + file + " (" + err + ")", _this.start_mark));
        } else {
          return deferred.resolve(data.toString());
        }
      });
      return deferred.promise;
    };

    /*
    Read file from the network.
    */


    FileReader.prototype.fetchFileAsync = function(file) {
      var deferred, error, xhr,
        _this = this;
      deferred = this.q.defer();
      if (typeof window !== "undefined" && window !== null) {
        xhr = new XMLHttpRequest();
      } else {
        xhr = new (require('xmlhttprequest').XMLHttpRequest)();
      }
      try {
        xhr.open('GET', file, false);
        xhr.setRequestHeader('Accept', 'application/raml+yaml, */*');
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if ((typeof xhr.status === 'number' && xhr.status === 200) || (typeof xhr.status === 'string' && xhr.status.match(/^200/i))) {
              return deferred.resolve(xhr.responseText);
            } else {
              return deferred.reject(new exports.FileError("while fetching " + file, null, "cannot fetch " + file + " (" + xhr.statusText + ")", _this.start_mark));
            }
          }
        };
        xhr.send(null);
        return deferred.promise;
      } catch (_error) {
        error = _error;
        throw new exports.FileError("while fetching " + file, null, "cannot fetch " + file + " (" + error + "), check that the server is up and that CORS is enabled", this.start_mark);
      }
    };

    return FileReader;

  })();

  /*
  OO version of the parser, static functions will be removed after consumers move on to use the OO version
  OO will offer caching
  */


  this.RamlParser = (function() {
    function RamlParser(settings) {
      this.settings = settings != null ? settings : defaultSettings;
      this.q = require('q');
      this.url = require('url');
      this.nodes = require('./nodes');
      this.loadDefaultSettings(settings);
    }

    RamlParser.prototype.loadDefaultSettings = function(settings) {
      var _this = this;
      return Object.keys(defaultSettings).forEach(function(settingName) {
        if (!(settingName in settings)) {
          return settings[settingName] = defaultSettings[settingName];
        }
      });
    };

    RamlParser.prototype.loadFile = function(file, settings) {
      var error,
        _this = this;
      if (settings == null) {
        settings = this.settings;
      }
      try {
        return settings.reader.readFileAsync(file).then(function(stream) {
          return _this.load(stream, file, settings);
        });
      } catch (_error) {
        error = _error;
        return this.q.fcall(function() {
          throw new exports.FileError("while fetching " + file, null, "cannot fetch " + file + " (" + error + ")", null);
        });
      }
    };

    RamlParser.prototype.composeFile = function(file, settings, parent) {
      var error,
        _this = this;
      if (settings == null) {
        settings = this.settings;
      }
      try {
        return settings.reader.readFileAsync(file).then(function(stream) {
          return _this.compose(stream, file, settings, parent);
        });
      } catch (_error) {
        error = _error;
        return this.q.fcall(function() {
          throw new exports.FileError("while fetching " + file, null, "cannot fetch " + file + " (" + error + ")", null);
        });
      }
    };

    RamlParser.prototype.compose = function(stream, location, settings, parent) {
      if (settings == null) {
        settings = this.settings;
      }
      if (parent == null) {
        parent = {
          src: location
        };
      }
      settings.compose = false;
      return this.parseStream(stream, location, settings, parent);
    };

    RamlParser.prototype.load = function(stream, location, settings) {
      if (settings == null) {
        settings = this.settings;
      }
      settings.compose = true;
      return this.parseStream(stream, location, settings, {
        src: location
      });
    };

    RamlParser.prototype.parseStream = function(stream, location, settings, parent) {
      var loader,
        _this = this;
      if (settings == null) {
        settings = this.settings;
      }
      loader = new exports.loader.Loader(stream, location, settings, parent);
      return this.q.fcall(function() {
        return loader.getYamlRoot();
      }).then(function(partialTree) {
        var files;
        files = loader.getPendingFilesList();
        return _this.getPendingFiles(loader, partialTree, files);
      }).then(function(fullyAssembledTree) {
        loader.composeRamlTree(fullyAssembledTree, settings);
        if (settings.compose) {
          if (fullyAssembledTree != null) {
            return loader.construct_document(fullyAssembledTree);
          } else {
            return null;
          }
        } else {
          return fullyAssembledTree;
        }
      });
    };

    RamlParser.prototype.getPendingFiles = function(loader, node, files) {
      var file, lastVisitedNode, loc, _i, _len,
        _this = this;
      loc = [];
      lastVisitedNode = void 0;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        loc.push(this.getPendingFile(loader, file).then(function(overwritingnode) {
          if (overwritingnode && !lastVisitedNode) {
            return lastVisitedNode = overwritingnode;
          }
        }));
      }
      return this.q.all(loc).then(function() {
        if (lastVisitedNode) {
          return lastVisitedNode;
        } else {
          return node;
        }
      });
    };

    RamlParser.prototype.getPendingFile = function(loader, fileInfo) {
      var error, event, fileUri, key, node,
        _this = this;
      node = fileInfo.parentNode;
      event = fileInfo.event;
      key = fileInfo.parentKey;
      fileUri = fileInfo.targetFileUri;
      if (fileInfo.includingContext) {
        fileUri = this.url.resolve(fileInfo.includingContext, fileInfo.targetFileUri);
      }
      if (loader.parent && this.isInIncludeTagsStack(fileUri, loader)) {
        throw new exports.FileError('while composing scalar out of !include', null, "detected circular !include of " + event.value, event.start_mark);
      }
      try {
        if (fileInfo.type === 'fragment') {
          return this.settings.reader.readFileAsync(fileUri).then(function(result) {
            return _this.compose(result, fileUri, {
              validate: false,
              transform: false,
              compose: true
            }, loader);
          }).then(function(value) {
            return _this.appendNewNodeToParent(node, key, value);
          })["catch"](function(error) {
            return _this.addContextToError(error, event);
          });
        } else {
          return this.settings.reader.readFileAsync(fileUri).then(function(result) {
            var value;
            value = new _this.nodes.ScalarNode('tag:yaml.org,2002:str', result, event.start_mark, event.end_mark, event.style);
            return _this.appendNewNodeToParent(node, key, value);
          })["catch"](function(error) {
            return _this.addContextToError(error, event);
          });
        }
      } catch (_error) {
        error = _error;
        return this.addContextToError(error, event);
      }
    };

    RamlParser.prototype.addContextToError = function(error, event) {
      if (error.constructor.name === "FileError") {
        if (!error.problem_mark) {
          error.problem_mark = event.start_mark;
        }
        throw error;
      } else {
        throw new exports.FileError('while reading file', null, "error: " + error, event.start_mark);
      }
    };

    RamlParser.prototype.isInIncludeTagsStack = function(include, parent) {
      while (parent = parent.parent) {
        if (parent.src === include) {
          return true;
        }
      }
      return false;
    };

    RamlParser.prototype.appendNewNodeToParent = function(node, key, value) {
      if (node) {
        if (util.isSequence(node)) {
          node.value[key] = value;
        } else {
          node.value.push([key, value]);
        }
        return null;
      } else {
        return value;
      }
    };

    return RamlParser;

  })();

  /*
    validate controls whether the stream must be processed as a
  */


  defaultSettings = {
    validate: true,
    transform: true,
    compose: true,
    reader: new exports.FileReader(null)
  };

  /*
  Parse the first RAML document in a stream and produce the corresponding
  Javascript object.
  */


  this.loadFile = function(file, settings) {
    var parser;
    if (settings == null) {
      settings = defaultSettings;
    }
    parser = new exports.RamlParser(settings);
    return parser.loadFile(file, settings);
  };

  /*
  Parse the first RAML document in a file and produce the corresponding
  representation tree.
  */


  this.composeFile = function(file, settings, parent) {
    var parser;
    if (settings == null) {
      settings = defaultSettings;
    }
    if (parent == null) {
      parent = file;
    }
    parser = new exports.RamlParser(settings);
    return parser.composeFile(file, settings, parent);
  };

  /*
  Parse the first RAML document in a stream and produce the corresponding
  representation tree.
  */


  this.compose = function(stream, location, settings, parent) {
    var parser;
    if (settings == null) {
      settings = defaultSettings;
    }
    if (parent == null) {
      parent = location;
    }
    parser = new exports.RamlParser(settings);
    return parser.compose(stream, location, settings, parent);
  };

  /*
  Parse the first RAML document in a stream and produce the corresponding
  Javascript object.
  */


  this.load = function(stream, location, settings) {
    var parser;
    if (settings == null) {
      settings = defaultSettings;
    }
    parser = new exports.RamlParser(settings);
    return parser.load(stream, location, settings, null);
  };

}).call(this);
