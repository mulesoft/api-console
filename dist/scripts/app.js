
angular.module('ramlConsoleApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/api_resources.tmpl.html',
    "<div id=\"raml-console-api-reference\" role=\"resources\">\n" +
    "  <div collapsible role=\"resource-group\" class=\"resource-group\" ng-repeat=\"resourceGroup in api.resourceGroups\">\n" +
    "    <h1 collapsible-toggle class='path'>\n" +
    "      {{resourceGroup[0].pathSegments[0].toString()}}\n" +
    "      <i ng-class=\"{'icon-caret-right': collapsed, 'icon-caret-down': !collapsed}\"></i>\n" +
    "    </h1>\n" +
    "\n" +
    "    <div collapsible-content>\n" +
    "      <resource ng-repeat=\"resource in resourceGroup\"></resource>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/basic_auth.tmpl.html',
    "<fieldset class=\"labelled-inline\" role=\"basic\">\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"username\">Username:</label>\n" +
    "    <input type=\"text\" name=\"username\" ng-model='credentials.username'/>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"password\">Password:</label>\n" +
    "    <input type=\"password\" name=\"password\" ng-model='credentials.password'/>\n" +
    "  </div>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/documentation.tmpl.html',
    "<section class='documentation' role='documentation'>\n" +
    "  <ul role=\"traits\" class=\"modifiers\">\n" +
    "    <li class=\"trait\" ng-repeat=\"trait in documentation.traits()\">\n" +
    "      {{trait|nameFromParameterizable}}\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div role=\"full-description\" class=\"description\"\n" +
    "       ng-if=\"method.description\"\n" +
    "       markdown=\"method.description\">\n" +
    "  </div>\n" +
    "\n" +
    "  <tabset>\n" +
    "    <tab role='documentation-requests' heading=\"Request\" active='documentation.requestsActive' disabled=\"!documentation.hasRequestDocumentation \">\n" +
    "      <parameters></parameters>\n" +
    "      <requests></requests>\n" +
    "    </tab>\n" +
    "    <tab role='documentation-responses' class=\"responses\" heading=\"Responses\" active='documentation.responsesActive' disabled='!documentation.hasResponseDocumentation'>\n" +
    "      <responses></responses>\n" +
    "    </tab>\n" +
    "    <tab role=\"try-it\" heading=\"Try It\" active=\"documentation.tryItActive\" disabled=\"!documentation.hasTryIt\">\n" +
    "      <try-it></try-it>\n" +
    "    </tab>\n" +
    "  </tabset>\n" +
    "</section>\n"
  );


  $templateCache.put('views/method.tmpl.html',
    "<div class='method' role=\"method\" ng-class=\"methodView.cssClass()\">\n" +
    "  <div class='accordion-toggle method-summary' role=\"methodSummary\" ng-class='method.method' ng-click='methodView.toggleExpansion($event)'>\n" +
    "    <span role=\"verb\" class='method-name' ng-class='method.method'>{{method.method}}</span>\n" +
    "    <div class='filler' ng-show='methodView.expanded' ng-class='method.method'></div>\n" +
    "\n" +
    "    <div role=\"description\" ng-if=\"!methodView.expanded\">\n" +
    "       <div class='abbreviated-description' markdown='method.description'></div>\n" +
    "       <i class='icon-caret-right'></i>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-show='methodView.expanded'>\n" +
    "    <documentation></documentation>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/named_parameters.tmpl.html',
    "<fieldset class='labelled-inline bordered' ng-show=\"displayParameters()\">\n" +
    "  <legend>{{heading}}</legend>\n" +
    "  <parameter-fields parameters=\"parameters\" request-data=\"requestData\"></parameter-fields>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/named_parameters_documentation.tmpl.html',
    "<section class='named-parameters' ng-show='parameters'>\n" +
    "  <h2>{{heading}}</h2>\n" +
    "  <section role='parameter' class='parameter' ng-repeat='param in parameters'>\n" +
    "    <h4 class='strip-whitespace'>\n" +
    "      <span role=\"display-name\">{{param.displayName}}</span>\n" +
    "      <span class=\"constraints\">{{namedParametersDocumentation.constraints(param)}}</span>\n" +
    "    </h4>\n" +
    "\n" +
    "    <div class=\"info\">\n" +
    "      <div ng-if=\"param.example\"><span class=\"label\">Example:</span> <code class=\"well\" role=\"example\">{{param.example}}</code></div>\n" +
    "      <div role=\"description\" markdown=\"param.description\"></div>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "</section>\n"
  );


  $templateCache.put('views/oauth1.tmpl.html',
    "<fieldset class=\"labelled-inline\" role=\"oauth1\">\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"consumerKey\">Consumer Key:</label>\n" +
    "    <input type=\"text\" name=\"consumerKey\" ng-model='credentials.consumerKey'/>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"consumerSecret\">Consumer Secret:</label>\n" +
    "    <input type=\"password\" name=\"consumerSecret\" ng-model='credentials.consumerSecret'/>\n" +
    "  </div>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/oauth2.tmpl.html',
    "<fieldset class=\"labelled-inline\" role=\"oauth2\">\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"clientId\">Client ID:</label>\n" +
    "    <input type=\"text\" name=\"clientId\" ng-model='credentials.clientId'/>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label for=\"clientSecret\">Client Secret:</label>\n" +
    "    <input type=\"password\" name=\"clientSecret\" ng-model='credentials.clientSecret'/>\n" +
    "  </div>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/parameter_fields.tmpl.html',
    "<fieldset>\n" +
    "  <div class=\"control-group\" ng-repeat=\"(parameterName, parameter) in parameters track by parameterName\">\n" +
    "    <label for=\"{{parameterName}}\">\n" +
    "      <span class=\"required\" ng-if=\"parameter.required\">*</span>\n" +
    "      {{parameter.displayName}}:\n" +
    "    </label>\n" +
    "    <ng-switch on='parameter.type'>\n" +
    "      <input ng-switch-when='file' name=\"{{parameterName}}\" type='file' ng-model='requestData[parameterName]'/>\n" +
    "      <input ng-switch-default validated-input name=\"{{parameterName}}\" type='text' ng-model='requestData[parameterName]' placeholder='{{parameter.example}}' ng-trim=\"false\" constraints='parameter'/>\n" +
    "    </ng-switch>\n" +
    "  </div>\n" +
    "</fieldset>\n"
  );


  $templateCache.put('views/parameters.tmpl.html',
    "<named-parameters-documentation ng-repeat='parameterGroup in parameterGroups' heading='{{parameterGroup[0]}}' role='parameter-group' parameters='parameterGroup[1]'></named-parameters-documentation>\n"
  );


  $templateCache.put('views/path_builder.tmpl.html',
    "<span role=\"path\" class=\"path\">\n" +
    "  <span clsas=\"segment\">\n" +
    "    <span ng-repeat='token in api.baseUri.tokens track by $index'>\n" +
    "      <input type='text' validated-input ng-if='api.baseUri.parameters[token]'\n" +
    "                             name=\"{{token}}\"\n" +
    "                             ng-model=\"pathBuilder.baseUriContext[token]\"\n" +
    "                             placeholder=\"{{token}}\"\n" +
    "                             constraints=\"api.baseUri.parameters[token]\"\n" +
    "                             invalid-class=\"error\"/>\n" +
    "      <span class=\"segment\" ng-if=\"!api.baseUri.parameters[token]\">{{token}}</span>\n" +
    "    </span>\n" +
    "  <span role='segment' ng-repeat='segment in resource.pathSegments' ng-init=\"$segmentIndex = $index\">\n" +
    "    <span ng-repeat='token in segment.tokens track by $index'>\n" +
    "      <input type='text' validated-input ng-if='segment.parameters[token]'\n" +
    "                             name=\"{{token}}\"\n" +
    "                             ng-model=\"pathBuilder.segmentContexts[$segmentIndex][token]\"\n" +
    "                             placeholder=\"{{token}}\"\n" +
    "                             constraints=\"segment.parameters[token]\"\n" +
    "                             invalid-class=\"error\"/>\n" +
    "      <span class=\"segment\" ng-if=\"!segment.parameters[token]\">{{token}}</span>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</span>\n"
  );


  $templateCache.put('views/raml-console.tmpl.html',
    "<article role=\"api-console\" id=\"raml-console\">\n" +
    "  <div role=\"error\" ng-if=\"parseError\">\n" +
    "    {{parseError}}\n" +
    "  </div>\n" +
    "\n" +
    "  <header id=\"raml-console-api-title\">{{api.title}}</header>\n" +
    "\n" +
    "  <nav id=\"raml-console-main-nav\" ng-if='ramlConsole.showRootDocumentation()' ng-switch='ramlConsole.view'>\n" +
    "    <a class=\"btn\" ng-switch-when='rootDocumentation' role=\"view-api-reference\" ng-click='ramlConsole.gotoView(\"apiReference\")'>&larr; API Reference</a>\n" +
    "    <a class=\"btn\" ng-switch-default role=\"view-root-documentation\" ng-click='ramlConsole.gotoView(\"rootDocumentation\")'>Documentation &rarr;</a>\n" +
    "  </nav>\n" +
    "\n" +
    "  <div id=\"raml-console-content\" ng-switch='ramlConsole.view'>\n" +
    "    <div ng-switch-when='rootDocumentation'>\n" +
    "      <root-documentation></root-documentation>\n" +
    "    </div>\n" +
    "    <div ng-switch-default>\n" +
    "      <api-resources></api-resources>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</article>\n"
  );


  $templateCache.put('views/requests.tmpl.html',
    "<h2 ng-if=\"method.body\">Body</h2>\n" +
    "<section ng-repeat=\"(mediaType, definition) in method.body track by mediaType\">\n" +
    "  <h4>{{mediaType}}</h4>\n" +
    "  <div ng-switch=\"mediaType\">\n" +
    "    <named-parameters-documentation ng-switch-when=\"application/x-www-form-urlencoded\" role='parameter-group' parameters='definition.formParameters'></named-parameters-documentation>\n" +
    "    <named-parameters-documentation ng-switch-when=\"multipart/form-data\" role='parameter-group' parameters='definition.formParameters'></named-parameters-documentation>\n" +
    "    <div ng-switch-default>\n" +
    "      <section ng-if=\"definition.schema\">\n" +
    "        <h5>Schema</h5>\n" +
    "        <div class=\"code\" code-mirror=\"definition.schema\" mode=\"{{mediaType}}\" visible=\"methodView.expanded && documentation.requestsActive\"></div>\n" +
    "      </section>\n" +
    "      <section ng-if=\"definition.example\">\n" +
    "        <h5>Example</h5>\n" +
    "        <div class=\"code\" code-mirror=\"definition.example\" mode=\"{{mediaType}}\" visible=\"methodView.expanded && documentation.requestsActive\"></div>\n" +
    "      </section>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</section>\n"
  );


  $templateCache.put('views/resource.tmpl.html',
    "<div ng-class=\"{expanded: resourceView.expanded, collapsed: !resourceView.expanded}\"\n" +
    "     class='resource' role=\"resource\">\n" +
    "\n" +
    "  <div class='summary accordion-toggle' role='resource-summary' ng-click='resourceView.toggleExpansion()'>\n" +
    "    <ul class=\"modifiers\">\n" +
    "      <li class=\"trait\" ng-show='resourceView.expanded' role=\"trait\" ng-repeat=\"trait in resourceView.traits()\">\n" +
    "        {{trait|nameFromParameterizable}}\n" +
    "      </li>\n" +
    "      <li class=\"resource-type\" role=\"resource-type\" ng-if='resourceView.type()'>\n" +
    "        {{resourceView.type()|nameFromParameterizable}}\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <h3 class=\"path\">\n" +
    "      <span role='segment' ng-repeat='segment in resource.pathSegments'>{{segment.toString()}} </span>\n" +
    "    </h3>\n" +
    "    <ul class='methods' role=\"methods\" ng-if=\"resource.methods\" ng-hide=\"resourceView.expanded\">\n" +
    "      <li class='method-name' ng-class='method.method'\n" +
    "          ng-click='resourceView.expandMethod(method)' ng-repeat=\"method in resource.methods\">{{method.method}}</li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-if='resourceView.expanded'>\n" +
    "    <div>\n" +
    "      <div role='description'\n" +
    "           class='description'\n" +
    "           ng-if='resource.description'\n" +
    "           markdown='resource.description'>\n" +
    "      </div>\n" +
    "      <div class='accordion' role=\"methods\">\n" +
    "        <method ng-repeat=\"method in resource.methods\"></method>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/responses.tmpl.html',
    "<section collapsible collapsed ng-repeat='(responseCode, response) in method.responses'>\n" +
    "  <h2 role=\"response-code\" collapsible-toggle>\n" +
    "    <a href=''>\n" +
    "      <i ng-class=\"{'icon-caret-right': collapsed, 'icon-caret-down': !collapsed}\"></i>\n" +
    "      {{responseCode}}\n" +
    "    </a>\n" +
    "    <div ng-if=\"collapsed\" class=\"abbreviated-description\" markdown='response.description'></div>\n" +
    "  </h2>\n" +
    "  <div collapsible-content>\n" +
    "    <section role='response'>\n" +
    "      <div markdown='response.description'></div>\n" +
    "      <named-parameters-documentation heading='Headers' role='parameter-group' parameters='response.headers'></named-parameters-documentation>\n" +
    "      <h3 ng-show=\"response.body\">Body</h3>\n" +
    "      <section ng-repeat=\"(mediaType, definition) in response.body track by mediaType\">\n" +
    "        <h4>{{mediaType}}</h4>\n" +
    "        <section ng-if=\"definition.schema\">\n" +
    "          <h5>Schema</h5>\n" +
    "          <div class=\"code\" mode='{{mediaType}}' code-mirror=\"definition.schema\" visible=\"methodView.expanded && !collapsed\"></div>\n" +
    "        </section>\n" +
    "        <section ng-if=\"definition.example\">\n" +
    "          <h5>Example</h5>\n" +
    "          <div class=\"code\" mode='{{mediaType}}' code-mirror=\"definition.example\" visible=\"methodView.expanded && !collapsed\"></div>\n" +
    "        </section>\n" +
    "      </section>\n" +
    "    </section>\n" +
    "  </div>\n" +
    "</section>\n"
  );


  $templateCache.put('views/root_documentation.tmpl.html',
    "<div role=\"root-documentation\">\n" +
    "  <section collapsible collapsed ng-repeat=\"document in api.documentation\">\n" +
    "    <h2 collapsible-toggle>{{document.title}}</h2>\n" +
    "    <div collapsible-content class=\"content\">\n" +
    "      <div markdown='document.content'></div>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "</div>\n"
  );


  $templateCache.put('views/security_schemes.tmpl.html',
    "<div class=\"authentication\">\n" +
    "  <fieldset class=\"labelled-radio-group bordered\">\n" +
    "    <legend>Authentication</legend>\n" +
    "    <label for=\"scheme\">Type:</label>\n" +
    "\n" +
    "    <div class=\"radio-group\">\n" +
    "      <label class=\"radio\">\n" +
    "        <input type=\"radio\" name=\"scheme\" value=\"anonymous\" ng-model=\"keychain.selectedScheme\"> Anonymous </input>\n" +
    "      </label>\n" +
    "      <span ng-repeat=\"(name, scheme) in schemes\">\n" +
    "        <label class=\"radio\"  ng-if=\"securitySchemes.supports(scheme)\">\n" +
    "          <input type=\"radio\" name=\"scheme\" value=\"{{name}}\" ng-model=\"keychain.selectedScheme\"> {{ name }} </input>\n" +
    "        </label>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </fieldset>\n" +
    "\n" +
    "  <div ng-repeat=\"(name, scheme) in schemes\">\n" +
    "    <div ng-show=\"keychain.selectedScheme == name\">\n" +
    "      <div ng-switch=\"scheme.type\">\n" +
    "        <basic-auth ng-switch-when=\"Basic Authentication\" credentials='keychain[name]'></basic-auth>\n" +
    "        <oauth1 ng-switch-when=\"OAuth 1.0\" credentials='keychain[name]'></oauth1>\n" +
    "        <oauth2 ng-switch-when=\"OAuth 2.0\" credentials='keychain[name]'></oauth2>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/tab.tmpl.html',
    "<div class=\"tab-pane\" ng-class=\"{active: active, disabled: disabled}\" ng-show=\"active\" ng-transclude>\n" +
    "\n" +
    "</div>\n"
  );


  $templateCache.put('views/tabset.tmpl.html',
    "<div class=\"tabbable\">\n" +
    "  <ul class=\"nav nav-tabs\">\n" +
    "    <li ng-repeat=\"tab in tabs\" ng-class=\"{active: tab.active, disabled: tab.disabled}\">\n" +
    "      <a ng-click=\"tabset.select(tab)\">{{tab.heading}}</a>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div class=\"tab-content\" ng-transclude></div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/try_it.tmpl.html',
    "<section class=\"try-it\">\n" +
    "\n" +
    "  <form>\n" +
    "    <path-builder></path-builder>\n" +
    "\n" +
    "    <security-schemes ng-if=\"apiClient.securitySchemes\" schemes=\"apiClient.securitySchemes\" keychain=\"ramlConsole.keychain\"></security-schemes>\n" +
    "    <named-parameters heading=\"Headers\" parameters=\"method.headers\" request-data=\"apiClient.headers\"></named-parameters>\n" +
    "    <named-parameters heading=\"Query Parameters\" parameters=\"method.queryParameters\" request-data=\"apiClient.queryParameters\"></named-parameters>\n" +
    "\n" +
    "    <div class=\"request-body\" ng-show=\"method.body\">\n" +
    "      <fieldset class=\"bordered\">\n" +
    "        <legend>Body</legend>\n" +
    "\n" +
    "        <fieldset class=\"labelled-radio-group media-types\" ng-show=\"apiClient.supportsMediaType\">\n" +
    "          <label>Content Type</label>\n" +
    "          <div class=\"radio-group\">\n" +
    "            <label class=\"radio\" ng-repeat=\"(mediaType, _) in method.body track by mediaType\">\n" +
    "              <input type=\"radio\" name=\"media-type\" value=\"{{mediaType}}\" ng-model=\"apiClient.mediaType\">\n" +
    "              {{mediaType}}\n" +
    "            </label>\n" +
    "          </div>\n" +
    "        </fieldset>\n" +
    "\n" +
    "        <div ng-if=\"apiClient.showBody()\">\n" +
    "          <textarea name=\"body\" ng-model='apiClient.body' ng-model=\"apiClient.body\"></textarea>\n" +
    "          <a href=\"#\" class=\"body-prefill\" ng-show=\"apiClient.bodyHasExample()\" ng-click=apiClient.fillBody($event)>Prefill with example</a>\n" +
    "        </div>\n" +
    "        <div class=\"labelled-inline\">\n" +
    "          <parameter-fields parameters='method.body[\"application/x-www-form-urlencoded\"].formParameters' request-data=\"apiClient.formParameters\" ng-if=\"apiClient.showUrlencodedForm()\"></parameter-fields>\n" +
    "          <parameter-fields parameters='method.body[\"multipart/form-data\"].formParameters' request-data=\"apiClient.formParameters\" ng-if=\"apiClient.showMultipartForm()\"></parameter-fields>\n" +
    "        </div>\n" +
    "      </fieldset>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-actions\">\n" +
    "      <i ng-show='apiClient.inProgress()' class=\"icon-spinner icon-spin icon-large\"></i>\n" +
    "\n" +
    "      <div role=\"error\" class=\"error\" ng-show=\"apiClient.missingUriParameters\">\n" +
    "        Required URI Parameters must be entered\n" +
    "      </div>\n" +
    "      <div role=\"warning\" class=\"warning\" ng-show=\"apiClient.disallowedAnonymousRequest\">\n" +
    "        Successful responses require authentication\n" +
    "      </div>\n" +
    "      <button role=\"try-it\" ng-class=\"'btn-' + method.method\" ng-click=\"apiClient.execute()\">\n" +
    "        {{method.method}}\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "\n" +
    "  <div class=\"response\" ng-if=\"apiClient.response\">\n" +
    "    <h4>Response</h4>\n" +
    "    <div class=\"request-url\">\n" +
    "      <h5>Request URL</h5>\n" +
    "      <code class=\"response-value\">{{apiClient.response.requestUrl}}</code>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"status\">\n" +
    "      <h5>Status</h5>\n" +
    "      <code class=\"response-value\">{{apiClient.response.status}}</code>\n" +
    "    </div>\n" +
    "    <div class=\"headers\">\n" +
    "      <h5>Headers</h5>\n" +
    "      <ul class=\"response-value\">\n" +
    "        <li ng-repeat=\"(header, value) in apiClient.response.headers track by header\">\n" +
    "          <code>\n" +
    "            <span class=\"header-key\">{{header}}:</span>\n" +
    "            <span class=\"header-value\">{{value}}</span>\n" +
    "          </code>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "    <div class=\"body\">\n" +
    "      <h5>Body</h5>\n" +
    "      <div class=\"response-value\">\n" +
    "        <div class=\"code\" mode='{{apiClient.response.contentType}}' code-mirror=\"apiClient.response.body\" visible=\"apiClient.response.body\"></div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</section>\n"
  );

}]);
