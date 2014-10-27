(function() {
  var MarkedYAMLError, unique_id, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MarkedYAMLError = require('./errors').MarkedYAMLError;

  unique_id = 0;

  this.ApplicationError = (function(_super) {
    __extends(ApplicationError, _super);

    function ApplicationError() {
      _ref = ApplicationError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return ApplicationError;

  })(MarkedYAMLError);

  this.Node = (function() {
    function Node(tag, value, start_mark, end_mark) {
      this.tag = tag;
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.unique_id = "node_" + (unique_id++);
    }

    Node.prototype.clone = function() {
      var temp;
      temp = new this.constructor(this.tag, this.value, this.start_mark, this.end_mark);
      return temp;
    };

    return Node;

  })();

  this.ScalarNode = (function(_super) {
    __extends(ScalarNode, _super);

    ScalarNode.prototype.id = 'scalar';

    function ScalarNode(tag, value, start_mark, end_mark, style) {
      this.tag = tag;
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.style = style;
      ScalarNode.__super__.constructor.apply(this, arguments);
    }

    ScalarNode.prototype.clone = function() {
      var temp;
      temp = new this.constructor(this.tag, this.value, this.start_mark, this.end_mark, this.style);
      return temp;
    };

    ScalarNode.prototype.cloneRemoveIs = function() {
      return this.clone();
    };

    ScalarNode.prototype.combine = function(node) {
      if (this.tag === 'tag:yaml.org,2002:null' && node.tag === 'tag:yaml.org,2002:map') {
        this.value = new exports.MappingNode('tag:yaml.org,2002:map', [], node.start_mark, node.end_mark);
        return this.value.combine(node);
      } else if (!(node instanceof exports.ScalarNode)) {
        throw new exports.ApplicationError('while applying node', null, 'different YAML structures', this.start_mark);
      }
      return this.value = node.value;
    };

    ScalarNode.prototype.remove_question_mark_properties = function() {};

    return ScalarNode;

  })(this.Node);

  this.CollectionNode = (function(_super) {
    __extends(CollectionNode, _super);

    function CollectionNode(tag, value, start_mark, end_mark, flow_style) {
      this.tag = tag;
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.flow_style = flow_style;
      CollectionNode.__super__.constructor.apply(this, arguments);
    }

    return CollectionNode;

  })(this.Node);

  this.SequenceNode = (function(_super) {
    __extends(SequenceNode, _super);

    function SequenceNode() {
      _ref1 = SequenceNode.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    SequenceNode.prototype.id = 'sequence';

    SequenceNode.prototype.clone = function() {
      var item, items, temp, value, _i, _len, _ref2;
      items = [];
      _ref2 = this.value;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        item = _ref2[_i];
        value = item.clone();
        items.push(value);
      }
      temp = new this.constructor(this.tag, items, this.start_mark, this.end_mark, this.flow_style);
      return temp;
    };

    SequenceNode.prototype.cloneRemoveIs = function() {
      return this.clone();
    };

    SequenceNode.prototype.combine = function(node) {
      var property, value, _i, _len, _ref2, _results;
      if (!(node instanceof exports.SequenceNode)) {
        throw new exports.ApplicationError('while applying node', null, 'different YAML structures', this.start_mark);
      }
      _ref2 = node.value;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        property = _ref2[_i];
        value = property.clone();
        _results.push(this.value.push(value));
      }
      return _results;
    };

    SequenceNode.prototype.remove_question_mark_properties = function() {
      var item, _i, _len, _ref2, _results;
      _ref2 = this.value;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        item = _ref2[_i];
        _results.push(item.remove_question_mark_properties());
      }
      return _results;
    };

    return SequenceNode;

  })(this.CollectionNode);

  this.MappingNode = (function(_super) {
    __extends(MappingNode, _super);

    function MappingNode() {
      _ref2 = MappingNode.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    MappingNode.prototype.id = 'mapping';

    MappingNode.prototype.clone = function() {
      var name, properties, property, temp, value, _i, _len, _ref3;
      properties = [];
      _ref3 = this.value;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        property = _ref3[_i];
        name = property[0].clone();
        value = property[1].clone();
        properties.push([name, value]);
      }
      temp = new this.constructor(this.tag, properties, this.start_mark, this.end_mark, this.flow_style);
      return temp;
    };

    MappingNode.prototype.cloneRemoveIs = function() {
      var name, properties, property, temp, value, _i, _len, _ref3, _ref4;
      properties = [];
      _ref3 = this.value;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        property = _ref3[_i];
        name = property[0].cloneRemoveIs();
        value = property[1].cloneRemoveIs();
        if ((_ref4 = name.value) !== 'is') {
          properties.push([name, value]);
        }
      }
      temp = new this.constructor(this.tag, properties, this.start_mark, this.end_mark, this.flow_style);
      return temp;
    };

    MappingNode.prototype.cloneForTrait = function() {
      var name, properties, property, temp, value, _i, _len, _ref3, _ref4;
      properties = [];
      _ref3 = this.value;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        property = _ref3[_i];
        name = property[0].clone();
        value = property[1].clone();
        if ((_ref4 = name.value) !== 'usage' && _ref4 !== 'displayName') {
          properties.push([name, value]);
        }
      }
      temp = new this.constructor(this.tag, properties, this.start_mark, this.end_mark, this.flow_style);
      return temp;
    };

    MappingNode.prototype.cloneForResourceType = function() {
      var name, properties, property, temp, value, _i, _len, _ref3, _ref4;
      properties = [];
      _ref3 = this.value;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        property = _ref3[_i];
        name = property[0].cloneRemoveIs();
        value = property[1].cloneRemoveIs();
        if ((_ref4 = name.value) !== 'is' && _ref4 !== 'type' && _ref4 !== 'usage' && _ref4 !== 'displayName') {
          properties.push([name, value]);
        }
      }
      temp = new this.constructor(this.tag, properties, this.start_mark, this.end_mark, this.flow_style);
      return temp;
    };

    MappingNode.prototype.combine = function(resourceNode) {
      var name, node_has_property, nonNullNode, ownNodeProperty, ownNodePropertyName, resourceProperty, _i, _len, _ref3, _results;
      if (resourceNode.tag === 'tag:yaml.org,2002:null') {
        resourceNode = new exports.MappingNode('tag:yaml.org,2002:map', [], resourceNode.start_mark, resourceNode.end_mark);
      }
      if (!(resourceNode instanceof exports.MappingNode)) {
        throw new exports.ApplicationError('while applying node', null, 'different YAML structures', this.start_mark);
      }
      _ref3 = resourceNode.value;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        resourceProperty = _ref3[_i];
        name = resourceProperty[0].value;
        node_has_property = this.value.some(function(someProperty) {
          return (someProperty[0].value === name) || ((someProperty[0].value + '?') === name) || (someProperty[0].value === (name + '?'));
        });
        if (node_has_property) {
          _results.push((function() {
            var _j, _len1, _ref4, _results1;
            _ref4 = this.value;
            _results1 = [];
            for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
              ownNodeProperty = _ref4[_j];
              ownNodePropertyName = ownNodeProperty[0].value;
              if ((ownNodePropertyName === name) || ((ownNodePropertyName + '?') === name) || (ownNodePropertyName === (name + '?'))) {
                if ((ownNodeProperty[1].tag === 'tag:yaml.org,2002:null') && (resourceProperty[1].tag === 'tag:yaml.org,2002:map')) {
                  nonNullNode = new exports.MappingNode('tag:yaml.org,2002:map', [], ownNodeProperty[1].start_mark, ownNodeProperty[1].end_mark);
                  ownNodeProperty[1] = nonNullNode;
                }
                ownNodeProperty[1].combine(resourceProperty[1]);
                if (!((ownNodeProperty[0].value.slice(-1) === '?') && (resourceProperty[0].value.slice(-1) === '?'))) {
                  if (ownNodeProperty[0].value.slice(-1) === '?') {
                    _results1.push(ownNodeProperty[0].value = ownNodeProperty[0].value.slice(0, -1));
                  } else {
                    _results1.push(void 0);
                  }
                } else {
                  _results1.push(void 0);
                }
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          }).call(this));
        } else {
          _results.push(this.value.push([resourceProperty[0].clone(), resourceProperty[1].clone()]));
        }
      }
      return _results;
    };

    MappingNode.prototype.remove_question_mark_properties = function() {
      var property, _i, _len, _ref3, _results;
      this.value = this.value.filter(function(property) {
        return property[0].value.slice(-1) !== '?';
      });
      _ref3 = this.value;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        property = _ref3[_i];
        _results.push(property[1].remove_question_mark_properties());
      }
      return _results;
    };

    return MappingNode;

  })(this.CollectionNode);

}).call(this);
