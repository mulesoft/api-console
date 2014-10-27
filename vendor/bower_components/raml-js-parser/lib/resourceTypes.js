(function() {
  var MarkedYAMLError, nodes, util, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  MarkedYAMLError = require('./errors').MarkedYAMLError;

  nodes = require('./nodes');

  util = require('./util');

  /*
  The ResourceTypes throws these.
  */


  this.ResourceTypeError = (function(_super) {
    __extends(ResourceTypeError, _super);

    function ResourceTypeError() {
      _ref = ResourceTypeError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return ResourceTypeError;

  })(MarkedYAMLError);

  /*
  The ResourceTypes class deals with applying ResourceTypes to resources according to the spec
  */


  this.ResourceTypes = (function() {
    function ResourceTypes() {
      this.apply_parameters_to_type = __bind(this.apply_parameters_to_type, this);
      this.apply_type = __bind(this.apply_type, this);
      this.apply_types = __bind(this.apply_types, this);
      this.get_type = __bind(this.get_type, this);
      this.has_types = __bind(this.has_types, this);
      this.load_types = __bind(this.load_types, this);
      this.declaredTypes = {};
    }

    ResourceTypes.prototype.load_types = function(node) {
      var allTypes,
        _this = this;
      this.load_default_media_type(node);
      if (this.has_property(node, 'resourceTypes')) {
        allTypes = this.property_value(node, 'resourceTypes');
        if (allTypes && typeof allTypes === 'object') {
          return allTypes.forEach(function(type_item) {
            if (type_item && typeof type_item === 'object' && typeof type_item.value === 'object') {
              return type_item.value.forEach(function(type) {
                return _this.declaredTypes[type[0].value] = type;
              });
            }
          });
        }
      }
    };

    ResourceTypes.prototype.has_types = function(node) {
      if (Object.keys(this.declaredTypes).length === 0 && this.has_property(node, 'resourceTypes')) {
        this.load_types(node);
      }
      return Object.keys(this.declaredTypes).length > 0;
    };

    ResourceTypes.prototype.get_type = function(typeName) {
      return this.declaredTypes[typeName];
    };

    ResourceTypes.prototype.apply_types = function(node, resourceUri) {
      var resources,
        _this = this;
      if (resourceUri == null) {
        resourceUri = "";
      }
      if (!util.isMapping(node)) {
        return;
      }
      if (this.has_types(node)) {
        resources = this.child_resources(node);
        return resources.forEach(function(resource) {
          var type;
          _this.apply_default_media_type_to_resource(resource[1]);
          if (_this.has_property(resource[1], 'type')) {
            type = _this.get_property(resource[1], 'type');
            _this.apply_type(resourceUri + resource[0].value, resource, type);
          }
          return _this.apply_types(resource[1], resourceUri + resource[0].value);
        });
      } else {
        resources = this.child_resources(node);
        return resources.forEach(function(resource) {
          return _this.apply_default_media_type_to_resource(resource[1]);
        });
      }
    };

    ResourceTypes.prototype.apply_type = function(resourceUri, resource, typeKey) {
      var tempType;
      tempType = this.resolve_inheritance_chain(resourceUri, typeKey);
      tempType.combine(resource[1]);
      resource[1] = tempType;
      return resource[1].remove_question_mark_properties();
    };

    ResourceTypes.prototype.resolve_inheritance_chain = function(resourceUri, typeKey) {
      var baseType, childType, childTypeName, childTypeProperty, compiledTypes, inheritsFrom, parentType, parentTypeName, pathToCircularRef, result, rootType, typesToApply;
      childTypeName = this.key_or_value(typeKey);
      childType = this.apply_parameters_to_type(resourceUri, childTypeName, typeKey);
      typesToApply = [childTypeName];
      compiledTypes = {};
      compiledTypes[childTypeName] = childType;
      this.apply_default_media_type_to_resource(childType);
      this.apply_traits_to_resource(resourceUri, childType, false);
      while (this.has_property(childType, 'type')) {
        typeKey = this.get_property(childType, 'type');
        parentTypeName = this.key_or_value(typeKey);
        if (parentTypeName in compiledTypes) {
          pathToCircularRef = typesToApply.concat(parentTypeName).join(' -> ');
          childTypeProperty = this.get_type(childTypeName)[0];
          throw new exports.ResourceTypeError('while applying resourceTypes', null, "circular reference of \"" + parentTypeName + "\" has been detected: " + pathToCircularRef, childTypeProperty.start_mark);
        }
        parentType = this.apply_parameters_to_type(resourceUri, parentTypeName, typeKey);
        this.apply_default_media_type_to_resource(parentType);
        this.apply_traits_to_resource(resourceUri, parentType, false);
        childTypeName = parentTypeName;
        childType = parentType;
        compiledTypes[childTypeName] = childType;
        typesToApply.push(childTypeName);
      }
      rootType = typesToApply.pop();
      baseType = compiledTypes[rootType].cloneForResourceType();
      result = baseType;
      while (inheritsFrom = typesToApply.pop()) {
        baseType = compiledTypes[inheritsFrom].cloneForResourceType();
        result.combine(baseType);
      }
      return result;
    };

    ResourceTypes.prototype.apply_parameters_to_type = function(resourceUri, typeName, typeKey) {
      var parameters, type;
      if (!(typeName != null ? typeName.trim() : void 0)) {
        throw new exports.ResourceTypeError('while applying resource type', null, 'resource type name must be provided', typeKey.start_mark);
      }
      if (!(type = this.get_type(typeName))) {
        throw new exports.ResourceTypeError('while applying resource type', null, "there is no resource type named " + typeName, typeKey.start_mark);
      }
      type = type[1].clone();
      parameters = this._get_parameters_from_type_key(resourceUri, typeKey);
      this.apply_parameters(type, parameters, typeKey);
      return type;
    };

    ResourceTypes.prototype._get_parameters_from_type_key = function(resourceUri, typeKey) {
      var parameter, parameters, reserved, result, _i, _len, _ref1;
      result = {};
      reserved = {
        resourcePath: resourceUri.replace(/\/\/*/g, '/'),
        resourcePathName: this.extractResourcePathName(resourceUri)
      };
      if (util.isMapping(typeKey)) {
        parameters = this.value_or_undefined(typeKey);
        if (util.isMapping(parameters[0][1])) {
          _ref1 = parameters[0][1].value;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            parameter = _ref1[_i];
            if (parameter[0].value in reserved) {
              throw new exports.ResourceTypeError('while applying parameters', null, "invalid parameter name: " + parameter[0].value + " is reserved", parameter[0].start_mark);
            }
            result[parameter[0].value] = parameter[1].value;
          }
        }
      }
      return util.extend(result, reserved);
    };

    return ResourceTypes;

  })();

}).call(this);
