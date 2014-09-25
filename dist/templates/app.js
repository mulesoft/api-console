angular.module('ramlConsole').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('common/spinner.tpl.html',
    "<img src=\"img/spinner.gif\">\n"
  );


  $templateCache.put('common/theme-switcher.tpl.html',
    "<a class=\"theme-toggle\" href=\"#\">Switch Theme</a>\n"
  );


  $templateCache.put('resources/resources-list.tpl.html',
    "<main class=\"container primary\">\n" +
    "  <h1 class=\"title\">{{raml.title}}</h1>\n" +
    "\n" +
    "  <ol class=\"resource-list resource-list-root\">\n" +
    "    <li class=\"resource-list-item\" ng-repeat=\"resourceGroup in raml.resourceGroups\">\n" +
    "      <header class=\"resource resource-root clearfix\" ng-init=\"resource = resourceGroup[0]\">\n" +
    "        <div class=\"resource-path-container\">\n" +
    "          <button class=\"resource-root-toggle\">\n" +
    "            <span class=\"visuallyhidden\">See Nested Resources</span>\n" +
    "          </button>\n" +
    "\n" +
    "          <h2 class=\"resource-heading resource-heading-large\">\n" +
    "            <span class=\"resource-path-active\" ng-repeat='segment in resource.pathSegments'>{{segment.toString()}}</span>\n" +
    "          </h2>\n" +
    "\n" +
    "          <span ng-show=\"resource.resourceType\" class=\"flag resource-heading-flag resource-heading-flag-root\"><b>Type:</b> {{resource.resourceType}}</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"tab-list\">\n" +
    "          <a class=\"tab\" href=\"#\" ng-repeat=\"method in resource.methods\">\n" +
    "            <svg class=\"tab-image tab-{{method.method}}\">\n" +
    "              <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "            </svg>\n" +
    "\n" +
    "            <span class=\"tab-label\">{{method.method.toLocaleUpperCase()}}</span>\n" +
    "          </a>\n" +
    "        </div>\n" +
    "\n" +
    "        <button class=\"resource-close-btn\">\n" +
    "          Close\n" +
    "        </button>\n" +
    "      </header>\n" +
    "\n" +
    "      <!-- Child Resources -->\n" +
    "      <ol class=\"resource-list\">\n" +
    "        <li class=\"resource-list-item\" ng-repeat=\"resource in resourceGroup\" ng-if=\"!$first\">\n" +
    "          <div class=\"resource clearfix\">\n" +
    "            <div class=\"resource-path-container\">\n" +
    "              <h3 class=\"resource-heading\">\n" +
    "                <span ng-repeat-start='segment in resource.pathSegments' ng-if=\"!$last\">{{segment.toString()}}</span><span ng-repeat-end ng-if=\"$last\" class=\"resource-path-active\">{{segment.toString()}}</span>\n" +
    "              </h3>\n" +
    "\n" +
    "              <span ng-show=\"resource.resourceType\" class=\"flag resource-heading-flag\"><b>Type:</b> {{resource.resourceType}}</span>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"tab-list\">\n" +
    "              <a class=\"tab\" href=\"#\" ng-repeat=\"method in resource.methods\">\n" +
    "                <svg class=\"tab-image tab-{{method.method}}\">\n" +
    "                  <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                </svg>\n" +
    "\n" +
    "                <span class=\"tab-label\">{{method.method.toLocaleUpperCase()}}</span>\n" +
    "              </a>\n" +
    "            </div>\n" +
    "\n" +
    "            <button class=\"resource-close-btn\">\n" +
    "              Close\n" +
    "            </button>\n" +
    "          </div>\n" +
    "        </li>\n" +
    "      </ol>\n" +
    "\n" +
    "    </li>\n" +
    "  </ol>\n" +
    "\n" +
    "</main>\n"
  );

}]);
