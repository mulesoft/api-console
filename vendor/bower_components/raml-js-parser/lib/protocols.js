(function() {
  var MarkedYAMLError, nodes, url, util,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  url = require('url');

  MarkedYAMLError = require('./errors').MarkedYAMLError;

  nodes = require('./nodes');

  util = require('./util');

  /*
  The Protocols class deals with applying protocols to methods according to the spec
  */


  this.Protocols = (function() {
    function Protocols() {
      this.apply_protocols = __bind(this.apply_protocols, this);
    }

    Protocols.prototype.apply_protocols = function(node) {
      var protocols;
      if (protocols = this.apply_protocols_to_root(node)) {
        return this.apply_protocols_to_resources(node, protocols);
      }
    };

    Protocols.prototype.apply_protocols_to_root = function(node) {
      var baseUri, parsedBaseUri, protocol, protocols;
      if (this.has_property(node, 'protocols')) {
        return this.get_property(node, 'protocols');
      }
      if (!(baseUri = this.property_value(node, 'baseUri'))) {
        return;
      }
      parsedBaseUri = url.parse(baseUri);
      protocol = (parsedBaseUri.protocol || 'http:').slice(0, -1).toUpperCase();
      protocols = [new nodes.ScalarNode('tag:yaml.org,2002:str', 'protocols', node.start_mark, node.end_mark), new nodes.SequenceNode('tag:yaml.org,2002:seq', [new nodes.ScalarNode('tag:yaml.org,2002:str', protocol, node.start_mark, node.end_mark)], node.start_mark, node.end_mark)];
      node.value.push(protocols);
      return protocols[1];
    };

    Protocols.prototype.apply_protocols_to_resources = function(node, protocols) {
      var resource, _i, _len, _ref, _results;
      _ref = this.child_resources(node);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        resource = _ref[_i];
        this.apply_protocols_to_resources(resource, protocols);
        _results.push(this.apply_protocols_to_methods(resource, protocols));
      }
      return _results;
    };

    Protocols.prototype.apply_protocols_to_methods = function(node, protocols) {
      var method, _i, _len, _ref, _results;
      _ref = this.child_methods(node[1]);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        if (!this.has_property(method[1], 'protocols')) {
          if (!util.isMapping(method[1])) {
            method[1] = new nodes.MappingNode('tag:yaml.org,2002:map', [], method[1].start_mark, method[1].end_mark);
          }
          _results.push(method[1].value.push([new nodes.ScalarNode('tag:yaml.org,2002:str', 'protocols', method[0].start_mark, method[0].end_mark), protocols.clone()]));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Protocols;

  })();

}).call(this);
