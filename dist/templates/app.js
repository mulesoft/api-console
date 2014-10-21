angular.module('ramlConsole').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('directives/close-button.tpl.html',
    "<button class=\"resource-close-btn\" ng-click=\"close($event)\">\n" +
    "  Close\n" +
    "</button>\n"
  );


  $templateCache.put('directives/documentation.tpl.html',
    "<div class=\"resource-panel-primary\">\n" +
    "  <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "    <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "      <li class=\"flag\" ng-show=\"resource.resourceType\"><b>Type:</b> {{resource.resourceType}}</li>\n" +
    "      <li class=\"flag\" ng-show=\"methodInfo.is\"><b>Trait:</b> {{methodInfo.is.join(', ')}}</li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "    <div class=\"toggle-tabs resource-panel-toggle-tabs\" ng-click=\"toggleTab($event)\">\n" +
    "      <a class=\"toggle-tab is-active\">Request</a><a class=\"toggle-tab\">Response</a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Request -->\n" +
    "  <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "    <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "    <p marked=\"methodInfo.description\"></p>\n" +
    "\n" +
    "    <section class=\"resource-section\" id=\"docs-uri-parameters\" ng-show=\"resource.uriParametersForDocumentation\">\n" +
    "      <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "      <div class=\"resource-param\" id=\"docs-uri-parameters-{{uriParam[0].displayName}}\" ng-repeat=\"uriParam in resource.uriParametersForDocumentation\">\n" +
    "        <h4 class=\"resource-param-heading\">{{uriParam[0].displayName}} <span class=\"resource-param-instructional\" ng-show=\"uriParam[0].required\">required</span></h4>\n" +
    "        <p marked=\"uriParam[0].description\"></p>\n" +
    "\n" +
    "        <p>\n" +
    "          <span class=\"resource-param-example\" ng-show=\"uriParam[0].example\"><b>Example:</b> {{uriParam[0].example}}</span>\n" +
    "        </p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section class=\"resource-section\" id=\"docs-headers\" ng-show=\"methodInfo.headers.plain\">\n" +
    "      <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "      <div class=\"resource-param\" ng-repeat=\"header in methodInfo.headers.plain\">\n" +
    "        <h4 class=\"resource-param-heading\">{{header[0].displayName}} <span class=\"resource-param-instructional\">{{header[0].type}}</span></h4>\n" +
    "\n" +
    "        <p marked=\"header[0].description\"></p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section class=\"resource-section\" id=\"docs-query-parameters\" ng-show=\"methodInfo.queryParameters\">\n" +
    "      <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "      <div class=\"resource-param\" ng-repeat=\"queryParam in methodInfo.queryParameters\">\n" +
    "        <h4 class=\"resource-param-heading\">{{queryParam[0].displayName}} <span class=\"resource-param-instructional\">{{queryParam[0].type}}</span></h4>\n" +
    "\n" +
    "        <p marked=\"queryParam[0].description\"></p>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Response -->\n" +
    "  <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "    <div class=\"resource-response-jump\">\n" +
    "      <p>\n" +
    "        Jump to status\n" +
    "        <span class=\"resource-btns\">\n" +
    "          <a class=\"resource-btn\" href=\"#code{{code}}\" ng-repeat=\"code in methodInfo.responseCodes\">{{code}}</a>\n" +
    "        </span>\n" +
    "      </p>\n" +
    "    </div>\n" +
    "\n" +
    "    <section class=\"resource-section resource-response-section\" ng-repeat=\"code in methodInfo.responseCodes\">\n" +
    "      <a name=\"code{{code}}\"></a>\n" +
    "      <h3 class=\"resource-heading-a\">Status {{code}}</h3>\n" +
    "\n" +
    "      <div class=\"resource-response\">\n" +
    "        <p marked=\"methodInfo.responses[code].description\"></p>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"resource-response\" ng-show=\"methodInfo.responses[code].body\">\n" +
    "        <h4 class=\"resource-body-heading\">\n" +
    "          Body\n" +
    "          <span ng-click=\"changeType($event, key)\" ng-class=\"{isActive: $first}\" class=\"flag\" ng-repeat=\"(key, value) in methodInfo.responses[code].body\">{{key}}</span>\n" +
    "        </h4>\n" +
    "\n" +
    "        <span>Example:</span>\n" +
    "        <pre ng-show=\"responseInfo[code][responseInfo.currentType].example\" class=\"resource-pre\"><code>{{responseInfo[code][responseInfo.currentType].example}}</code></pre>\n" +
    "        <pre ng-hide=\"responseInfo[code][responseInfo.currentType].example\" class=\"resource-pre\"><code>Example not defined</code></pre>\n" +
    "\n" +
    "        <p><button ng-click=\"showSchema($event)\" class=\"resource-btn js-schema-toggle\">Show Schema</button></p>\n" +
    "        <pre ng-show=\"responseInfo[code][responseInfo.currentType].schema\" class=\"resource-pre resource-pre-toggle\"><code>{{responseInfo[code][responseInfo.currentType].schema}}</code></pre>\n" +
    "        <pre ng-hide=\"responseInfo[code][responseInfo.currentType].schema\" class=\"resource-pre resource-pre-toggle\"><code>Schema not defined</code></pre>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/method-list.tpl.html',
    "<div class=\"tab-list\">\n" +
    "  <a class=\"tab\" href=\"#\" ng-repeat=\"method in resource.methods\" ng-click=\"showResource($event, $index)\">\n" +
    "    <svg class=\"tab-image tab-{{method.method}}\">\n" +
    "      <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "    </svg>\n" +
    "\n" +
    "    <span class=\"tab-label\">{{method.method.toLocaleUpperCase()}}</span>\n" +
    "  </a>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/raml-initializer.tpl.html',
    "<div>\n" +
    "  <div class=\"initializer-container initializer-primary\" ng-hide=\"ramlLoaded\">\n" +
    "    <h1 class=\"title\">RAML Console</h1>\n" +
    "\n" +
    "    <div class=\"initializer-content-wrapper\">\n" +
    "      <section>\n" +
    "        <header class=\"initializer-row initializer-subheader\">\n" +
    "          <h4 class=\"initializer-subhead\">Initialize from the URL of a RAML file</h4>\n" +
    "        </header>\n" +
    "\n" +
    "        <div class=\"initializer-row\">\n" +
    "          <p class=\"initializer-input-container\">\n" +
    "            <input class=\"initializer-input initializer-raml-field\" ng-model=\"ramlUrl\">\n" +
    "          </p>\n" +
    "\n" +
    "          <div class=\"initializer-action-group\" align=\"right\">\n" +
    "            <button class=\"initializer-action initializer-action-btn\" ng-click=\"loadFromUrl()\">Load from URL</button>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "\n" +
    "      <section>\n" +
    "        <header class=\"initializer-row initializer-subheader\">\n" +
    "          <h4 class=\"initializer-subhead\">or parse RAML in here</h4>\n" +
    "        </header>\n" +
    "\n" +
    "        <div class=\"initializer-row\">\n" +
    "          <p class=\"initializer-input-container\">\n" +
    "            <textarea ui-codemirror=\"{\n" +
    "              lineNumbers: true,\n" +
    "              lineWrapping : true,\n" +
    "              tabSize: 2,\n" +
    "              mode: 'yaml'\n" +
    "            }\" ng-model=\"raml\"></textarea>\n" +
    "          </p>\n" +
    "          <div class=\"initializer-action-group\" align=\"right\">\n" +
    "            <button class=\"initializer-action initializer-action-btn\" ng-click=\"loadRaml()\">Load RAML</button>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <raml-resources ng-show=\"ramlLoaded\"></raml-resources>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/resource-panel.tpl.html',
    "<div class=\"resource-panel\">\n" +
    "  <div class=\"resource-panel-wrapper\">\n" +
    "    <sidebar></sidebar>\n" +
    "\n" +
    "    <documentation></documentation>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/sidebar.tpl.html',
    "  <div class=\"sidebar\">\n" +
    "    <div class=\"sidebar-flex-wrapper\">\n" +
    "      <div class=\"sidebar-content\">\n" +
    "        <header class=\"sidebar-row sidebar-header\">\n" +
    "          <h3 class=\"sidebar-head\">\n" +
    "            Try it\n" +
    "            <a class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\" ng-click=\"toggleSidebar($event)\">\n" +
    "              <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "              <span class=\"visuallyhidden\">Expand</span>\n" +
    "            </a>\n" +
    "          </h3>\n" +
    "        </header>\n" +
    "\n" +
    "        <!-- Show more -->\n" +
    "        <div class=\"sidebar-show-more\" ng-show=\"showMoreEnable\">\n" +
    "          <p>\n" +
    "            more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "          </p>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"sidebar-content-wrapper\">\n" +
    "          <section>\n" +
    "            <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "              <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                <button ng-click=\"toggleSecurity($event, scheme.type, key)\" class=\"toggle toggle-mini\" ng-class=\"{'is-active': $first}\" ng-repeat=\"(key, scheme) in securitySchemes\">{{scheme.type}}</button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-switch=\"currentScheme.type\">\n" +
    "              <basic-auth ng-switch-when=\"Basic Authentication\" credentials='credentials'></basic-auth>\n" +
    "              <oauth1 ng-switch-when=\"OAuth 1.0\" credentials='credentials'></oauth1>\n" +
    "              <oauth2 ng-switch-when=\"OAuth 2.0\" credentials='credentials'></oauth2>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"sidebar-uri-parameters\" ng-show=\"resource.uriParametersForDocumentation\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <p class=\"sidebar-input-container\" ng-repeat=\"uriParam in resource.uriParametersForDocumentation\">\n" +
    "                <button class=\"sidebar-input-reset\" ng-click=\"resetUriParameter(uriParam)\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                <span class=\"sidebar-input-tooltip-container\">\n" +
    "                  <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout\">\n" +
    "                    <span marked=\"uriParam[0].description\"></span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "                <label for=\"{{uriParam[0].displayName}}\" class=\"sidebar-label\">{{uriParam[0].displayName}}</label>\n" +
    "                <input id=\"{{uriParam[0].displayName}}\" class=\"sidebar-input\" ng-model=\"uriParameters[uriParam[0].displayName]\">\n" +
    "              </p>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"sidebar-headers\" ng-show=\"methodInfo.headers.plain\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <p class=\"sidebar-input-container\" ng-repeat=\"header in methodInfo.headers.plain\">\n" +
    "                <button class=\"sidebar-input-reset\" ng-click=\"resetHeader(header)\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                <span class=\"sidebar-input-tooltip-container\">\n" +
    "                  <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout\">\n" +
    "                    <span marked=\"header[0].description\"></span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "                <label for=\"{{header[0].displayName}}\" class=\"sidebar-label\">{{header[0].displayName}}</label>\n" +
    "                <input id=\"{{header[0].displayName}}\" class=\"sidebar-input\" ng-model=\"context.headers.values[header[0].displayName][0]\">\n" +
    "              </p>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"sidebar-query-parameters\" ng-show=\"methodInfo.queryParameters\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\" ng-repeat=\"queryParam in methodInfo.queryParameters\">\n" +
    "                <button class=\"sidebar-input-reset\" ng-click=\"resetQueryParam(queryParam)\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                <span class=\"sidebar-input-tooltip-container\">\n" +
    "                  <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                  <span class=\"sidebar-tooltip-flyout\">\n" +
    "                    <span marked=\"queryParam[0].description\"></span>\n" +
    "                  </span>\n" +
    "                </span>\n" +
    "                <label for=\"{{queryParam[0].displayName}}\" class=\"sidebar-label\">{{queryParam[0].displayName}}</label>\n" +
    "                <input id=\"{{queryParam[0].displayName}}\" class=\"sidebar-input\" ng-model=\"context.queryParameters.values[queryParam[0].displayName][0]\">\n" +
    "              </p>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section id=\"sidebar-body\" ng-show=\"methodInfo.body\">\n" +
    "            <header class=\"sidebar-row sidebar-subheader\">\n" +
    "              <h4 class=\"sidebar-subhead\">Body</h4>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"toggle-group sidebar-toggle-group sidebar-toggle-type\">\n" +
    "                <button class=\"toggle toggle-mini\" ng-click=\"toggleBodyType($event, key)\" ng-class=\"{'is-active': $first}\" ng-repeat=\"(key, value) in methodInfo.body\">{{key}}</button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"codemirror-body-editor\" ui-codemirror=\"{ lineNumbers: true, tabSize: 2 }\" ng-model=\"context.bodyContent.definitions[context.bodyContent.selected].value\"></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"sidebar-prefill sidebar-row\" align=\"right\" ng-show=\"context.bodyContent.definitions[context.bodyContent.selected].hasExample()\">\n" +
    "              <button class=\"sidebar-action-prefill\" ng-click=\"prefillBody(context.bodyContent.selected)\">Prefill with example</button>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section>\n" +
    "            <div class=\"sidebar-row\">\n" +
    "              <div class=\"sidebar-action-group\">\n" +
    "                <button class=\"sidebar-action sidebar-action-{{methodInfo.method}}\" ng-click=\"tryIt($event)\">{{methodInfo.method.toUpperCase()}}\n" +
    "                </button>\n" +
    "                <button class=\"sidebar-action sidebar-action-clear\" ng-click=\"clearFields()\">Clear</button>\n" +
    "                <button class=\"sidebar-action sidebar-action-reset\" ng-click=\"resetFields()\">Reset</button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section>\n" +
    "            <header class=\"sidebar-row sidebar-header\">\n" +
    "              <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                <button ng-class=\"{'is-open':showRequestMetadata, 'is-collapsed':!showRequestMetadata}\" class=\"sidebar-expand-btn js-toggle-request-metadata\" ng-click=\"toggleRequestMetadata()\">\n" +
    "                  Request\n" +
    "                </button>\n" +
    "              </h3>\n" +
    "              <img src=\"img/spinner.gif\" style=\"height: 21px; width: 21px; float: right; margin-right: 10px; margin-top: 3px;\" ng-show=\"showSpinner\"/>\n" +
    "            </header>\n" +
    "            <div class=\"sidebar-request-metadata\" ng-class=\"{'is-active':showRequestMetadata}\">\n" +
    "\n" +
    "              <div class=\"sidebar-row\">\n" +
    "                <div ng-show=\"requestOptions.url\">\n" +
    "                  <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Request URI</h3>\n" +
    "                  <div class=\"sidebar-response-item\">\n" +
    "                    <p class=\"sidebar-response-metadata\">{{requestOptions.url}}</p>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-show=\"requestOptions.headers\">\n" +
    "                  <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                  <div class=\"sidebar-response-item\">\n" +
    "                    <p class=\"sidebar-response-metadata\" ng-repeat=\"(key, value) in requestOptions.headers\">\n" +
    "                      <b>{{key}}:</b> <br>{{value}}\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-show=\"requestOptions.data\">\n" +
    "                  <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                  <pre class=\"sidebar-pre sidebar-request-body\"><code ui-codemirror=\"{ readOnly: 'nocursor', tabSize: 2, lineNumbers: true }\" ng-model=\"requestOptions.data\"></code></pre>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </section>\n" +
    "\n" +
    "          <section>\n" +
    "            <header class=\"sidebar-row sidebar-header\">\n" +
    "              <h3 class=\"sidebar-head\">Response</h3>\n" +
    "            </header>\n" +
    "\n" +
    "            <div class=\"sidebar-row sidebar-response\" ng-class=\"{'is-active':requestEnd}\">\n" +
    "              <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "              <p class=\"sidebar-response-item\">{{response.status}}</p>\n" +
    "\n" +
    "              <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "              <div class=\"sidebar-response-item\">\n" +
    "                <p class=\"sidebar-response-metadata\" ng-repeat=\"(key, value) in response.headers\">\n" +
    "                  <b>{{key}}:</b> <br>{{value}}\n" +
    "                </p>\n" +
    "              </p>\n" +
    "            </div>\n" +
    "\n" +
    "            <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "            <pre class=\"sidebar-pre\"><code ui-codemirror=\"{ readOnly: 'nocursor', tabSize: 2, lineNumbers: true, lineWrapping : true }\" ng-model=\"response.body\"></code></pre>\n" +
    "          </div>\n" +
    "        </section>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Sidebar control to intermediate view -->\n" +
    "    <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\" ng-click=\"collapseSidebar($event)\">\n" +
    "      <button class=\"collapse\">\n" +
    "        <span class=\"discoverable\">Try it</span>\n" +
    "        <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "      </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Sidebar control to full-screen/full-width view -->\n" +
    "    <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "      <button class=\"collapse\">\n" +
    "        <span class=\"discoverable\">Try it</span>\n" +
    "        <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/spinner.tpl.html',
    "<img src=\"img/spinner.gif\">\n"
  );


  $templateCache.put('directives/theme-switcher.tpl.html',
    "<a class=\"theme-toggle\" href=\"#\">Switch Theme</a>\n"
  );


  $templateCache.put('resources/resource-type.tpl.html',
    "<span ng-show=\"resource.resourceType\" class=\"flag resource-heading-flag\"><b>Type:</b> {{resource.resourceType}}</span>\n"
  );


  $templateCache.put('resources/resources.tpl.html',
    "<main class=\"error-container error-primary\">\n" +
    "\n" +
    "  <div ng-hide=\"parseError\">\n" +
    "    <div ng-hide=\"loaded\">\n" +
    "      <div class=\"spinner\">\n" +
    "        <div class=\"rect1\"></div>\n" +
    "        <div class=\"rect2\"></div>\n" +
    "        <div class=\"rect3\"></div>\n" +
    "        <div class=\"rect4\"></div>\n" +
    "        <div class=\"rect5\"></div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"error-content\" ng-show=\"parseError\">\n" +
    "    <h3 class=\"heading\">Error while loading <b>{{parseError.fileName}}</b></h3>\n" +
    "\n" +
    "    <section>\n" +
    "      <header class=\"error-row error-header\">\n" +
    "        <h3 class=\"error-head error-head-expand\">\n" +
    "          <div class=\"error-expand-btn\">\n" +
    "            Message\n" +
    "          </div>\n" +
    "        </h3>\n" +
    "      </header>\n" +
    "      <pre class=\"error-pre\"><code class=\"error-message\">{{parseError.message}}</code></pre>\n" +
    "\n" +
    "      <div ng-show=\"parseError.snippet\">\n" +
    "        <header class=\"error-row error-header\">\n" +
    "          <h3 class=\"error-head error-head-expand\">\n" +
    "            <div class=\"error-expand-btn\">\n" +
    "              Snippet <span class=\"error-subhead\">(Line {{parseError.line}}, Column {{parseError.column}})</span>\n" +
    "            </div>\n" +
    "          </h3>\n" +
    "        </header>\n" +
    "        <pre class=\"error-pre\"><code class=\"error-snippet\">{{parseError.snippet}}</code></pre>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-show=\"parseError.raml\">\n" +
    "        <header class=\"error-row error-header\">\n" +
    "          <h3 class=\"error-head error-head-expand\">\n" +
    "            <div class=\"error-expand-btn\">\n" +
    "              RAML\n" +
    "            </div>\n" +
    "          </h3>\n" +
    "        </header>\n" +
    "        <pre class=\"error-pre error-codemirror-container\"><code ui-codemirror=\"cmOption\" ng-model=\"parseError.raml\"></code></pre>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-show=\"loaded\">\n" +
    "    <theme-switcher></theme-switcher>\n" +
    "    <h1 class=\"title\">{{raml.title}}</h1>\n" +
    "\n" +
    "    <ol class=\"resource-list resource-list-root\">\n" +
    "      <li class=\"resource-list-item\" ng-repeat=\"resourceGroup in raml.resourceGroups\">\n" +
    "        <header class=\"resource resource-root clearfix\" ng-init=\"resource = resourceGroup[0]\">\n" +
    "          <div class=\"resource-path-container\">\n" +
    "            <button class=\"resource-root-toggle is-active\" ng-show=\"resourceGroup.length > 1\" ng-click=\"toggle($event)\"></button>\n" +
    "\n" +
    "            <h2 class=\"resource-heading resource-heading-large\">\n" +
    "              <span class=\"resource-path-active\" ng-repeat='segment in resource.pathSegments'>{{segment.toString()}}</span>\n" +
    "            </h2>\n" +
    "\n" +
    "            <resource-type></resource-type>\n" +
    "          </div>\n" +
    "\n" +
    "          <method-list></method-list>\n" +
    "          <close-button></close-button>\n" +
    "        </header>\n" +
    "\n" +
    "        <resource-panel></resource-panel>\n" +
    "\n" +
    "        <!-- Child Resources -->\n" +
    "        <ol class=\"resource-list is-collapsed\" style=\"display: none;\">\n" +
    "          <li class=\"resource-list-item\" ng-repeat=\"resource in resourceGroup\" ng-if=\"!$first\">\n" +
    "            <div class=\"resource clearfix\">\n" +
    "              <div class=\"resource-path-container\">\n" +
    "                <h3 class=\"resource-heading\">\n" +
    "                  <span ng-repeat-start='segment in resource.pathSegments' ng-if=\"!$last\">{{segment.toString()}}</span><span ng-repeat-end ng-if=\"$last\" class=\"resource-path-active\">{{segment.toString()}}</span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <resource-type></resource-type>\n" +
    "              </div>\n" +
    "\n" +
    "              <method-list></method-list>\n" +
    "              <close-button></close-button>\n" +
    "            </div>\n" +
    "\n" +
    "            <resource-panel></resource-panel>\n" +
    "          </li>\n" +
    "        </ol>\n" +
    "\n" +
    "      </li>\n" +
    "    </ol>\n" +
    "  </div>\n" +
    "</main>\n"
  );


  $templateCache.put('security/basic_auth.tpl.html',
    "<div class=\"sidebar-row\">\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"username\" class=\"sidebar-label\">Username</label>\n" +
    "    <input type=\"text\" id=\"username\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.username\"/>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"password\" class=\"sidebar-label\">Password</label>\n" +
    "    <input type=\"password\" id=\"password\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.password\"/>\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('security/oauth1.tpl.html',
    "<div class=\"sidebar-row\">\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"consumerKey\" class=\"sidebar-label\">Consumer Key</label>\n" +
    "    <input type=\"text\" id=\"consumerKey\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.consumerKey\"/>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"consumerSecret\" class=\"sidebar-label\">Consumer Secret</label>\n" +
    "    <input type=\"password\" id=\"consumerSecret\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.consumerSecret\"/>\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('security/oauth2.tpl.html',
    "<div class=\"sidebar-row\">\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"clientId\" class=\"sidebar-label\">Client ID</label>\n" +
    "    <input type=\"text\" id=\"clientId\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.clientId\"/>\n" +
    "  </p>\n" +
    "\n" +
    "  <p class=\"sidebar-input-container\">\n" +
    "    <label for=\"clientSecret\" class=\"sidebar-label\">Client Secret</label>\n" +
    "    <input type=\"password\" id=\"clientSecret\" class=\"sidebar-input sidebar-security-field\" ng-model=\"credentials.clientSecret\"/>\n" +
    "  </p>\n" +
    "</div>\n"
  );

}]);
