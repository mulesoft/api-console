(function () {
  'use strict';

  var generator = window.ramlClientGenerator;

  function downloadClient (language, ast) {
    var zip    = new window.JSZip();
    var output = generator[language](ast);
    var title  = window.slug(output.context.title);

    Object.keys(output.files).forEach(function (key) {
      zip.file(key, output.files[key]);
    });

    var content  = zip.generate({ type: 'blob' });
    var filename = title + '-' + language + '.zip';

    // Download as a zip file with an appropriate language name.
    window.saveAs(content, filename);
  }

  RAML.Directives.ramlClientGenerator = function () {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-client-generator.tpl.html',
      controller: function ($scope) {
        $scope.downloadJavaScriptClient = function () {
          return downloadClient('javascript', $scope.rawRaml);
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlClientGenerator', RAML.Directives.ramlClientGenerator);
})();
