(function() {
  var MarkedYAMLError, nodes, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  MarkedYAMLError = require('./errors').MarkedYAMLError;

  nodes = require('./nodes');

  /*
  The Schemas throws these.
  */


  this.SchemaError = (function(_super) {
    __extends(SchemaError, _super);

    function SchemaError() {
      _ref = SchemaError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return SchemaError;

  })(MarkedYAMLError);

  /*
    The Schemas class deals with applying schemas to resources according to the spec
  */


  this.Schemas = (function() {
    function Schemas() {
      this.get_schemas_used = __bind(this.get_schemas_used, this);
      this.apply_schemas = __bind(this.apply_schemas, this);
      this.get_all_schemas = __bind(this.get_all_schemas, this);
      this.has_schemas = __bind(this.has_schemas, this);
      this.load_schemas = __bind(this.load_schemas, this);
      this.declaredSchemas = {};
    }

    Schemas.prototype.load_schemas = function(node) {
      var allSchemas,
        _this = this;
      if (this.has_property(node, "schemas")) {
        allSchemas = this.property_value(node, 'schemas');
        if (allSchemas && typeof allSchemas === "object") {
          return allSchemas.forEach(function(schema_entry) {
            if (schema_entry && typeof schema_entry === "object" && typeof schema_entry.value === "object") {
              return schema_entry.value.forEach(function(schema) {
                return _this.declaredSchemas[schema[0].value] = schema;
              });
            }
          });
        }
      }
    };

    Schemas.prototype.has_schemas = function(node) {
      if (this.declaredSchemas.length === 0 && this.has_property(node, "schemas")) {
        this.load_schemas(node);
      }
      return Object.keys(this.declaredSchemas).length > 0;
    };

    Schemas.prototype.get_all_schemas = function() {
      return this.declaredSchemas;
    };

    Schemas.prototype.apply_schemas = function(node) {
      var resources, schemas,
        _this = this;
      resources = this.child_resources(node);
      schemas = this.get_schemas_used(resources);
      return schemas.forEach(function(schema) {
        if (schema[1].value in _this.declaredSchemas) {
          return schema[1].value = _this.declaredSchemas[schema[1].value][1].value;
        }
      });
    };

    Schemas.prototype.get_schemas_used = function(resources) {
      var schemas,
        _this = this;
      schemas = [];
      resources.forEach(function(resource) {
        var properties;
        properties = _this.get_properties(resource[1], "schema");
        return schemas = schemas.concat(properties);
      });
      return schemas;
    };

    return Schemas;

  })();

}).call(this);
