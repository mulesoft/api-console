(function() {
  var MarkedYAMLError, nodes, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MarkedYAMLError = require('./errors').MarkedYAMLError;

  nodes = require('./nodes');

  /*
  The Traits throws these.
  */


  this.JoinError = (function(_super) {
    __extends(JoinError, _super);

    function JoinError() {
      _ref = JoinError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return JoinError;

  })(MarkedYAMLError);

  /*
  The Joiner class groups resources under resource property and groups methods under operations property
  */


  this.Joiner = (function() {
    function Joiner() {}

    Joiner.prototype.join_resources = function(node, call) {
      var resources, resourcesArray, resourcesName, resourcesValue,
        _this = this;
      if (call == null) {
        call = 0;
      }
      resources = [];
      if (node != null ? node.value : void 0) {
        resources = node.value.filter(function(childNode) {
          var _ref1;
          return (_ref1 = childNode[0]) != null ? _ref1.value.match(/^\//) : void 0;
        });
      }
      resourcesArray = [];
      if (resources.length > 0) {
        if (node != null ? node.value : void 0) {
          node.value = node.value.filter(function(childNode) {
            return !childNode[0].value.match(/^\//);
          });
        }
        resourcesName = new nodes.ScalarNode('tag:yaml.org,2002:str', 'resources', resources[0][0].start_mark, resources[resources.length - 1][1].end_mark);
        resources.forEach(function(resource) {
          var relativeUriName, relativeUriValue;
          relativeUriName = new nodes.ScalarNode('tag:yaml.org,2002:str', 'relativeUri', resource[0].start_mark, resource[1].end_mark);
          relativeUriValue = new nodes.ScalarNode('tag:yaml.org,2002:str', resource[0].value, resource[0].start_mark, resource[1].end_mark);
          if (resource[1].tag === "tag:yaml.org,2002:null") {
            resource[1] = new nodes.MappingNode('tag:yaml.org,2002:map', [], resource[0].start_mark, resource[1].end_mark);
          }
          resource[1].value.push([relativeUriName, relativeUriValue]);
          resourcesArray.push(resource[1]);
          _this.join_methods(resource[1]);
          return _this.join_resources(resource[1], ++call);
        });
        resourcesValue = new nodes.SequenceNode('tag:yaml.org,2002:seq', resourcesArray, resources[0][0].start_mark, resources[resources.length - 1][1].end_mark);
        return node.value.push([resourcesName, resourcesValue]);
      }
    };

    Joiner.prototype.join_methods = function(node) {
      var methods, methodsArray, methodsName, methodsValue,
        _this = this;
      methods = [];
      if (node && node.value) {
        methods = node.value.filter(function(childNode) {
          var _ref1;
          return _this.isHttpMethod((_ref1 = childNode[0]) != null ? _ref1.value : void 0);
        });
      }
      methodsArray = [];
      if (methods.length > 0) {
        node.value = node.value.filter(function(childNode) {
          return !_this.isHttpMethod(childNode[0].value);
        });
        methodsName = new nodes.ScalarNode('tag:yaml.org,2002:str', 'methods', methods[0][0].start_mark, methods[methods.length - 1][1].end_mark);
        methods.forEach(function(method) {
          var methodName, methodValue;
          methodName = new nodes.ScalarNode('tag:yaml.org,2002:str', 'method', method[0].start_mark, method[1].end_mark);
          methodValue = new nodes.ScalarNode('tag:yaml.org,2002:str', method[0].value, method[0].start_mark, method[1].end_mark);
          if (method[1].tag === 'tag:yaml.org,2002:null') {
            method[1] = new nodes.MappingNode('tag:yaml.org,2002:map', [], method[1].start_mark, method[1].end_mark);
          }
          method[1].value.push([methodName, methodValue]);
          return methodsArray.push(method[1]);
        });
        methodsValue = new nodes.SequenceNode('tag:yaml.org,2002:seq', methodsArray, methods[0][0].start_mark, methods[methods.length - 1][1].end_mark);
        return node.value.push([methodsName, methodsValue]);
      }
    };

    return Joiner;

  })();

}).call(this);
