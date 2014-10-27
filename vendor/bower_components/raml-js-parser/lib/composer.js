(function() {
  var MarkedYAMLError, events, nodes, raml, util, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  events = require('./events');

  MarkedYAMLError = require('./errors').MarkedYAMLError;

  nodes = require('./nodes');

  raml = require('./raml');

  util = require('./util');

  this.ComposerError = (function(_super) {
    __extends(ComposerError, _super);

    function ComposerError() {
      _ref = ComposerError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return ComposerError;

  })(MarkedYAMLError);

  this.Composer = (function() {
    function Composer() {
      this.composeRamlTree = __bind(this.composeRamlTree, this);
      this.anchors = {};
      this.filesToRead = [];
    }

    Composer.prototype.check_node = function() {
      if (this.check_event(events.StreamStartEvent)) {
        this.get_event();
      }
      return !this.check_event(events.StreamEndEvent);
    };

    /*
    Get the root node of the next document.
    */


    Composer.prototype.get_node = function() {
      if (!this.check_event(events.StreamEndEvent)) {
        return this.compose_document();
      }
    };

    Composer.prototype.getYamlRoot = function() {
      var document, event;
      this.get_event();
      document = null;
      if (!this.check_event(events.StreamEndEvent)) {
        document = this.compose_document();
      }
      if (!this.check_event(events.StreamEndEvent)) {
        event = this.get_event();
        throw new exports.ComposerError('document scan', document.start_mark, 'expected a single document in the stream but found another document', event.start_mark);
      }
      this.get_event();
      return document;
    };

    Composer.prototype.composeRamlTree = function(node, settings) {
      if (settings.validate || settings.transform) {
        this.load_schemas(node);
        this.load_traits(node);
        this.load_types(node);
        this.load_security_schemes(node);
      }
      if (settings.validate) {
        this.validate_document(node);
      }
      if (settings.transform) {
        this.apply_types(node);
        this.apply_traits(node);
        this.apply_schemas(node);
        this.apply_protocols(node);
        this.join_resources(node);
      }
      return node;
    };

    Composer.prototype.compose_document = function() {
      var node;
      this.get_event();
      node = this.compose_node();
      this.get_event();
      this.anchors = {};
      return node;
    };

    Composer.prototype.getPendingFilesList = function() {
      return this.filesToRead;
    };

    Composer.prototype.compose_node = function(parent, index) {
      var anchor, event, node;
      if (this.check_event(events.AliasEvent)) {
        event = this.get_event();
        anchor = event.anchor;
        if (!(anchor in this.anchors)) {
          throw new exports.ComposerError(null, null, "found undefined alias " + anchor, event.start_mark);
        }
        return this.anchors[anchor].clone();
      }
      event = this.peek_event();
      anchor = event.anchor;
      if (anchor !== null && anchor in this.anchors) {
        throw new exports.ComposerError("found duplicate anchor " + anchor + "; first occurence", this.anchors[anchor].start_mark, 'second occurrence', event.start_mark);
      }
      this.descend_resolver(parent, index);
      if (this.check_event(events.ScalarEvent)) {
        node = this.compose_scalar_node(anchor, parent, index);
      } else if (this.check_event(events.SequenceStartEvent)) {
        node = this.compose_sequence_node(anchor);
      } else if (this.check_event(events.MappingStartEvent)) {
        node = this.compose_mapping_node(anchor);
      }
      this.ascend_resolver();
      return node;
    };

    Composer.prototype.compose_fixed_scalar_node = function(anchor, value) {
      var event, node;
      event = this.get_event();
      node = new nodes.ScalarNode('tag:yaml.org,2002:str', value, event.start_mark, event.end_mark, event.style);
      if (anchor !== null) {
        this.anchors[anchor] = node;
      }
      return node;
    };

    Composer.prototype.compose_scalar_node = function(anchor, parent, key) {
      var event, extension, fileType, node, tag;
      event = this.get_event();
      tag = event.tag;
      node = {};
      if (tag === null || tag === '!') {
        tag = this.resolve(nodes.ScalarNode, event.value, event.implicit);
      }
      if (event.tag === '!include') {
        if (event.value.match(/^\s*$/)) {
          throw new exports.ComposerError('while composing scalar out of !include', null, "file name/URL cannot be null", event.start_mark);
        }
        extension = event.value.split('.').pop();
        if (extension === 'yaml' || extension === 'yml' || extension === 'raml') {
          fileType = 'fragment';
        } else {
          fileType = 'scalar';
        }
        this.filesToRead.push({
          targetUri: event.value,
          type: fileType,
          parentNode: parent,
          parentKey: key,
          event: event,
          includingContext: this.src,
          targetFileUri: event.value
        });
        node = void 0;
      } else {
        node = new nodes.ScalarNode(tag, event.value, event.start_mark, event.end_mark, event.style);
      }
      if (anchor && node) {
        this.anchors[anchor] = node;
      }
      return node;
    };

    Composer.prototype.compose_sequence_node = function(anchor) {
      var end_event, index, node, start_event, tag, value;
      start_event = this.get_event();
      tag = start_event.tag;
      if (tag === null || tag === '!') {
        tag = this.resolve(nodes.SequenceNode, null, start_event.implicit);
      }
      node = new nodes.SequenceNode(tag, [], start_event.start_mark, null, start_event.flow_style);
      index = 0;
      if (anchor) {
        this.anchors[anchor] = node;
      }
      while (!this.check_event(events.SequenceEndEvent)) {
        if (value = this.compose_node(node, index)) {
          node.value[index] = value;
        }
        index++;
      }
      end_event = this.get_event();
      node.end_mark = end_event.end_mark;
      return node;
    };

    Composer.prototype.compose_mapping_node = function(anchor) {
      var end_event, item_key, item_value, node, start_event, tag;
      start_event = this.get_event();
      tag = start_event.tag;
      if (tag === null || tag === '!') {
        tag = this.resolve(nodes.MappingNode, null, start_event.implicit);
      }
      node = new nodes.MappingNode(tag, [], start_event.start_mark, null, start_event.flow_style);
      if (anchor !== null) {
        this.anchors[anchor] = node;
      }
      while (!this.check_event(events.MappingEndEvent)) {
        item_key = this.compose_node(node);
        if (!util.isScalar(item_key)) {
          throw new exports.ComposerError('while composing mapping key', null, "only scalar map keys are allowed in RAML", item_key.start_mark);
        }
        if (item_value = this.compose_node(node, item_key)) {
          node.value.push([item_key, item_value]);
        }
      }
      end_event = this.get_event();
      node.end_mark = end_event.end_mark;
      return node;
    };

    return Composer;

  })();

}).call(this);
