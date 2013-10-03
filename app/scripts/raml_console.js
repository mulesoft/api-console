var module = angular.module('ramlConsoleApp', ['raml', 'ngSanitize']);

module.directive('codeMirror', RAML.Directives.codeMirror);
module.directive('documentation', RAML.Directives.documentation);
module.directive('markdown', RAML.Directives.markdown);
module.directive('method', RAML.Directives.method);
module.directive('parameterTable', RAML.Directives.parameterTable);
module.directive('pathBuilder', RAML.Directives.pathBuilder);
module.directive('ramlConsole', RAML.Directives.ramlConsole);
module.directive('ramlConsoleInitializer', RAML.Directives.ramlConsoleInitializer);
module.directive('resourceSummary', RAML.Directives.resourceSummary);
module.directive('tab', RAML.Directives.tab);
module.directive('tabset', RAML.Directives.tabset);
module.directive('tryIt', RAML.Directives.tryIt);

module.controller('TryItController', RAML.Controllers.tryIt);

module.filter('yesNo', RAML.Filters.yesNo);
