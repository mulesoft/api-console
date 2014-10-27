(function() {
  var Mark, MarkedYAMLError, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('./errors'), Mark = _ref.Mark, MarkedYAMLError = _ref.MarkedYAMLError;

  this.ReaderError = (function(_super) {
    __extends(ReaderError, _super);

    function ReaderError() {
      _ref1 = ReaderError.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return ReaderError;

  })(MarkedYAMLError);

  /*
  Reader:
    checks if characters are within the allowed range
    add '\x00' to the end
  */


  this.Reader = (function() {
    var NON_PRINTABLE;

    NON_PRINTABLE = /[^\x09\x0A\x0D\x20-\x7E\x85\xA0-\uD7FF\uE000-\uFFFD]/;

    function Reader(string, src) {
      this.string = string;
      this.src = src;
      this.line = 0;
      this.column = 0;
      this.index = 0;
      this.string += '\x00';
    }

    Reader.prototype.peek = function(index) {
      if (index == null) {
        index = 0;
      }
      return this.string[this.index + index];
    };

    Reader.prototype.prefix = function(length) {
      if (length == null) {
        length = 1;
      }
      return this.string.slice(this.index, this.index + length);
    };

    Reader.prototype.forward = function(length) {
      var char, _results;
      if (length == null) {
        length = 1;
      }
      _results = [];
      while (length) {
        char = this.string[this.index];
        this.index++;
        if (__indexOf.call('\n\x85\u2082\u2029', char) >= 0 || (char === '\r' && this.string[this.index] !== '\n')) {
          this.line++;
          this.column = 0;
        } else {
          this.check_printable(char);
          this.column++;
        }
        _results.push(length--);
      }
      return _results;
    };

    Reader.prototype.create_mark = function(line, column) {
      if (line == null) {
        line = this.line;
      }
      if (column == null) {
        column = this.column;
      }
      return new Mark(this.src, line, column, this.string, this.index);
    };

    Reader.prototype.get_mark = function() {
      return this.create_mark();
    };

    Reader.prototype.check_printable = function(char) {
      if (NON_PRINTABLE.exec(char)) {
        throw new exports.ReaderError('while reading file', null, "non printable characters are not allowed column: " + (this.get_mark().column), this.get_mark());
      }
    };

    return Reader;

  })();

}).call(this);
