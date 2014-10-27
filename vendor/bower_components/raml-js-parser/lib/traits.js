(function() {
  var MarkedYAMLError, inflection, nodes, util, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MarkedYAMLError = require('./errors').MarkedYAMLError;

  nodes = require('./nodes');

  inflection = require('inflection');

  util = require('./util');

  /*
  The Traits throws these.
  */


  this.TraitError = (function(_super) {
    __extends(TraitError, _super);

    function TraitError() {
      _ref = TraitError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return TraitError;

  })(MarkedYAMLError);

  /*
  */


  this.ParameterError = (function(_super) {
    __extends(ParameterError, _super);

    function ParameterError() {
      _ref1 = ParameterError.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return ParameterError;

  })(MarkedYAMLError);

  /*
  The Traits class deals with applying traits to resources according to the spec
  */


  this.Traits = (function() {
    function Traits() {
      this.declaredTraits = {};
    }

    Traits.prototype.load_traits = function(node) {
      var allTraits,
        _this = this;
      if (this.has_property(node, 'traits')) {
        allTraits = this.property_value(node, 'traits');
        if (allTraits && typeof allTraits === "object") {
          return allTraits.forEach(function(trait_item) {
            if (trait_item && typeof trait_item === "object" && typeof trait_item.value === "object") {
              return trait_item.value.forEach(function(trait) {
                return _this.declaredTraits[trait[0].value] = trait;
              });
            }
          });
        }
      }
    };

    Traits.prototype.has_traits = function(node) {
      if (this.declaredTraits.length === 0 && this.has_property(node, 'traits')) {
        this.load_traits(node);
      }
      return Object.keys(this.declaredTraits).length > 0;
    };

    Traits.prototype.get_trait = function(traitName) {
      if (traitName in this.declaredTraits) {
        return this.declaredTraits[traitName][1];
      }
      return null;
    };

    Traits.prototype.apply_traits = function(node, resourceUri, removeQs) {
      var resources,
        _this = this;
      if (resourceUri == null) {
        resourceUri = "";
      }
      if (removeQs == null) {
        removeQs = true;
      }
      if (!util.isMapping(node)) {
        return;
      }
      if (this.has_traits(node)) {
        resources = this.child_resources(node);
        return resources.forEach(function(resource) {
          return _this.apply_traits_to_resource(resourceUri + resource[0].value, resource[1], removeQs);
        });
      }
    };

    Traits.prototype.apply_traits_to_resource = function(resourceUri, resource, removeQs) {
      var methods, uses,
        _this = this;
      if (!util.isMapping(resource)) {
        return;
      }
      methods = this.child_methods(resource);
      if (this.has_property(resource, 'is')) {
        uses = this.property_value(resource, 'is');
        uses.forEach(function(use) {
          return methods.forEach(function(method) {
            return _this.apply_trait(resourceUri, method, use);
          });
        });
      }
      methods.forEach(function(method) {
        if (_this.has_property(method[1], 'is')) {
          uses = _this.property_value(method[1], 'is');
          return uses.forEach(function(use) {
            return _this.apply_trait(resourceUri, method, use);
          });
        }
      });
      if (removeQs) {
        resource.remove_question_mark_properties();
      }
      return this.apply_traits(resource, resourceUri, removeQs);
    };

    Traits.prototype.apply_trait = function(resourceUri, method, useKey) {
      var plainParameters, temp, trait, traitName;
      traitName = this.key_or_value(useKey);
      if (!(traitName != null ? traitName.trim() : void 0)) {
        throw new exports.TraitError('while applying trait', null, 'trait name must be provided', useKey.start_mark);
      }
      if (!(trait = this.get_trait(traitName))) {
        throw new exports.TraitError('while applying trait', null, "there is no trait named " + traitName, useKey.start_mark);
      }
      plainParameters = this.get_parameters_from_is_key(resourceUri, method[0].value, useKey);
      temp = trait.cloneForTrait();
      this.apply_parameters(temp, plainParameters, useKey);
      this.apply_default_media_type_to_method(temp);
      temp.combine(method[1]);
      return method[1] = temp;
    };

    Traits.prototype.apply_parameters = function(resource, parameters, useKey) {
      var parameterName, usedParameters, _results;
      this._apply_parameters(resource, parameters, useKey, usedParameters = {
        resourcePath: true,
        resourcePathName: true,
        methodName: true
      });
      _results = [];
      for (parameterName in parameters) {
        if (!usedParameters[parameterName]) {
          throw new exports.ParameterError('while applying parameters', null, "unused parameter: " + parameterName, useKey.start_mark);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Traits.prototype._apply_parameters = function(resource, parameters, useKey, usedParameters) {
      var parameterUse,
        _this = this;
      if (!resource) {
        return;
      }
      if (util.isString(resource)) {
        if (parameterUse = resource.value.match(/<<\s*([^\|\s>]+)\s*(\|.*)?\s*>>/g)) {
          parameterUse.forEach(function(parameter) {
            var method, parameterName, value, _ref2, _ref3;
            parameterName = parameter != null ? (_ref2 = parameter.trim()) != null ? _ref2.replace(/[<>]+/g, '').trim() : void 0 : void 0;
            _ref3 = parameterName.split(/\s*\|\s*/), parameterName = _ref3[0], method = _ref3[1];
            if (!(parameterName in parameters)) {
              throw new exports.ParameterError('while applying parameters', null, "value was not provided for parameter: " + parameterName, useKey.start_mark);
            }
            value = parameters[parameterName];
            usedParameters[parameterName] = true;
            if (method) {
              if (method.match(/!\s*singularize/)) {
                value = inflection.singularize(value);
              } else if (method.match(/!\s*pluralize/)) {
                value = inflection.pluralize(value);
              } else {
                throw new exports.ParameterError('while validating parameter', null, 'unknown function applied to parameter', resource.start_mark);
              }
            }
            return resource.value = resource.value.replace(parameter, value);
          });
        }
        return;
      }
      if (util.isSequence(resource)) {
        resource.value.forEach(function(node) {
          return _this._apply_parameters(node, parameters, useKey, usedParameters);
        });
        return;
      }
      if (util.isMapping(resource)) {
        resource.value.forEach(function(property) {
          _this._apply_parameters(property[0], parameters, useKey, usedParameters);
          return _this._apply_parameters(property[1], parameters, useKey, usedParameters);
        });
      }
    };

    Traits.prototype.get_parameters_from_is_key = function(resourceUri, methodName, typeKey) {
      var parameter, parameters, reserved, result, _i, _len, _ref2;
      result = {};
      reserved = {
        methodName: methodName,
        resourcePath: resourceUri.replace(/\/\/*/g, '/'),
        resourcePathName: this.extractResourcePathName(resourceUri)
      };
      if (util.isMapping(typeKey)) {
        parameters = this.value_or_undefined(typeKey);
        if (util.isMapping(parameters[0][1])) {
          _ref2 = parameters[0][1].value;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            parameter = _ref2[_i];
            if (parameter[0].value in reserved) {
              throw new exports.TraitError('while applying parameters', null, "invalid parameter name: " + parameter[0].value + " is reserved", parameter[0].start_mark);
            }
            result[parameter[0].value] = parameter[1].value;
          }
        }
      }
      return util.extend(result, reserved);
    };

    Traits.prototype.extractResourcePathName = function(resourceUri) {
      var pathSegments, segment;
      pathSegments = resourceUri.split(/\//);
      while (segment = pathSegments.pop()) {
        if (!(typeof segment !== "undefined" && segment !== null ? segment.match(/[{}]/) : void 0)) {
          return segment;
        }
      }
      return "";
    };

    return Traits;

  })();

}).call(this);
