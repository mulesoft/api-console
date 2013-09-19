var module = angular.module('ramlConsoleApp', ['raml']);
module.directive('ramlConsole', RAML.Directives.ramlConsole);
module.directive('ramlConsoleInitializer', RAML.Directives.ramlConsoleInitializer);
