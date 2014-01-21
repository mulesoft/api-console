'use strict';

(function() {
  var module = angular.module('ramlConsoleApp', ['raml', 'ngSanitize', 'fileInputOverride']);

  module.directive('apiResources', RAML.Directives.apiResources);
  module.directive('basicAuth', RAML.Directives.basicAuth);
  module.directive('bodyContent', RAML.Directives.bodyContent);
  module.directive('codeMirror', RAML.Directives.codeMirror);
  module.directive('collapsible', RAML.Directives.collapsible);
  module.directive('collapsibleContent', RAML.Directives.collapsibleContent);
  module.directive('collapsibleToggle', RAML.Directives.collapsibleToggle);
  module.directive('documentation', RAML.Directives.documentation);
  module.directive('enum', RAML.Directives.enum);
  // module.directive('input', RAML.Directives.input);
  module.directive('markdown', RAML.Directives.markdown);
  module.directive('method', RAML.Directives.method);
  module.directive('namedParameters', RAML.Directives.namedParameters);
  module.directive('namedParametersDocumentation', RAML.Directives.namedParametersDocumentation);
  module.directive('oauth1', RAML.Directives.oauth1);
  module.directive('oauth2', RAML.Directives.oauth2);
  module.directive('parameterFields', RAML.Directives.parameterFields);
  module.directive('parameterizedParameter', RAML.Directives.parameterizedParameter);
  module.directive('parameters', RAML.Directives.parameters);
  module.directive('pathBuilder', RAML.Directives.pathBuilder);
  module.directive('ramlConsole', RAML.Directives.ramlConsole);
  module.directive('ramlConsoleInitializer', RAML.Directives.ramlConsoleInitializer);
  module.directive('requests', RAML.Directives.requests);
  module.directive('repeatable', RAML.Directives.repeatable);
  module.directive('repeatableAdd', RAML.Directives.repeatableAdd);
  module.directive('repeatableRemove', RAML.Directives.repeatableRemove);
  module.directive('resource', RAML.Directives.resource);
  module.directive('responses', RAML.Directives.responses);
  module.directive('rootDocumentation', RAML.Directives.rootDocumentation);
  module.directive('securitySchemes', RAML.Directives.securitySchemes);
  module.directive('tab', RAML.Directives.tab);
  module.directive('tabset', RAML.Directives.tabset);
  module.directive('tryIt', RAML.Directives.tryIt);
  module.directive('validatedInput', RAML.Directives.validatedInput);

  module.controller('TryItController', RAML.Controllers.tryIt);

  module.service('DataStore', RAML.Services.DataStore);
  module.service('ramlParserWrapper', RAML.Services.RAMLParserWrapper);

  module.filter('nameFromParameterizable', RAML.Filters.nameFromParameterizable);
  module.filter('yesNo', RAML.Filters.yesNo);
})();
