(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  this.extend = function() {
    var destination, k, source, sources, v, _i, _len;
    destination = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      for (k in source) {
        v = source[k];
        destination[k] = v;
      }
    }
    return destination;
  };

  this.is_empty = function(obj) {
    var key;
    if (Array.isArray(obj) || typeof obj === 'string') {
      return obj.length === 0;
    }
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      return false;
    }
    return true;
  };

  this.isNoop = function(node) {
    return node;
  };

  this.isMapping = function(node) {
    return (node != null ? node.tag : void 0) === "tag:yaml.org,2002:map";
  };

  this.isNull = function(node) {
    return (node != null ? node.tag : void 0) === "tag:yaml.org,2002:null";
  };

  this.isSequence = function(node) {
    return (node != null ? node.tag : void 0) === "tag:yaml.org,2002:seq";
  };

  this.isString = function(node) {
    return (node != null ? node.tag : void 0) === "tag:yaml.org,2002:str";
  };

  this.isInteger = function(node) {
    return (node != null ? node.tag : void 0) === "tag:yaml.org,2002:int";
  };

  this.isNullableMapping = function(node) {
    return this.isMapping(node) || this.isNull(node);
  };

  this.isNullableString = function(node) {
    return this.isString(node) || this.isNull(node);
  };

  this.isNullableSequence = function(node) {
    return this.isSequence(node) || this.isNull(node);
  };

  this.isNumber = function(node) {
    return (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:int' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:float';
  };

  this.isScalar = function(node) {
    return (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:null' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:bool' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:int' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:float' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:binary' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:timestamp' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:str';
  };

  this.isCollection = function(node) {
    return (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:omap' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:pairs' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:set' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:seq' || (node != null ? node.tag : void 0) === 'tag:yaml.org,2002:map';
  };

}).call(this);
