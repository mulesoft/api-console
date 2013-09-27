var module = angular.module('ramlConsoleApp', ['raml']);
module.directive('ramlConsole', RAML.Directives.ramlConsole);
module.directive('ramlConsoleInitializer', RAML.Directives.ramlConsoleInitializer);
module.directive('parameterTable', RAML.Directives.parameterTable);
module.directive('resourceSummary', RAML.Directives.resourceSummary);

module.controller('TryItController', RAML.Controllers.TryIt);

module.filter('yesNo', RAML.Filters.yesNo);
