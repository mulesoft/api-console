(function() {
  var MarkedYAMLError, jsonlint, nodes, traits, uritemplate, url, util, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  url = require('url');

  uritemplate = require('uritemplate');

  MarkedYAMLError = require('./errors').MarkedYAMLError;

  nodes = require('./nodes');

  traits = require('./traits');

  util = require('./util');

  jsonlint = require('json-lint');

  /*
  The Validator throws these.
  */


  this.ValidationError = (function(_super) {
    __extends(ValidationError, _super);

    function ValidationError() {
      _ref = ValidationError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return ValidationError;

  })(MarkedYAMLError);

  /*
  A collection of multiple validation errors
  */


  this.ValidationErrors = (function(_super) {
    __extends(ValidationErrors, _super);

    function ValidationErrors(validation_errors) {
      this.validation_errors = validation_errors;
    }

    ValidationErrors.prototype.get_validation_errors = function() {
      return this.validation_errors;
    };

    return ValidationErrors;

  })(MarkedYAMLError);

  /*
  The Validator class deals with validating a YAML file according to the spec
  */


  this.Validator = (function() {
    function Validator() {
      this.get_properties = __bind(this.get_properties, this);
      this.get_list_values = __bind(this.get_list_values, this);
      this.validations = [this.validate_root, this.validate_root_properties, this.validate_base_uri_parameters, this.valid_absolute_uris];
    }

    Validator.prototype.validate_document = function(node) {
      var validation, _i, _len, _ref1;
      _ref1 = this.validations;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        validation = _ref1[_i];
        validation.call(this, node);
      }
      return true;
    };

    Validator.prototype.validate_security_schemes = function(schemesProperty) {
      var scheme, scheme_entry, _i, _len, _ref1, _results;
      if (!util.isSequence(schemesProperty)) {
        throw new exports.ValidationError('while validating securitySchemes', null, 'invalid security schemes property, it must be an array', schemesProperty.start_mark);
      }
      _ref1 = schemesProperty.value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        scheme_entry = _ref1[_i];
        if (!util.isMapping(scheme_entry)) {
          throw new exports.ValidationError('while validating securitySchemes', null, 'invalid security scheme property, it must be a map', scheme_entry.start_mark);
        }
        _results.push((function() {
          var _j, _len1, _ref2, _results1;
          _ref2 = scheme_entry.value;
          _results1 = [];
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            scheme = _ref2[_j];
            if (!util.isMapping(scheme[1])) {
              throw new exports.ValidationError('while validating securitySchemes', null, 'invalid security scheme property, it must be a map', scheme[0].start_mark);
            }
            _results1.push(this.validate_security_scheme(scheme[1]));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Validator.prototype.trackRepeatedProperties = function(properties, key, property, section, errorMessage) {
      if (section == null) {
        section = "RAML";
      }
      if (errorMessage == null) {
        errorMessage = "a property with the same name already exists";
      }
      if (key in properties) {
        throw new exports.ValidationError("while validating " + section, null, "" + errorMessage + ": '" + key + "'", property.start_mark);
      }
      return properties[key] = property;
    };

    Validator.prototype.validate_security_scheme = function(scheme) {
      var property, schemeProperties, settings, type, _i, _len, _ref1;
      type = null;
      settings = null;
      schemeProperties = {};
      _ref1 = scheme.value;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        property = _ref1[_i];
        this.trackRepeatedProperties(schemeProperties, property[0].value, property[0], 'while validating security scheme', "property already used in security scheme");
        switch (property[0].value) {
          case "description":
            if (!util.isScalar(property[1])) {
              throw new exports.ValidationError('while validating security scheme', null, 'schemes description must be a string', property[1].start_mark);
            }
            break;
          case "type":
            type = property[1].value;
            if (!(util.isString(property[1]) && type.match(/^(OAuth 1.0|OAuth 2.0|Basic Authentication|Digest Authentication|x-.+)$/))) {
              throw new exports.ValidationError('while validating security scheme', null, 'schemes type must be any of: "OAuth 1.0", "OAuth 2.0", "Basic Authentication", "Digest Authentication", "x-\{.+\}"', property[1].start_mark);
            }
            break;
          case "describedBy":
            this.validate_method(property, true, "security scheme");
            break;
          case "settings":
            settings = property;
            if (!util.isNullableMapping(property[1])) {
              throw new exports.ValidationError('while validating security scheme', null, 'schemes settings must be a map', property[1].start_mark);
            }
            break;
          default:
            throw new exports.ValidationError('while validating security scheme', null, "property: '" + property[0].value + "' is invalid in a security scheme", property[0].start_mark);
        }
      }
      if (!type) {
        throw new exports.ValidationError('while validating security scheme', null, 'schemes type must be any of: "OAuth 1.0", "OAuth 2.0", "Basic Authentication", "Digest Authentication", "x-\{.+\}"', scheme.start_mark);
      } else if (type === "OAuth 2.0") {
        if (!settings) {
          throw new exports.ValidationError('while validating security scheme', null, 'for OAuth 2.0 settings must be a map', scheme.start_mark);
        }
        return this.validate_oauth2_settings(settings);
      } else if (type === "OAuth 1.0") {
        if (!settings) {
          throw new exports.ValidationError('while validating security scheme', null, 'for OAuth 1.0 settings must be a map', scheme.start_mark);
        }
        return this.validate_oauth1_settings(settings);
      }
    };

    Validator.prototype.validate_oauth2_settings = function(settings) {
      var property, propertyName, settingProperties, _i, _j, _len, _len1, _ref1, _ref2, _results;
      settingProperties = {};
      _ref1 = settings[1].value;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        property = _ref1[_i];
        this.trackRepeatedProperties(settingProperties, property[0].value, property[0], 'while validating security scheme', "setting with the same name already exists");
        switch (property[0].value) {
          case "authorizationUri":
            if (!util.isString(property[1])) {
              throw new exports.ValidationError('while validating security scheme', null, 'authorizationUri must be a URL', property[0].start_mark);
            }
            break;
          case "accessTokenUri":
            if (!util.isString(property[1])) {
              throw new exports.ValidationError('while validating security scheme', null, 'accessTokenUri must be a URL', property[0].start_mark);
            }
        }
      }
      _ref2 = ['accessTokenUri', 'authorizationUri'];
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        propertyName = _ref2[_j];
        if (!(propertyName in settingProperties)) {
          throw new exports.ValidationError('while validating security scheme', null, "OAuth 2.0 settings must have " + propertyName + " property", settings[0].start_mark);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Validator.prototype.validate_oauth1_settings = function(settings) {
      var property, propertyName, settingProperties, _i, _j, _len, _len1, _ref1, _ref2, _results;
      settingProperties = {};
      _ref1 = settings[1].value;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        property = _ref1[_i];
        this.trackRepeatedProperties(settingProperties, property[0].value, property[0], 'while validating security scheme', "setting with the same name already exists");
        switch (property[0].value) {
          case "requestTokenUri":
            if (!util.isString(property[1])) {
              throw new exports.ValidationError('while validating security scheme', null, 'requestTokenUri must be a URL', property[0].start_mark);
            }
            break;
          case "authorizationUri":
            if (!util.isString(property[1])) {
              throw new exports.ValidationError('while validating security scheme', null, 'authorizationUri must be a URL', property[0].start_mark);
            }
            break;
          case "tokenCredentialsUri":
            if (!util.isString(property[1])) {
              throw new exports.ValidationError('while validating security scheme', null, 'tokenCredentialsUri must be a URL', property[0].start_mark);
            }
        }
      }
      _ref2 = ['requestTokenUri', 'authorizationUri', 'tokenCredentialsUri'];
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        propertyName = _ref2[_j];
        if (!(propertyName in settingProperties)) {
          throw new exports.ValidationError('while validating security scheme', null, "OAuth 1.0 settings must have " + propertyName + " property", settings[0].start_mark);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Validator.prototype.validate_root_schemas = function(schemas) {
      var schema, schemaList, schemaName, _results;
      if (!util.isSequence(schemas)) {
        throw new exports.ValidationError('while validating schemas', null, 'schemas property must be an array', schemas.start_mark);
      }
      schemaList = this.get_all_schemas();
      _results = [];
      for (schemaName in schemaList) {
        schema = schemaList[schemaName];
        if (!(schema[1].tag && util.isString(schema[1]))) {
          throw new exports.ValidationError('while validating schemas', null, 'schema ' + schemaName + ' must be a string', schema[0].start_mark);
        }
        _results.push(this.validateSchema(schema[1]));
      }
      return _results;
    };

    Validator.prototype.validate_root = function(node) {
      if (!(node || util.isNull(node))) {
        throw new exports.ValidationError('while validating root', null, 'empty document', node != null ? node.start_mark : void 0);
      }
      if (!util.isMapping(node)) {
        throw new exports.ValidationError('while validating root', null, 'document must be a map', node.start_mark);
      }
    };

    Validator.prototype.validate_base_uri_parameters = function() {
      if (!this.baseUriParameters) {
        return;
      }
      if (!this.baseUri) {
        throw new exports.ValidationError('while validating uri parameters', null, 'uri parameters defined when there is no baseUri', this.baseUriParameters.start_mark);
      }
      if (!util.isNullableMapping(this.baseUriParameters)) {
        throw new exports.ValidationError('while validating uri parameters', null, 'base uri parameters must be a map', this.baseUriParameters.start_mark);
      }
      return this.validate_uri_parameters(this.baseUri, this.baseUriParameters, false, false, ["version"]);
    };

    Validator.prototype.validate_uri_parameters = function(uri, uriProperty, allowParameterKeys, skipParameterUseCheck, reservedNames) {
      var err, expressions, parameterName, template, uriParameter, uriParameters, _i, _len, _ref1, _ref2, _results;
      if (reservedNames == null) {
        reservedNames = [];
      }
      try {
        template = uritemplate.parse(uri);
      } catch (_error) {
        err = _error;
        throw new exports.ValidationError('while validating uri parameters', null, err != null ? (_ref1 = err.options) != null ? _ref1.message : void 0 : void 0, uriProperty.start_mark);
      }
      expressions = template.expressions.filter(function(expr) {
        return "templateText" in expr;
      }).map(function(expression) {
        return expression.templateText;
      });
      uriParameters = {};
      if (typeof uriProperty.value === "object") {
        _ref2 = uriProperty.value;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          uriParameter = _ref2[_i];
          parameterName = this.canonicalizePropertyName(uriParameter[0].value, allowParameterKeys);
          this.trackRepeatedProperties(uriParameters, parameterName, uriProperty, 'while validating URI parameters', "URI parameter with the same name already exists");
          if (__indexOf.call(reservedNames, parameterName) >= 0) {
            throw new exports.ValidationError('while validating baseUri', null, uriParameter[0].value + ' parameter not allowed here', uriParameter[0].start_mark);
          }
          if (!(util.isNullableMapping(uriParameter[1], allowParameterKeys) || util.isNullableSequence(uriParameter[1], allowParameterKeys))) {
            throw new exports.ValidationError('while validating baseUri', null, 'URI parameter must be a map', uriParameter[0].start_mark);
          }
          if (!util.isNull(uriParameter[1])) {
            this.valid_common_parameter_properties(uriParameter[1], allowParameterKeys);
          }
          if (!(skipParameterUseCheck || this.isParameterKey(uriParameter) || __indexOf.call(expressions, parameterName) >= 0)) {
            throw new exports.ValidationError('while validating baseUri', null, uriParameter[0].value + ' uri parameter unused', uriParameter[0].start_mark);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Validator.prototype.validate_types = function(typeProperty) {
      var type, type_entry, types, _i, _len, _results;
      types = typeProperty.value;
      if (!util.isSequence(typeProperty)) {
        throw new exports.ValidationError('while validating resource types', null, 'invalid resourceTypes definition, it must be an array', typeProperty.start_mark);
      }
      _results = [];
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type_entry = types[_i];
        if (!util.isMapping(type_entry)) {
          throw new exports.ValidationError('while validating resource types', null, 'invalid resourceType definition, it must be a map', type_entry.start_mark);
        }
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = type_entry.value;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            type = _ref1[_j];
            if (this.isParameterKey(type)) {
              throw new exports.ValidationError('while validating resource types', null, 'parameter key cannot be used as a resource type name', type[0].start_mark);
            }
            if (!util.isMapping(type[1])) {
              throw new exports.ValidationError('while validating resource types', null, 'invalid resourceType definition, it must be a map', type[1].start_mark);
            }
            _results1.push(this.validate_resource(type, true, 'resource type'));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Validator.prototype.validate_traits = function(traitProperty) {
      var trait, trait_entry, _i, _len, _results;
      traits = traitProperty.value;
      if (!Array.isArray(traits)) {
        throw new exports.ValidationError('while validating traits', null, 'invalid traits definition, it must be an array', traitProperty.start_mark);
      }
      _results = [];
      for (_i = 0, _len = traits.length; _i < _len; _i++) {
        trait_entry = traits[_i];
        if (!Array.isArray(trait_entry.value)) {
          throw new exports.ValidationError('while validating traits', null, 'invalid traits definition, it must be an array', traitProperty.start_mark);
        }
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = trait_entry.value;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            trait = _ref1[_j];
            if (this.isParameterKey(trait)) {
              throw new exports.ValidationError('while validating traits', null, 'parameter key cannot be used as a trait name', trait[0].start_mark);
            }
            if (!util.isMapping(trait[1])) {
              throw new exports.ValidationError('while validating traits', null, 'invalid trait definition, it must be a map', trait[1].start_mark);
            }
            _results1.push(this.valid_traits_properties(trait));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Validator.prototype.valid_traits_properties = function(node) {
      var invalid;
      if (!node[1].value) {
        return;
      }
      if (!util.isMapping(node[1])) {
        return;
      }
      invalid = node[1].value.filter(function(childNode) {
        return childNode[0].value === "is" || childNode[0].value === "type";
      });
      if (invalid.length > 0) {
        throw new exports.ValidationError('while validating trait properties', null, "property: '" + invalid[0][0].value + "' is invalid in a trait", invalid[0][0].start_mark);
      }
      return this.validate_method(node, true, 'trait');
    };

    Validator.prototype.canonicalizePropertyName = function(propertyName, mustRemoveQuestionMark) {
      if (mustRemoveQuestionMark && propertyName.slice(-1) === '?') {
        return propertyName.slice(0, -1);
      }
      return propertyName;
    };

    Validator.prototype.valid_common_parameter_properties = function(node, allowParameterKeys) {
      var parameter, _i, _len, _ref1, _results;
      if (!node.value) {
        return;
      }
      if (util.isSequence(node)) {
        if (node.value.length === 0) {
          throw new exports.ValidationError('while validating parameter properties', null, 'named parameter needs at least one type', node.start_mark);
        }
        if (!(node.value.length > 1)) {
          throw new exports.ValidationError('while validating parameter properties', null, 'single type for variably typed parameter', node.start_mark);
        }
        _ref1 = node.value;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          parameter = _ref1[_i];
          _results.push(this.validate_named_parameter(parameter, allowParameterKeys));
        }
        return _results;
      } else {
        return this.validate_named_parameter(node, allowParameterKeys);
      }
    };

    Validator.prototype.validate_named_parameter = function(node, allowParameterKeys) {
      var booleanValues, canonicalPropertyName, childNode, enumValues, parameterProperties, parameterType, propertyName, propertyValue, unusableProperty, valid, validTypes, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _results;
      parameterProperties = {};
      parameterType = "string";
      _ref1 = node.value;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        childNode = _ref1[_i];
        propertyName = childNode[0].value;
        propertyValue = childNode[1].value;
        this.trackRepeatedProperties(parameterProperties, this.canonicalizePropertyName(childNode[0].value, true), childNode[0], 'while validating parameter properties', "parameter property already used");
        booleanValues = ["true", "false"];
        if (allowParameterKeys) {
          if (this.isParameterKey(childNode) || this.isParameterValue(childNode)) {
            continue;
          }
        }
        canonicalPropertyName = this.canonicalizePropertyName(propertyName, allowParameterKeys);
        valid = true;
        switch (propertyName) {
          case "displayName":
            if (!util.isScalar(childNode[1])) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of displayName must be a scalar', childNode[1].start_mark);
            }
            break;
          case "pattern":
            if (!util.isScalar(childNode[1])) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of pattern must be a scalar', childNode[1].start_mark);
            }
            break;
          case "default":
            if (!util.isScalar(childNode[1])) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of default must be a scalar', childNode[1].start_mark);
            }
            break;
          case "description":
            if (!util.isScalar(childNode[1])) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of description must be a scalar', childNode[1].start_mark);
            }
            break;
          case "example":
            if (!util.isScalar(childNode[1])) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of example must be a scalar', childNode[1].start_mark);
            }
            break;
          case "minLength":
            if (isNaN(propertyValue)) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of minLength must be a number', childNode[1].start_mark);
            }
            break;
          case "maxLength":
            if (isNaN(propertyValue)) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of maxLength must be a number', childNode[1].start_mark);
            }
            break;
          case "minimum":
            if (isNaN(propertyValue)) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of minimum must be a number', childNode[1].start_mark);
            }
            break;
          case "maximum":
            if (isNaN(propertyValue)) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of maximum must be a number', childNode[1].start_mark);
            }
            break;
          case "type":
            parameterType = propertyValue;
            validTypes = ['string', 'number', 'integer', 'date', 'boolean', 'file'];
            if (__indexOf.call(validTypes, propertyValue) < 0) {
              throw new exports.ValidationError('while validating parameter properties', null, 'type can be either of: string, number, integer, file, date or boolean ', childNode[1].start_mark);
            }
            break;
          case "required":
            if (__indexOf.call(booleanValues, propertyValue) < 0) {
              throw new exports.ValidationError('while validating parameter properties', null, 'required can be any either true or false', childNode[1].start_mark);
            }
            break;
          case "repeat":
            if (__indexOf.call(booleanValues, propertyValue) < 0) {
              throw new exports.ValidationError('while validating parameter properties', null, 'repeat can be any either true or false', childNode[1].start_mark);
            }
            break;
          default:
            valid = false;
        }
        switch (canonicalPropertyName) {
          case "enum":
            if (!util.isNullableSequence(childNode[1])) {
              throw new exports.ValidationError('while validating parameter properties', null, 'the value of enum must be an array', childNode[1].start_mark);
            }
            if (!childNode[1].value.length) {
              throw new exports.ValidationError('while validating parameter properties', null, 'enum is empty', childNode[1].start_mark);
            }
            enumValues = this.get_list_values(childNode[1].value);
            if (this.hasDuplicates(enumValues)) {
              throw new exports.ValidationError('while validating parameter properties', null, 'enum contains duplicated values', childNode[1].start_mark);
            }
            break;
          default:
            if (!valid) {
              throw new exports.ValidationError('while validating parameter properties', null, "unknown property " + propertyName, childNode[0].start_mark);
            }
        }
      }
      if (parameterType !== "string") {
        _ref2 = ['enum', 'pattern', 'minLength', 'maxLength'];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          unusableProperty = _ref2[_j];
          if (unusableProperty in parameterProperties) {
            throw new exports.ValidationError('while validating parameter properties', null, "property " + unusableProperty + " can only be used if type is 'string'", parameterProperties[unusableProperty].start_mark);
          }
        }
      }
      if (!(parameterType === "number" || parameterType === "integer")) {
        _ref3 = ['minimum', 'maximum'];
        _results = [];
        for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
          unusableProperty = _ref3[_k];
          if (unusableProperty in parameterProperties) {
            throw new exports.ValidationError('while validating parameter properties', null, "property " + unusableProperty + " can only be used if type is 'number' or 'integer'", parameterProperties[unusableProperty].start_mark);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Validator.prototype.get_list_values = function(node) {
      var _this = this;
      return node.map(function(item) {
        return item.value;
      });
    };

    Validator.prototype.validate_root_properties = function(node) {
      var checkVersion, property, rootProperties, _i, _len, _ref1;
      checkVersion = false;
      rootProperties = {};
      if (node != null ? node.value : void 0) {
        _ref1 = node.value;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          property = _ref1[_i];
          if (property[0].value.match(/^\//)) {
            this.trackRepeatedProperties(rootProperties, this.canonicalizePropertyName(property[0].value, true), property[0], 'while validating root properties', "resource already declared");
          } else {
            this.trackRepeatedProperties(rootProperties, property[0].value, property[0], 'while validating root properties', 'root property already used');
          }
          switch (property[0].value) {
            case 'title':
              if (!util.isScalar(property[1])) {
                throw new exports.ValidationError('while validating root properties', null, 'title must be a string', property[0].start_mark);
              }
              break;
            case 'baseUri':
              if (!util.isScalar(property[1])) {
                throw new exports.ValidationError('while validating root properties', null, 'baseUri must be a string', property[0].start_mark);
              }
              this.baseUri = property[1].value;
              checkVersion = this.validate_base_uri(property[1]);
              break;
            case 'securitySchemes':
              this.validate_security_schemes(property[1]);
              break;
            case 'schemas':
              this.validate_root_schemas(property[1]);
              break;
            case 'version':
              if (!util.isScalar(property[1])) {
                throw new exports.ValidationError('while validating root properties', null, 'version must be a string', property[0].start_mark);
              }
              if (!util.isNull(property[1])) {
                property[1].tag = 'tag:yaml.org,2002:str';
              }
              break;
            case 'traits':
              this.validate_traits(property[1]);
              break;
            case 'documentation':
              if (!util.isSequence(property[1])) {
                throw new exports.ValidationError('while validating root properties', null, 'documentation must be an array', property[0].start_mark);
              }
              this.validate_documentation(property[1]);
              break;
            case 'mediaType':
              if (!util.isString(property[1])) {
                throw new exports.ValidationError('while validating root properties', null, 'mediaType must be a scalar', property[0].start_mark);
              }
              break;
            case 'baseUriParameters':
              this.baseUriParameters = property[1];
              util.isNoop(property[1]);
              break;
            case 'resourceTypes':
              this.validate_types(property[1]);
              break;
            case 'securedBy':
              this.validate_secured_by(property);
              break;
            case 'protocols':
              this.validate_protocols_property(property);
              break;
            default:
              if (property[0].value.match(/^\//)) {
                this.validate_resource(property);
              } else {
                throw new exports.ValidationError('while validating root properties', null, "unknown property " + property[0].value, property[0].start_mark);
              }
          }
        }
      }
      if (!('title' in rootProperties)) {
        throw new exports.ValidationError('while validating root properties', null, 'missing title', node.start_mark);
      }
      if (checkVersion && !('version' in rootProperties)) {
        throw new exports.ValidationError('while validating version', null, 'missing version', node.start_mark);
      }
    };

    Validator.prototype.validate_documentation = function(documentation_property) {
      var docSection, _i, _len, _ref1, _results;
      if (!documentation_property.value.length) {
        throw new exports.ValidationError('while validating documentation section', null, 'there must be at least one document in the documentation section', documentation_property.start_mark);
      }
      _ref1 = documentation_property.value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        docSection = _ref1[_i];
        _results.push(this.validate_doc_section(docSection));
      }
      return _results;
    };

    Validator.prototype.validate_doc_section = function(docSection) {
      var docProperties, property, _i, _len, _ref1;
      if (!util.isMapping(docSection)) {
        throw new exports.ValidationError('while validating documentation section', null, 'each documentation section must be a map', docSection.start_mark);
      }
      docProperties = {};
      _ref1 = docSection.value;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        property = _ref1[_i];
        this.trackRepeatedProperties(docProperties, property[0].value, property[0], 'while validating documentation section', "property already used");
        switch (property[0].value) {
          case "title":
            if (!(util.isScalar(property[1]) && !util.isNull(property[1]))) {
              throw new exports.ValidationError('while validating documentation section', null, 'title must be a string', property[0].start_mark);
            }
            break;
          case "content":
            if (!(util.isScalar(property[1]) && !util.isNull(property[1]))) {
              throw new exports.ValidationError('while validating documentation section', null, 'content must be a string', property[0].start_mark);
            }
            break;
          default:
            throw new exports.ValidationError('while validating root properties', null, 'unknown property ' + property[0].value, property[0].start_mark);
        }
      }
      if (!("content" in docProperties)) {
        throw new exports.ValidationError('while validating documentation section', null, 'a documentation entry must have content property', docSection.start_mark);
      }
      if (!("title" in docProperties)) {
        throw new exports.ValidationError('while validating documentation section', null, 'a documentation entry must have title property', docSection.start_mark);
      }
    };

    Validator.prototype.child_resources = function(node) {
      if (node && util.isMapping(node)) {
        return node.value.filter(function(childNode) {
          return childNode[0].value.match(/^\//);
        });
      }
      return [];
    };

    Validator.prototype.validate_resource = function(resource, allowParameterKeys, context) {
      var canonicalKey, err, key, property, resourceProperties, template, valid, _i, _len, _ref1, _ref2, _results;
      if (allowParameterKeys == null) {
        allowParameterKeys = false;
      }
      if (context == null) {
        context = "resource";
      }
      if (!(resource[1] && util.isNullableMapping(resource[1]))) {
        throw new exports.ValidationError('while validating resources', null, 'resource is not a map', resource[1].start_mark);
      }
      if (resource[0].value) {
        try {
          template = uritemplate.parse(resource[0].value);
        } catch (_error) {
          err = _error;
          throw new exports.ValidationError('while validating resource', null, "Resource name is invalid: " + (err != null ? (_ref1 = err.options) != null ? _ref1.message : void 0 : void 0), resource[0].start_mark);
        }
      }
      if (util.isNull(resource[1])) {
        return;
      }
      if (resource[1].value) {
        resourceProperties = {};
        _ref2 = resource[1].value;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          property = _ref2[_i];
          if (property[0].value.match(/^\//)) {
            this.trackRepeatedProperties(resourceProperties, this.canonicalizePropertyName(property[0].value, true), property[0], 'while validating resource', "resource already declared");
          } else if (this.isHttpMethod(property[0].value, allowParameterKeys)) {
            this.trackRepeatedProperties(resourceProperties, this.canonicalizePropertyName(property[0].value, true), property[0], 'while validating resource', "method already declared");
          } else {
            this.trackRepeatedProperties(resourceProperties, this.canonicalizePropertyName(property[0].value, true), property[0], 'while validating resource', "property already used");
          }
          if (!this.validate_common_properties(property, allowParameterKeys)) {
            if (property[0].value.match(/^\//)) {
              if (allowParameterKeys) {
                throw new exports.ValidationError('while validating trait properties', null, 'resource type cannot define child resources', property[0].start_mark);
              }
              _results.push(this.validate_resource(property, allowParameterKeys));
            } else if (this.isHttpMethod(property[0].value, allowParameterKeys)) {
              _results.push(this.validate_method(property, allowParameterKeys, 'method'));
            } else {
              key = property[0].value;
              canonicalKey = this.canonicalizePropertyName(key, allowParameterKeys);
              valid = true;
              switch (canonicalKey) {
                case "uriParameters":
                  if (!util.isNullableMapping(property[1])) {
                    throw new exports.ValidationError('while validating uri parameters', null, 'uri parameters must be a map', property[0].start_mark);
                  }
                  this.validate_uri_parameters(resource[0].value, property[1], allowParameterKeys, allowParameterKeys);
                  break;
                case "baseUriParameters":
                  if (!this.baseUri) {
                    throw new exports.ValidationError('while validating uri parameters', null, 'base uri parameters defined when there is no baseUri', property[0].start_mark);
                  }
                  if (!util.isNullableMapping(property[1])) {
                    throw new exports.ValidationError('while validating uri parameters', null, 'base uri parameters must be a map', property[0].start_mark);
                  }
                  this.validate_uri_parameters(this.baseUri, property[1], allowParameterKeys);
                  break;
                default:
                  valid = false;
              }
              switch (key) {
                case "type":
                  _results.push(this.validate_type_property(property, allowParameterKeys));
                  break;
                case "usage":
                  if (!allowParameterKeys) {
                    throw new exports.ValidationError('while validating resources', null, "property: '" + property[0].value + "' is invalid in a resource", property[0].start_mark);
                  } else {
                    _results.push(void 0);
                  }
                  break;
                case "securedBy":
                  _results.push(this.validate_secured_by(property));
                  break;
                default:
                  if (!valid) {
                    throw new exports.ValidationError('while validating resources', null, "property: '" + property[0].value + ("' is invalid in a " + context), property[0].start_mark);
                  } else {
                    _results.push(void 0);
                  }
              }
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Validator.prototype.validate_secured_by = function(property) {
      var secScheme, secSchemes, securitySchemeName, _i, _len, _ref1, _results;
      if (!util.isSequence(property[1])) {
        throw new exports.ValidationError('while validating securityScheme', null, "property 'securedBy' must be an array", property[0].start_mark);
      }
      secSchemes = this.get_list_values(property[1].value);
      if (this.hasDuplicates(secSchemes)) {
        throw new exports.ValidationError('while validating securityScheme consumption', null, 'securitySchemes can only be referenced once in a securedBy property', property[0].start_mark);
      }
      _ref1 = property[1].value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        secScheme = _ref1[_i];
        if (util.isSequence(secScheme)) {
          throw new exports.ValidationError('while validating securityScheme consumption', null, 'securityScheme reference cannot be an array', secScheme.start_mark);
        }
        if (!util.isNull(secScheme)) {
          securitySchemeName = this.key_or_value(secScheme);
          if (!this.get_security_scheme(securitySchemeName)) {
            throw new exports.ValidationError('while validating securityScheme consumption', null, 'there is no securityScheme named ' + securitySchemeName, secScheme.start_mark);
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Validator.prototype.validate_protocols_property = function(property) {
      var protocol, _i, _len, _ref1, _ref2, _results;
      if (!util.isSequence(property[1])) {
        throw new exports.ValidationError('while validating protocols', null, 'property must be an array', property[0].start_mark);
      }
      _ref1 = property[1].value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        protocol = _ref1[_i];
        if (!util.isString(protocol)) {
          throw new exports.ValidationError('while validating protocols', null, 'value must be a string', protocol.start_mark);
        }
        if ((_ref2 = protocol.value) !== 'HTTP' && _ref2 !== 'HTTPS') {
          throw new exports.ValidationError('while validating protocols', null, 'only HTTP and HTTPS values are allowed', protocol.start_mark);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Validator.prototype.validate_type_property = function(property) {
      var parameter, typeName, _i, _len, _ref1, _results;
      if (!(util.isMapping(property[1]) || util.isString(property[1]))) {
        throw new exports.ValidationError('while validating resource types', null, "property 'type' must be a string or a map", property[0].start_mark);
      }
      if (util.isMapping(property[1])) {
        if (property[1].value.length > 1) {
          throw new exports.ValidationError('while validating resource types', null, 'a resource or resourceType can inherit from a single resourceType', property[0].start_mark);
        }
      }
      typeName = this.key_or_value(property[1]);
      if (!(typeName != null ? typeName.trim() : void 0)) {
        throw new exports.ValidationError('while validating resource type consumption', null, 'resource type name must be provided', property[1].start_mark);
      }
      if (!(this.isParameterKeyValue(typeName) || this.get_type(typeName))) {
        throw new exports.ValidationError('while validating resource type consumption', null, "there is no resource type named " + typeName, property[1].start_mark);
      }
      if (util.isMapping(property[1])) {
        _ref1 = property[1].value;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          parameter = _ref1[_i];
          if (!(util.isNull(parameter[1]) || util.isMapping(parameter[1]))) {
            throw new exports.ValidationError('while validating resource consumption', null, 'resource type parameters must be in a map', parameter[1].start_mark);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Validator.prototype.validate_method = function(method, allowParameterKeys, context) {
      var canonicalKey, key, methodProperties, property, valid, _i, _len, _ref1, _results;
      if (context == null) {
        context = 'method';
      }
      if (util.isNull(method[1])) {
        return;
      }
      if (!util.isMapping(method[1])) {
        throw new exports.ValidationError('while validating methods', null, "method must be a map", method[0].start_mark);
      }
      methodProperties = {};
      _ref1 = method[1].value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        property = _ref1[_i];
        this.trackRepeatedProperties(methodProperties, this.canonicalizePropertyName(property[0].value, true), property[0], 'while validating method', "property already used");
        if (this.validate_common_properties(property, allowParameterKeys, context)) {
          continue;
        }
        key = property[0].value;
        canonicalKey = this.canonicalizePropertyName(key, allowParameterKeys);
        valid = true;
        switch (canonicalKey) {
          case 'headers':
            this.validate_headers(property, allowParameterKeys);
            break;
          case 'queryParameters':
            this.validate_query_params(property, allowParameterKeys);
            break;
          case 'body':
            this.validate_body(property, allowParameterKeys, null, false);
            break;
          case 'responses':
            this.validate_responses(property, allowParameterKeys);
            break;
          case 'baseUriParameters':
            if (!this.baseUri) {
              throw new exports.ValidationError('while validating uri parameters', null, 'base uri parameters defined when there is no baseUri', property[0].start_mark);
            }
            if (!util.isNullableMapping(property[1])) {
              throw new exports.ValidationError('while validating uri parameters', null, 'base uri parameters must be a map', property[0].start_mark);
            }
            this.validate_uri_parameters(this.baseUri, property[1], allowParameterKeys);
            break;
          case 'protocols':
            this.validate_protocols_property(property);
            break;
          default:
            valid = false;
        }
        switch (key) {
          case 'securedBy':
            _results.push(this.validate_secured_by(property));
            break;
          case 'usage':
            if (!(allowParameterKeys && context === 'trait')) {
              throw new exports.ValidationError('while validating resources', null, "property: 'usage' is invalid in a " + context, property[0].start_mark);
            } else {
              _results.push(void 0);
            }
            break;
          default:
            if (!valid) {
              throw new exports.ValidationError('while validating resources', null, "property: '" + property[0].value + "' is invalid in a " + context, property[0].start_mark);
            } else {
              _results.push(void 0);
            }
        }
      }
      return _results;
    };

    Validator.prototype.validate_responses = function(responses, allowParameterKeys) {
      var response, responseValues, _i, _len, _ref1, _results;
      if (util.isNull(responses[1])) {
        return;
      }
      if (!util.isMapping(responses[1])) {
        throw new exports.ValidationError('while validating responses', null, "property: 'responses' must be a map", responses[0].start_mark);
      }
      responseValues = {};
      _ref1 = responses[1].value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        response = _ref1[_i];
        if (!util.isNullableMapping(response[1])) {
          throw new exports.ValidationError('while validating responses', null, 'each response must be a map', response[1].start_mark);
        }
        this.trackRepeatedProperties(responseValues, this.canonicalizePropertyName(response[0].value, true), response[0], 'while validating responses', "response code already used");
        _results.push(this.validate_response(response, allowParameterKeys));
      }
      return _results;
    };

    Validator.prototype.validate_query_params = function(property, allowParameterKeys) {
      var param, queryParameters, _i, _len, _ref1, _results;
      if (util.isNull(property[1])) {
        return;
      }
      if (!util.isMapping(property[1])) {
        throw new exports.ValidationError('while validating query parameters', null, "property: 'queryParameters' must be a map", property[0].start_mark);
      }
      queryParameters = {};
      _ref1 = property[1].value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        param = _ref1[_i];
        if (!(util.isNullableMapping(param[1]) || util.isNullableSequence(param[1]))) {
          throw new exports.ValidationError('while validating query parameters', null, "each query parameter must be a map", param[1].start_mark);
        }
        this.trackRepeatedProperties(queryParameters, this.canonicalizePropertyName(param[0].value, true), param[0], 'while validating query parameter', "parameter name already used");
        _results.push(this.valid_common_parameter_properties(param[1], allowParameterKeys));
      }
      return _results;
    };

    Validator.prototype.validate_form_params = function(property, allowParameterKeys) {
      var formParameters, param, _i, _len, _ref1, _results;
      if (util.isNull(property[1])) {
        return;
      }
      if (!util.isMapping(property[1])) {
        throw new exports.ValidationError('while validating query parameters', null, "property: 'formParameters' must be a map", property[0].start_mark);
      }
      formParameters = {};
      _ref1 = property[1].value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        param = _ref1[_i];
        if (!(util.isNullableMapping(param[1]) || util.isNullableSequence(param[1]))) {
          throw new exports.ValidationError('while validating query parameters', null, 'each form parameter must be a map', param[1].start_mark);
        }
        this.trackRepeatedProperties(formParameters, this.canonicalizePropertyName(param[0].value, true), param[0], 'while validating form parameter', "parameter name already used");
        _results.push(this.valid_common_parameter_properties(param[1], allowParameterKeys));
      }
      return _results;
    };

    Validator.prototype.validate_headers = function(property, allowParameterKeys) {
      var headerNames, param, _i, _len, _ref1, _results;
      if (util.isNull(property[1])) {
        return;
      }
      if (!util.isMapping(property[1])) {
        throw new exports.ValidationError('while validating headers', null, "property: 'headers' must be a map", property[0].start_mark);
      }
      headerNames = {};
      _ref1 = property[1].value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        param = _ref1[_i];
        if (!(util.isNullableMapping(param[1]) || util.isNullableSequence(param[1]))) {
          throw new exports.ValidationError('while validating query parameters', null, "each header must be a map", param[1].start_mark);
        }
        this.trackRepeatedProperties(headerNames, this.canonicalizePropertyName(param[0].value, true), param[0], 'while validating headers', "header name already used");
        _results.push(this.valid_common_parameter_properties(param[1], allowParameterKeys));
      }
      return _results;
    };

    Validator.prototype.validate_response = function(response, allowParameterKeys) {
      var canonicalKey, property, responseCode, responseProperties, valid, _i, _j, _len, _len1, _ref1, _ref2, _results;
      if (util.isSequence(response[0])) {
        if (!response[0].value.length) {
          throw new exports.ValidationError('while validating responses', null, 'there must be at least one response code', response[0].start_mark);
        }
        _ref1 = response[0].value;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          responseCode = _ref1[_i];
          if (!(this.isParameterKey(responseCode) || util.isInteger(responseCode) || !isNaN(this.canonicalizePropertyName(responseCode, allowParameterKeys)))) {
            throw new exports.ValidationError('while validating responses', null, "each response key must be an integer", responseCode.start_mark);
          }
        }
      } else if (!(this.isParameterKey(response) || util.isInteger(response[0]) || !isNaN(this.canonicalizePropertyName(response[0].value, allowParameterKeys)))) {
        throw new exports.ValidationError('while validating responses', null, "each response key must be an integer", response[0].start_mark);
      }
      if (!util.isNullableMapping(response[1])) {
        throw new exports.ValidationError('while validating responses', null, "each response property must be a map", response[0].start_mark);
      }
      if (util.isMapping(response[1])) {
        responseProperties = {};
        _ref2 = response[1].value;
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          property = _ref2[_j];
          canonicalKey = this.canonicalizePropertyName(property[0].value, allowParameterKeys);
          this.trackRepeatedProperties(responseProperties, canonicalKey, property[0], 'while validating responses', "property already used");
          valid = true;
          if (!this.isParameterKey(property)) {
            switch (property[0].value) {
              case "description":
                if (!util.isScalar(property[1])) {
                  throw new exports.ValidationError('while validating responses', null, 'property description must be a string', response[0].start_mark);
                }
                break;
              default:
                valid = false;
            }
            switch (canonicalKey) {
              case "body":
                _results.push(this.validate_body(property, allowParameterKeys, null, true));
                break;
              case "headers":
                if (!util.isNullableMapping(property[1])) {
                  throw new exports.ValidationError('while validating resources', null, "property 'headers' must be a map", property[0].start_mark);
                }
                _results.push(this.validate_headers(property));
                break;
              default:
                if (!valid) {
                  throw new exports.ValidationError('while validating response', null, "property: '" + property[0].value + "' is invalid in a response", property[0].start_mark);
                } else {
                  _results.push(void 0);
                }
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Validator.prototype.isHttpMethod = function(value, allowParameterKeys) {
      var _ref1;
      if (allowParameterKeys == null) {
        allowParameterKeys = false;
      }
      if (value) {
        value = this.canonicalizePropertyName(value, allowParameterKeys);
        return (_ref1 = value.toLowerCase()) === 'options' || _ref1 === 'get' || _ref1 === 'head' || _ref1 === 'post' || _ref1 === 'put' || _ref1 === 'delete' || _ref1 === 'trace' || _ref1 === 'connect' || _ref1 === 'patch';
      }
      return false;
    };

    Validator.prototype.isParameterValue = function(property) {
      return this.isParameterKey(property, false);
    };

    Validator.prototype.isParameterKey = function(property, checkKey) {
      var offset;
      if (checkKey == null) {
        checkKey = true;
      }
      offset = checkKey ? 0 : 1;
      if (!(checkKey || util.isScalar(property[1]))) {
        return false;
      }
      if (this.isParameterKeyValue(property[offset].value)) {
        return true;
      } else if (property[offset].value.match(/<<\s*([^\|\s>]+)\s*\|.*\s*>>/g)) {
        throw new exports.ValidationError('while validating parameter', null, "unknown function applied to property name", property[0].start_mark);
      }
      return false;
    };

    Validator.prototype.isParameterKeyValue = function(value) {
      if (value.match(/<<\s*([^\|\s>]+)\s*>>/g) || value.match(/<<\s*([^\|\s>]+)\s*(\|\s*\!\s*(singularize|pluralize))?\s*>>/g)) {
        return true;
      }
      return false;
    };

    Validator.prototype.validate_body = function(property, allowParameterKeys, bodyMode, isResponseBody) {
      var bodyProperties, bodyProperty, canonicalProperty, implicitMode, key, start_mark, valid, _i, _len, _ref1;
      if (bodyMode == null) {
        bodyMode = null;
      }
      if (util.isNull(property[1])) {
        return;
      }
      if (!util.isMapping(property[1])) {
        throw new exports.ValidationError('while validating body', null, "property: body specification must be a map", property[0].start_mark);
      }
      implicitMode = ["implicit", "forcedImplicit"];
      bodyProperties = {};
      _ref1 = property[1].value;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        bodyProperty = _ref1[_i];
        this.trackRepeatedProperties(bodyProperties, this.canonicalizePropertyName(bodyProperty[0].value, true), bodyProperty[0], 'while validating body', "property already used");
        if (this.isParameterKey(bodyProperty)) {
          if (!allowParameterKeys) {
            throw new exports.ValidationError('while validating body', null, "property '" + bodyProperty[0].value + "' is invalid in a resource", bodyProperty[0].start_mark);
          }
        } else if (bodyProperty[0].value.match(/^[^\/]+\/[^\/]+$/)) {
          if (bodyMode && bodyMode !== "explicit") {
            throw new exports.ValidationError('while validating body', null, "not compatible with implicit default Media Type", bodyProperty[0].start_mark);
          }
          bodyMode = "explicit";
          this.validate_body(bodyProperty, allowParameterKeys, "forcedImplicit", isResponseBody);
        } else {
          key = bodyProperty[0].value;
          canonicalProperty = this.canonicalizePropertyName(key, allowParameterKeys);
          valid = true;
          switch (canonicalProperty) {
            case "formParameters":
              if (bodyMode && __indexOf.call(implicitMode, bodyMode) < 0) {
                throw new exports.ValidationError('while validating body', null, "not compatible with explicit Media Type", bodyProperty[0].start_mark);
              }
              if (bodyMode == null) {
                bodyMode = "implicit";
              }
              this.validate_form_params(bodyProperty, allowParameterKeys);
              break;
            default:
              valid = false;
          }
          switch (key) {
            case "example":
              if (bodyMode && __indexOf.call(implicitMode, bodyMode) < 0) {
                throw new exports.ValidationError('while validating body', null, "not compatible with explicit Media Type", bodyProperty[0].start_mark);
              }
              if (bodyMode == null) {
                bodyMode = "implicit";
              }
              if (!util.isScalar(bodyProperty[1])) {
                throw new exports.ValidationError('while validating body', null, "example must be a string", bodyProperty[0].start_mark);
              }
              break;
            case "schema":
              if (bodyMode && __indexOf.call(implicitMode, bodyMode) < 0) {
                throw new exports.ValidationError('while validating body', null, "not compatible with explicit Media Type", bodyProperty[0].start_mark);
              }
              if (bodyMode == null) {
                bodyMode = "implicit";
              }
              if (!util.isScalar(bodyProperty[1])) {
                throw new exports.ValidationError('while validating body', null, "schema must be a string", bodyProperty[0].start_mark);
              }
              this.validateSchema(bodyProperty[1]);
              break;
            default:
              if (!valid) {
                throw new exports.ValidationError('while validating body', null, "property: '" + bodyProperty[0].value + "' is invalid in a body", bodyProperty[0].start_mark);
              }
          }
        }
      }
      if ("formParameters" in bodyProperties) {
        start_mark = bodyProperties.formParameters.start_mark;
        if (isResponseBody) {
          throw new exports.ValidationError('while validating body', null, "formParameters cannot be used to describe response bodies", start_mark);
        }
        if ("schema" in bodyProperties || "example" in bodyProperties) {
          throw new exports.ValidationError('while validating body', null, "formParameters cannot be used together with the example or schema properties", start_mark);
        }
      }
      if (bodyMode === "implicit") {
        if (!this.get_media_type()) {
          throw new exports.ValidationError('while validating body', null, "body tries to use default Media Type, but mediaType is null", property[0].start_mark);
        }
      }
    };

    Validator.prototype.validateSchema = function(property) {
      var error, lint, mark, schema;
      if (this.isXmlSchema(property.value)) {
        return void 0;
      } else if (this.isJsonSchema(property.value)) {
        lint = jsonlint(property.value);
        if (lint.error) {
          mark = this.create_mark(property.start_mark.line + lint.line, 0);
          if (property.end_mark.line === mark.line && property.end_mark.column === 0) {
            mark.line--;
          }
          throw new exports.ValidationError('while validating body', null, "schema is not valid JSON error: '" + lint.error + "'", mark);
        }
        try {
          return schema = JSON.parse(property.value);
        } catch (_error) {
          error = _error;
          throw new exports.ValidationError('while validating body', null, "schema is not valid JSON error: '" + error + "'", property.start_mark);
        }
      }
    };

    Validator.prototype.isJsonSchema = function(string) {
      return string != null ? string.match(/^\s*\{/) : void 0;
    };

    Validator.prototype.isXmlSchema = function(string) {
      return string != null ? string.match(/^\s*(<\?xml[^>]+>)?[\s\n]*<xs:schema/) : void 0;
    };

    Validator.prototype.validate_common_properties = function(property, allowParameterKeys, context) {
      var use, _i, _len, _ref1;
      if (this.isParameterKey(property)) {
        if (!allowParameterKeys) {
          throw new exports.ValidationError('while validating resources', null, "property '" + property[0].value + "' is invalid in a resource", property[0].start_mark);
        }
        return true;
      } else {
        switch (property[0].value) {
          case "displayName":
            if (context === 'method') {
              return false;
            }
            if (!util.isScalar(property[1])) {
              throw new exports.ValidationError('while validating resources', null, "property 'displayName' must be a string", property[0].start_mark);
            }
            return true;
          case "description":
            if (!util.isScalar(property[1])) {
              throw new exports.ValidationError('while validating resources', null, "property 'description' must be a string", property[0].start_mark);
            }
            return true;
          case "is":
            if (!util.isSequence(property[1])) {
              throw new exports.ValidationError('while validating resources', null, "property 'is' must be an array", property[0].start_mark);
            }
            _ref1 = property[1].value;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              use = _ref1[_i];
              this.validate_trait_use(use);
            }
            return true;
        }
      }
      return false;
    };

    Validator.prototype.validate_trait_use = function(node) {
      var parameter, traitName, traitValue, _i, _len, _ref1, _results;
      if (!(util.isScalar(node) || util.isMapping(node))) {
        throw new exports.ValidationError('while validating trait consumption', null, 'trait must be a string or a map', node.start_mark);
      }
      traitName = this.key_or_value(node);
      if (!(traitName != null ? traitName.trim() : void 0)) {
        throw new exports.ValidationError('while validating trait consumption', null, 'trait name must be provided', node.start_mark);
      }
      if (!(this.isParameterKeyValue(traitName) || this.get_trait(traitName))) {
        throw new exports.ValidationError('while validating trait consumption', null, "there is no trait named " + traitName, node.start_mark);
      }
      if (util.isScalar(node)) {
        return;
      }
      traitValue = node.value[0][1];
      if (!(util.isNull(traitValue) || util.isMapping(traitValue))) {
        throw new exports.ValidationError('while validating trait consumption', null, 'trait must be a map', traitValue.start_mark);
      }
      if (util.isNull(traitValue)) {
        return;
      }
      _ref1 = traitValue.value;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        parameter = _ref1[_i];
        if (!util.isScalar(parameter[1])) {
          throw new exports.ValidationError('while validating trait consumption', null, 'parameter value must be a scalar', parameter[1].start_mark);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Validator.prototype.child_methods = function(node) {
      var _this = this;
      if (!(node && util.isMapping(node))) {
        return [];
      }
      return node.value.filter(function(childNode) {
        return _this.isHttpMethod(childNode[0].value);
      });
    };

    Validator.prototype.has_property = function(node, property) {
      if (node && util.isMapping(node)) {
        return node.value.some(function(childNode) {
          return childNode[0].value && typeof childNode[0].value !== "object" && childNode[0].value === property;
        });
      }
      return false;
    };

    Validator.prototype.property_value = function(node, property) {
      var filteredNodes;
      filteredNodes = node.value.filter(function(childNode) {
        return typeof childNode[0].value !== "object" && childNode[0].value === property;
      });
      if (filteredNodes.length) {
        return filteredNodes[0][1].value;
      }
    };

    Validator.prototype.get_property = function(node, property) {
      var filteredNodes,
        _this = this;
      if (node && util.isMapping(node)) {
        filteredNodes = node.value.filter(function(childNode) {
          return util.isString(childNode[0]) && childNode[0].value === property;
        });
        if (filteredNodes.length > 0) {
          if (filteredNodes[0].length > 0) {
            return filteredNodes[0][1];
          }
        }
      }
      return [];
    };

    Validator.prototype.get_properties = function(node, property) {
      var prop, properties, _i, _len, _ref1;
      properties = [];
      if (node && util.isMapping(node)) {
        _ref1 = node.value;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          prop = _ref1[_i];
          if (util.isString(prop[0]) && prop[0].value === property) {
            properties.push(prop);
          } else {
            properties = properties.concat(this.get_properties(prop[1], property));
          }
        }
      }
      return properties;
    };

    Validator.prototype.valid_absolute_uris = function(node) {
      var repeatedUri, uris;
      uris = this.get_absolute_uris(node);
      if (repeatedUri = this.hasDuplicatesUris(uris)) {
        throw new exports.ValidationError('while validating trait consumption', null, "two resources share same URI " + repeatedUri.uri, repeatedUri.mark);
      }
    };

    Validator.prototype.get_absolute_uris = function(node, parentPath) {
      var childResource, child_resources, response, uri, _i, _len;
      response = [];
      if (!util.isNullableMapping(node)) {
        throw new exports.ValidationError('while validating resources', null, 'resource is not a map', node.start_mark);
      }
      child_resources = this.child_resources(node);
      for (_i = 0, _len = child_resources.length; _i < _len; _i++) {
        childResource = child_resources[_i];
        if (parentPath != null) {
          uri = parentPath + childResource[0].value;
        } else {
          uri = childResource[0].value;
        }
        response.push({
          uri: uri,
          mark: childResource[0].start_mark
        });
        response = response.concat(this.get_absolute_uris(childResource[1], uri));
      }
      return response;
    };

    Validator.prototype.key_or_value = function(node) {
      var possibleKeyName, _ref1, _ref2, _ref3;
      if (node instanceof nodes.ScalarNode) {
        return node.value;
      }
      if (node instanceof nodes.MappingNode) {
        possibleKeyName = node != null ? (_ref1 = node.value) != null ? (_ref2 = _ref1[0]) != null ? (_ref3 = _ref2[0]) != null ? _ref3.value : void 0 : void 0 : void 0 : void 0;
        if (possibleKeyName) {
          return possibleKeyName;
        }
      }
      return null;
    };

    Validator.prototype.value_or_undefined = function(node) {
      if (node instanceof nodes.MappingNode) {
        return node.value;
      }
      return void 0;
    };

    Validator.prototype.validate_base_uri = function(baseUriNode) {
      var baseUri, err, expressions, protocol, template, _ref1, _ref2;
      baseUri = (_ref1 = baseUriNode.value) != null ? _ref1.trim() : void 0;
      if (!baseUri) {
        throw new exports.ValidationError('while validating baseUri', null, 'baseUri must have a value', baseUriNode.start_mark);
      }
      protocol = ((url.parse(baseUri)).protocol || 'http:').slice(0, -1).toUpperCase();
      if (protocol !== 'HTTP' && protocol !== 'HTTPS') {
        throw new exports.ValidationError('while validating baseUri', null, 'baseUri protocol must be either HTTP or HTTPS', baseUriNode.start_mark);
      }
      try {
        template = uritemplate.parse(baseUri);
      } catch (_error) {
        err = _error;
        throw new exports.ValidationError('while validating baseUri', null, err != null ? (_ref2 = err.options) != null ? _ref2.message : void 0 : void 0, baseUriNode.start_mark);
      }
      expressions = template.expressions.filter(function(expr) {
        return 'templateText' in expr;
      }).map(function(expression) {
        return expression.templateText;
      });
      if (__indexOf.call(expressions, 'version') >= 0) {
        return true;
      }
    };

    Validator.prototype.get_validation_errors = function() {
      return this.validation_errors;
    };

    Validator.prototype.is_valid = function() {
      return this.validation_errors.length === 0;
    };

    Validator.prototype.hasDuplicatesUris = function(array) {
      var item, output, _i, _len;
      output = {};
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        if (item.uri in output) {
          return item;
        }
        output[item.uri] = item;
      }
      return false;
    };

    Validator.prototype.hasDuplicates = function(array) {
      var item, output, _i, _len;
      output = {};
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        if (item in output) {
          return true;
        }
        output[item] = true;
      }
      return false;
    };

    return Validator;

  })();

}).call(this);
