var module = angular.module('ramlConsoleApp', ['raml']);

module.directive('method', RAML.Directives.method);
module.directive('parameterTable', RAML.Directives.parameterTable);
module.directive('pathBuilder', RAML.Directives.pathBuilder);
module.directive('ramlConsole', RAML.Directives.ramlConsole);
module.directive('ramlConsoleInitializer', RAML.Directives.ramlConsoleInitializer);
module.directive('resourceSummary', RAML.Directives.resourceSummary);
module.directive('tryIt', RAML.Directives.tryIt);

module.controller('TryItController', RAML.Controllers.TryIt);

module.filter('yesNo', RAML.Filters.yesNo);
