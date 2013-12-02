(function() {
  'use strict';

  var formatters = {
    'application/json' : function(code) {
      return vkbeautify.json(code);
    },
    'text/xml' : function(code) {
      return vkbeautify.xml(code);
    },
    'default' : function(code) {
      return code;
    }
  };

  function sanitize(options) {
    var code = options.code || '',
        formatter = formatters[options.mode] || formatters.default;

    try {
      options.code = formatter(code);
    } catch(e) {}
  }

  var Controller = function($scope, $element) {
    sanitize($scope);

    this.editor = new CodeMirror($element[0], {
      mode: $scope.mode,
      readOnly: true,
      value: $scope.code,
      lineNumbers: true,
      indentUnit: 4
    });

    this.editor.setSize('100%', '100%');
  };

  Controller.prototype.refresh = function(options) {
    sanitize(options);
    this.editor.setOption('mode', options.mode);
    this.editor.setValue(options.code);

    this.editor.refresh();
  };

  var link = function(scope, element, attrs, editor) {
    var watchCode = function() {
      return scope.visible && scope.code;
    };

    scope.$watch(watchCode, function(visible) {
      if (visible) { editor.refresh(scope); }
    });
  };

  RAML.Directives.codeMirror = function() {
    return {
      link: link,
      restrict: 'A',
      replace: true,
      controller: Controller,
      scope: {
        code: '=codeMirror',
        visible: '=',
        mode: '@?'
      }
    };
  };

  RAML.Directives.codeMirror.Controller = Controller;
})();
