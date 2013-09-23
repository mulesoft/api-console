var module = angular.module('ramlConsoleApp', ['raml', 'ui.bootstrap']);
module.directive('ramlConsole', RAML.Directives.ramlConsole);
module.directive('ramlConsoleInitializer', RAML.Directives.ramlConsoleInitializer);
