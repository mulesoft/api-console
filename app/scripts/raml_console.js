'use strict';

(function() {
  var module = angular.module('ramlConsoleApp', ['raml', 'ngSanitize']);

  module.directive('apiResources', RAML.Directives.apiResources);
  module.directive('basicAuth', RAML.Directives.basicAuth);
  module.directive('codeMirror', RAML.Directives.codeMirror);
  module.directive('collapsible', RAML.Directives.collapsible);
  module.directive('collapsibleContent', RAML.Directives.collapsibleContent);
  module.directive('collapsibleToggle', RAML.Directives.collapsibleToggle);
  module.directive('documentation', RAML.Directives.documentation);
  module.directive('markdown', RAML.Directives.markdown);
  module.directive('method', RAML.Directives.method);
  module.directive('namedParameters', RAML.Directives.namedParameters);
  module.directive('namedParametersDocumentation', RAML.Directives.namedParametersDocumentation);
  module.directive('oauth2', RAML.Directives.oauth2);
  module.directive('parameters', RAML.Directives.parameters);
  module.directive('pathBuilder', RAML.Directives.pathBuilder);
  module.directive('ramlConsole', RAML.Directives.ramlConsole);
  module.directive('ramlConsoleInitializer', RAML.Directives.ramlConsoleInitializer);
  module.directive('requests', RAML.Directives.requests);
  module.directive('resourceSummary', RAML.Directives.resourceSummary);
  module.directive('responses', RAML.Directives.responses);
  module.directive('rootDocumentation', RAML.Directives.rootDocumentation);
  module.directive('securitySchemes', RAML.Directives.securitySchemes);
  module.directive('tab', RAML.Directives.tab);
  module.directive('tabset', RAML.Directives.tabset);
  module.directive('tryIt', RAML.Directives.tryIt);
  module.directive('validatedInput', RAML.Directives.validatedInput);

  module.controller('TryItController', RAML.Controllers.tryIt);

  module.filter('yesNo', RAML.Filters.yesNo);
})();
