var $inactiveElements = jQuery('.tab').add('.resource').add('li');

var completeAnimation = function (element) {
  jQuery(element).removeAttr('style');
}

var findTab = function (element) {
  return jQuery(element).closest('.resource')
    .find('.tab-list')
    .children()
    .first();
};

jQuery('.resource-heading')
  .on('mouseenter', function () {
    findTab(this).addClass('is-hovered');
  }).on('mouseleave', function () {
    findTab(this).removeClass('is-hovered');
  }).on('click', function () {
    findTab(this).trigger('click');
  });

jQuery('.tab').on('click', function (ev) {
  var $this = jQuery(this);
  var $resource = $this.closest('.resource'); // <header>.resource
  var $resourceListItem = $resource.parent('li'); //li contains <header>.resource
  var $closingEl;

  ev.preventDefault();

  if (!$resource.hasClass('is-active')) {
    $closingEl = $inactiveElements
      .filter('.is-active')
      .children('.resource-panel');

    $closingEl.velocity('slideUp');

    $resourceListItem
      .children('.resource-panel')
      .velocity('slideDown');

    $inactiveElements.removeClass('is-active');

    $resource
      .add($resourceListItem)
      .add($this)
      .addClass('is-active');
  } else if (jQuery(this).hasClass('is-active')) {
    $resource.find('.resource-close-btn').trigger('click');
  } else {
    jQuery(this).addClass('is-active');
    jQuery(this).siblings('.tab').removeClass('is-active');
  }
});

jQuery('.resource-close-btn').on('click', function (ev) {
  var $this = jQuery(this);
  var $resource = $this.closest('.resource');
  var $resourceListItem = $resource.parent('li');

  $resourceListItem
    .children('.resource-panel')
    .velocity('slideUp');

  $inactiveElements.removeClass('is-active');
});

jQuery('.resource-root-toggle').on('click', function (ev) {
  var $this = jQuery(this);
  var $section = $this
    .closest('.resource-list-item')
    .find('.resource-list');

  if ($section.hasClass('is-collapsed')) {
    $section.velocity('slideDown', {
      duration: 200
    });
  } else {
    $section.velocity('slideUp', {
      duration: 200
    });
  }

  $section.toggleClass('is-collapsed');
  $this.toggleClass('is-active');
});

jQuery('.js-sidebar-collapse-toggle').on('click', function () {
  var $panel = jQuery(this).closest('.resource-panel');
  var $panelContent = $panel.find('.resource-panel-primary');
  var $sidebar = $panel.find('.sidebar');
  var $sidebarContent = $panel.find('.sidebar-content');

  if ($sidebar.hasClass('is-collapsed')) {
    $sidebar.velocity(
      { width: 430 },
      {
        duration: 200,
        complete: completeAnimation
      }
    );

    $panelContent.velocity(
      { "padding-left": 430 },
      {
        duration: 200,
        complete: completeAnimation
      }
    );
  } else {
    $sidebar.velocity(
      { width: 0 },
      {
        duration: 200,
        complete: completeAnimation
      }
    );

    $panelContent.velocity(
      { "padding-left": 0 },
      {
        duration: 200,
        complete: completeAnimation
      }
    );
  }

  $sidebar.toggleClass('is-collapsed');
  $panel.toggleClass('has-sidebar-collapsed');
});

jQuery('.js-sidebar-fullscreen').on('click', function (ev) {
  ev.preventDefault();

  var $panel = jQuery(this).closest('.resource-panel');
  var $sidebar = $panel.find('.sidebar');
  var $sidebarContent = $panel.find('.sidebar-content');
  var sidebarWidth = 0;

  if (jQuery(window).width() > 960) {
    sidebarWidth = 430;
  }

  if ($sidebar.hasClass('is-fullscreen')) {
    $sidebar.velocity(
      { width: sidebarWidth },
      {
        duration: 200,
        complete: completeAnimation
      }
    );
  } else {
    $sidebar.velocity(
      { width: '100%' },
      {
        duration: 200,
        complete: completeAnimation
      }
    );
  }

  $sidebar.toggleClass('is-fullscreen');
  $panel.toggleClass('has-sidebar-fullscreen');
});


jQuery('.toggle-tabs').on('click', function(ev) {
  var $this = jQuery(this);
  var $eachTab = $this.children('.toggle-tab');
  var $panel = $this.closest('.resource-panel');
  var $eachContent = $panel.find('.resource-panel-content');

  $eachTab.toggleClass('is-active');
  $eachContent.toggleClass('is-active');
});

$('.js-schema-toggle').on('click', function (ev) {
  var $this = jQuery(this);
  var $panel = $this.closest('.resource-panel');
  var $schema = $panel.find('.resource-pre-toggle');

  $this.toggleClass('is-active');

  if (!$schema.hasClass('is-active')) {
    $schema
      .addClass('is-active')
      .velocity('slideDown');
  } else {
    $schema
      .removeClass('is-active')
      .velocity('slideUp');
  }
});

jQuery('.js-toggle-request-metadata').on('click', function(ev) {
  var $this = jQuery(this);
  var $panel = $this.closest('.resource-panel');
  var $metadata = $panel.find('.sidebar-request-metadata');

  $metadata.toggleClass('is-active');

  if (!$metadata.hasClass('is-active')) {
    $this.removeClass('is-open');
    $this.addClass('is-collapsed');
  } else {
    $this.removeClass('is-collapsed');
    $this.addClass('is-open');
  }
});

//// CODE ////

RAML = {};
RAML.Directives = {};

angular.module('RAML.Directives', []);

angular.module('ramlConsoleApp', ['RAML.Directives']);

RAML.Directives.theme = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'common/theme-switcher.tpl.html',
    replace: true,
    scope: { },
    controller: function($scope, $element) {
    },
    link: function($scope, $element, attrs) {
      $element.on('click', function(event) {
        var $link = jQuery('head link.theme');
        var theme = $link.attr('href');

        $link.attr('href', 'styles/light-theme.css');
        $element.removeClass('theme-toggle-dark');

        if (theme === 'styles/light-theme.css') {
          $link.attr('href', 'styles/dark-theme.css');
          $element.addClass('theme-toggle-dark');
        }
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('themeSwitcher', ['$window', RAML.Directives.theme]);

RAML.Directives.resources = function() {
  return {
    restrict: 'E',
    templateUrl: 'resources/resources-list.tpl.html',
    replace: true,
    scope: { },
    controller: function($scope, $element) {
    }
  };
};

angular.module('RAML.Directives')
  .directive('ramlResources', RAML.Directives.resources);

angular.module('ramlConsoleApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('common/theme-switcher.tpl.html',
    "<a class=\"theme-toggle\" href=\"#\">Switch Theme</a>\n"
  );


  $templateCache.put('resources/resources-list.tpl.html',
    "   <main class=\"container primary\">\n" +
    "    <h1 class=\"title\">GitHub API</h1>\n" +
    "\n" +
    "    <ol class=\"resource-list resource-list-root\">\n" +
    "      <li class=\"resource-list-item\">\n" +
    "        <header class=\"resource resource-root clearfix\">\n" +
    "          <div class=\"resource-path-container\">\n" +
    "            <button class=\"resource-root-toggle\">\n" +
    "              <span class=\"visuallyhidden\">See Nested Resources</span>\n" +
    "            </button>\n" +
    "\n" +
    "            <h2 class=\"resource-heading resource-heading-large\">\n" +
    "              <span class=\"resource-path-active\">/notifications</span>\n" +
    "            </h2>\n" +
    "\n" +
    "            <span class=\"flag resource-heading-flag resource-heading-flag-root\"><b>Type:</b> collection</span>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"tab-list\">\n" +
    "            <a class=\"tab\" href=\"#\">\n" +
    "              <svg class=\"tab-image tab-get\">\n" +
    "                <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "              </svg>\n" +
    "\n" +
    "              <span class=\"tab-label\">GET</span>\n" +
    "            </a>\n" +
    "\n" +
    "            <a class=\"tab\" href=\"#\">\n" +
    "              <svg class=\"tab-image tab-put\">\n" +
    "                <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "              </svg>\n" +
    "\n" +
    "              <span class=\"tab-label\">PUT</span>\n" +
    "            </a>\n" +
    "          </div>\n" +
    "\n" +
    "          <button class=\"resource-close-btn\">\n" +
    "            Close\n" +
    "          </button>\n" +
    "        </header>\n" +
    "\n" +
    "        <div class=\"resource-panel\">\n" +
    "          <div class=\"resource-panel-wrapper\">\n" +
    "            <div class=\"sidebar\">\n" +
    "              <div class=\"sidebar-flex-wrapper\">\n" +
    "                <div class=\"sidebar-content\">\n" +
    "                  <header class=\"sidebar-row sidebar-header\">\n" +
    "                    <h3 class=\"sidebar-head\">\n" +
    "                      Try it\n" +
    "                      <a href=\"#\" class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\">\n" +
    "                        <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                        <span class=\"visuallyhidden\">Expand</span>\n" +
    "                      </a>\n" +
    "                    </h3>\n" +
    "                  </header>\n" +
    "\n" +
    "                  <!-- Show more -->\n" +
    "                  <div class=\"sidebar-show-more\">\n" +
    "                    <p>\n" +
    "                      more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <div class=\"sidebar-content-wrapper\">\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "                        <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "\n" +
    "                        <button class=\"sidebar-add-btn\">\n" +
    "                          <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                        </button>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                          <button class=\"toggle toggle-mini is-active\">Anonymous</button>\n" +
    "                          <button class=\"toggle toggle-mini\">oauth_2_0</button>\n" +
    "                        </div>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section id=\"sidebar-uri-parameters\">\n" +
    "                      <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                        <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "\n" +
    "                        <button class=\"sidebar-add-btn\">\n" +
    "                          <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                        </button>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <p class=\"sidebar-method\">GET</p>\n" +
    "\n" +
    "                        <div class=\"sidebar-method-content\">\n" +
    "                          <p class=\"sidebar-url\">https://api.github.com/notifications</p>\n" +
    "                        </div>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"mediaTypeExtension\" class=\"sidebar-label\">mediaTypeExtension</label>\n" +
    "                          <input id=\"mediaTypeExtension\" class=\"sidebar-input\" value=\".json\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section id=\"sidebar-headers\">\n" +
    "                      <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                        <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "\n" +
    "                        <button class=\"sidebar-add-btn\">\n" +
    "                          <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                        </button>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <p class=\"sidebar-input-container sidebar-input-container-custom\">\n" +
    "                          <button class=\"sidebar-input-delete\"><span class=\"visuallyhidden\">Delete header</span></button>\n" +
    "                          <label for=\"custom-header\" class=\"sidebar-label sidebar-label-custom\">\n" +
    "                            <input class=\"sidebar-custom-input-for-label\" placeholder=\"custom header key\">\n" +
    "                          </label>\n" +
    "                          <input id=\"custom-header\" class=\"sidebar-input sidebar-input-custom\" placeholder=\"custom value\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"accept\" class=\"sidebar-label\">Accept</label>\n" +
    "                          <input id=\"accept\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-headers-x-github-media-type\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-GitHub-Media-Type\" class=\"sidebar-label\">X-GitHub-Media-Type</label>\n" +
    "                          <input id=\"X-GitHub-Media-Type\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-headers-x-github-request-id\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-GitHub-Request-Id\" class=\"sidebar-label\">X-GitHub-Request-Id</label>\n" +
    "                          <input id=\"X-GitHub-Request-Id\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-RateLimit-Limit\" class=\"sidebar-label\">X-RateLimit-Limit</label>\n" +
    "                          <input id=\"X-RateLimit-Limit\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-RateLimit-Remaining\" class=\"sidebar-label\">X-RateLimit-Remaining</label>\n" +
    "                          <input id=\"X-RateLimit-Remaining\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-RateLimit-Reset\" class=\"sidebar-label\">X-RateLimit-Reset</label>\n" +
    "                          <input id=\"X-RateLimit-Reset\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                        <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "\n" +
    "                        <button class=\"sidebar-add-btn\">\n" +
    "                          <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                        </button>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"all\" class=\"sidebar-label\">all</label>\n" +
    "                          <input id=\"all\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-participating\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"participating\" class=\"sidebar-label\">participating</label>\n" +
    "                          <input id=\"participating\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-since\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"since\" class=\"sidebar-label\">since</label>\n" +
    "                          <input id=\"since\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-max_id\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"max_id\" class=\"sidebar-label\">max_id</label>\n" +
    "                          <input id=\"max_id\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-since_id\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"since_id\" class=\"sidebar-label\">since_id</label>\n" +
    "                          <input id=\"since_id\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-trim_user\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"trim_user\" class=\"sidebar-label\">trim_user</label>\n" +
    "                          <input id=\"trim_user\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                        <h4 class=\"sidebar-subhead\">Request URI</h4>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <p class=\"sidebar-response-item sidebar-request-url\">https://api.github.com/notifications?<b>all</b>=<i>true</i></p>\n" +
    "\n" +
    "                        <div class=\"sidebar-action-group\">\n" +
    "                          <button class=\"sidebar-action sidebar-action-get\">GET</button>\n" +
    "                          <button class=\"sidebar-action sidebar-action-clear\">Clear</button>\n" +
    "                          <button class=\"sidebar-action sidebar-action-reset\">Reset</button>\n" +
    "                        </div>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                          <button class=\"sidebar-expand-btn is-collapsed js-toggle-request-metadata\">\n" +
    "                            Request\n" +
    "                          </button>\n" +
    "                        </h3>\n" +
    "                        <button class=\"resource-btn\">Copy</button>\n" +
    "                      </header>\n" +
    "                      <div class=\"sidebar-request-metadata\">\n" +
    "\n" +
    "                        <div class=\"sidebar-row\">\n" +
    "                          <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                          <div class=\"sidebar-response-item\">\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>Accept:</b> <br>bytes\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-GitHub-Media-Type:</b> <br>keep-alive\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-GitHub-Request-Id:</b> <br>gzip\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-RateLimit-Limit:</b> <br>86\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-RateLimit-Remaining:</b> <br>application/json; charset=utf-8\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-RateLimit-Reset:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "\n" +
    "                          <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                          <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                        </div>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head\">Response</h3>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "                        <p class=\"sidebar-response-item\">200</p>\n" +
    "\n" +
    "                        <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                        <div class=\"sidebar-response-item\">\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>accept-ranges:</b> <br>bytes\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>connection:</b> <br>keep-alive\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>content-encoding:</b> <br>gzip\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>content-length:</b> <br>86\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>content-type:</b> <br>application/json; charset=utf-8\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>date:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>strict-transport-security:</b> <br>max-age=631138519\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>x-varnish-cache:</b> <br>MISS\n" +
    "                          </p>\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "\n" +
    "                      <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                      <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "              <!-- Sidebar control to intermediate view -->\n" +
    "              <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\">\n" +
    "                <button class=\"collapse\">\n" +
    "                  <span class=\"discoverable\">Try it</span>\n" +
    "                  <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                </button>\n" +
    "              </div>\n" +
    "\n" +
    "              <!-- Sidebar control to full-screen/full-width view -->\n" +
    "              <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "                <button class=\"collapse\">\n" +
    "                  <span class=\"discoverable\">Try it</span>\n" +
    "                  <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                </button>\n" +
    "              </div>\n" +
    "\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"resource-panel-primary\">\n" +
    "            <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "              <div class=\"resource-panel-description\">\n" +
    "                <p class=\"description\">Whenever humanity seems condemned to heaviness, I think I should fly like Perseus into a different space.</p>\n" +
    "              </div>\n" +
    "\n" +
    "              <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "                <li class=\"flag\"><b>Type:</b> collection</li>\n" +
    "                <li class=\"flag\"><b>Trait:</b> filterable</li>\n" +
    "              </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "              <div class=\"toggle-tabs resource-panel-toggle-tabs\">\n" +
    "                <a href=\"#\" class=\"toggle-tab is-active\">Request</a><a href=\"#\" class=\"toggle-tab\">Response</a>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Request -->\n" +
    "            <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "              <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "              <p>List your notifications. List all notifications for the current user, grouped by repository.</p>\n" +
    "\n" +
    "              <section class=\"resource-section\">\n" +
    "                <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "                <div class=\"resource-param\" id=\"docs-uri-parameters-mediatypeextension\">\n" +
    "                  <h4 class=\"resource-param-heading\">mediaTypeExtension <span class=\"resource-param-instructional\">required, one of (.json)</span></h4>\n" +
    "                  <p>Use .json to specify application/json media type.</p>\n" +
    "\n" +
    "                  <p>\n" +
    "                    <span class=\"resource-param-example\"><b>Example:</b> .json</span>\n" +
    "                  </p>\n" +
    "                </div>\n" +
    "              </section>\n" +
    "\n" +
    "              <section class=\"resource-section\">\n" +
    "                <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">Accept <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>Is used to set specified media type.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-GitHub-Media-Type <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>You can check the current version of media type in responses.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-GitHub-Request-Id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-limit\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-RateLimit-Limit <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-remaining\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-RateLimit-Remaining <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-reset\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-RateLimit-Reset <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                </div>\n" +
    "              </section>\n" +
    "\n" +
    "              <section class=\"resource-section\" id=\"docs-query-parameters\">\n" +
    "                <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">all <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>True to show notifications marked as read.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">participating <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>True to show only notifications in which the user is directly participating or mentioned.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">since <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>Time filters out any notifications updated before the given time. The time should be passed in as UTC in the ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ. Example: \"2012-10-09T23:39:01Z\".</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">max_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                  <p>Returns results with an ID less than (that is, older than) or equal to the specified ID.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">since_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                  <p>Returns results with an ID greater than (that is, more recent than) the specified ID. There are limits to the number of Tweets which can be accessed through the API. If the limit of Tweets has occured since the sinceid, the sinceid will be forced to the oldest ID available.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">trim_user <span class=\"resource-param-instructional\">one of (0, 1, true, false, t, f)</span></h4>\n" +
    "\n" +
    "                  <p>When set to either true, t or 1, each tweet returned in a timeline will include a user object including only the status authors numerical ID. Omit this parameter to receive the complete user object.</p>\n" +
    "                </div>\n" +
    "              </section>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Response -->\n" +
    "            <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "              <div class=\"resource-response-jump\">\n" +
    "                <p>\n" +
    "                  Jump to status\n" +
    "                  <span class=\"resource-btns\">\n" +
    "                    <button class=\"resource-btn\" href=\"#code200\">200</button>\n" +
    "                    <button class=\"resource-btn\" href=\"#code403\">403</button>\n" +
    "                  </span>\n" +
    "                </p>\n" +
    "              </div>\n" +
    "\n" +
    "              <section class=\"resource-section resource-response-section\">\n" +
    "                <a name=\"code200\"></a>\n" +
    "                <h3 class=\"resource-heading-a\">Status 200</h3>\n" +
    "\n" +
    "                <div class=\"resource-response\">\n" +
    "                  <h4 class=\"resource-body-heading\">\n" +
    "                    Body\n" +
    "                    <span class=\"flag\">application/json</span> <span class=\"flag\">text/plain</span>\n" +
    "                  </h4>\n" +
    "\n" +
    "                  <span>Example:</span>\n" +
    "                  <pre class=\"resource-pre\"><code>Some Code Here</code></pre>\n" +
    "\n" +
    "                  <p><button class=\"resource-btn js-schema-toggle\">Show Schema</button></p>\n" +
    "                  <pre class=\"resource-pre resource-pre-toggle\"><code>Some Code Here</code></pre>\n" +
    "                </div>\n" +
    "              </section>\n" +
    "\n" +
    "              <section class=\"resource-section\">\n" +
    "                <a name=\"code403\"></a>\n" +
    "                <h3 class=\"resource-heading-a\">Status 403</h3>\n" +
    "\n" +
    "                <div class=\"resource-response\">\n" +
    "                  <p>API rate limit exceeded. See <a href=\"http://developer.github.com/v3/#rate-limiting\">http://developer.github.com/v3/#rate-limiting</a> for details.</p>\n" +
    "                </div>\n" +
    "\n" +
    "              </div>\n" +
    "\n" +
    "\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <ol class=\"resource-list\">\n" +
    "          <li class=\"resource-list-item\">\n" +
    "            <div class=\"resource clearfix\">\n" +
    "              <div class=\"resource-path-container\">\n" +
    "                <h3 class=\"resource-heading\">\n" +
    "                  /notifications/threads<span class=\"resource-path-active\">/{id}</span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <span class=\"flag resource-heading-flag\"><b>Type:</b> item</span>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"tab-list\">\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-get\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">GET</span>\n" +
    "                </a>\n" +
    "              </div>\n" +
    "\n" +
    "              <button class=\"resource-close-btn\">\n" +
    "                Close\n" +
    "              </button>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"resource-panel\">\n" +
    "              <div class=\"resource-panel-wrapper\">\n" +
    "                <div class=\"sidebar\">\n" +
    "                  <div class=\"sidebar-flex-wrapper\">\n" +
    "                    <div class=\"sidebar-content\">\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head\">\n" +
    "                          Try it\n" +
    "                          <a href=\"#\" class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\">\n" +
    "                            <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                            <span class=\"visuallyhidden\">Expand</span>\n" +
    "                          </a>\n" +
    "                        </h3>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <!-- Show more -->\n" +
    "                      <div class=\"sidebar-show-more\">\n" +
    "                        <p>\n" +
    "                          more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "\n" +
    "                      <div class=\"sidebar-content-wrapper\">\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                              <button class=\"toggle toggle-mini is-active\">Anonymous</button>\n" +
    "                              <button class=\"toggle toggle-mini\">oauth_2_0</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-uri-parameters\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-method\">GET</p>\n" +
    "\n" +
    "                            <div class=\"sidebar-method-content\">\n" +
    "                              <p class=\"sidebar-url\">https://api.github.com/notifications</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"mediaTypeExtension\" class=\"sidebar-label\">mediaTypeExtension</label>\n" +
    "                              <input id=\"mediaTypeExtension\" class=\"sidebar-input\" value=\".json\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-headers\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-input-container sidebar-input-container-custom\">\n" +
    "                              <button class=\"sidebar-input-delete\"><span class=\"visuallyhidden\">Delete header</span></button>\n" +
    "                              <label for=\"custom-header\" class=\"sidebar-label sidebar-label-custom\">\n" +
    "                                <input class=\"sidebar-custom-input-for-label\" placeholder=\"custom header key\">\n" +
    "                              </label>\n" +
    "                              <input id=\"custom-header\" class=\"sidebar-input sidebar-input-custom\" placeholder=\"custom value\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"accept\" class=\"sidebar-label\">Accept</label>\n" +
    "                              <input id=\"accept\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-media-type\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Media-Type\" class=\"sidebar-label\">X-GitHub-Media-Type</label>\n" +
    "                              <input id=\"X-GitHub-Media-Type\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-request-id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Request-Id\" class=\"sidebar-label\">X-GitHub-Request-Id</label>\n" +
    "                              <input id=\"X-GitHub-Request-Id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Limit\" class=\"sidebar-label\">X-RateLimit-Limit</label>\n" +
    "                              <input id=\"X-RateLimit-Limit\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Remaining\" class=\"sidebar-label\">X-RateLimit-Remaining</label>\n" +
    "                              <input id=\"X-RateLimit-Remaining\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Reset\" class=\"sidebar-label\">X-RateLimit-Reset</label>\n" +
    "                              <input id=\"X-RateLimit-Reset\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"all\" class=\"sidebar-label\">all</label>\n" +
    "                              <input id=\"all\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-participating\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"participating\" class=\"sidebar-label\">participating</label>\n" +
    "                              <input id=\"participating\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since\" class=\"sidebar-label\">since</label>\n" +
    "                              <input id=\"since\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-max_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"max_id\" class=\"sidebar-label\">max_id</label>\n" +
    "                              <input id=\"max_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since_id\" class=\"sidebar-label\">since_id</label>\n" +
    "                              <input id=\"since_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-trim_user\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"trim_user\" class=\"sidebar-label\">trim_user</label>\n" +
    "                              <input id=\"trim_user\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Request URI</h4>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-response-item sidebar-request-url\">https://api.github.com/notifications?<b>all</b>=<i>true</i></p>\n" +
    "\n" +
    "                            <div class=\"sidebar-action-group\">\n" +
    "                              <button class=\"sidebar-action sidebar-action-get\">GET</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-clear\">Clear</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-reset\">Reset</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                              <button class=\"sidebar-expand-btn is-collapsed js-toggle-request-metadata\">\n" +
    "                                Request\n" +
    "                              </button>\n" +
    "                            </h3>\n" +
    "                            <button class=\"resource-btn\">Copy</button>\n" +
    "                          </header>\n" +
    "                          <div class=\"sidebar-request-metadata\">\n" +
    "\n" +
    "                            <div class=\"sidebar-row\">\n" +
    "                              <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                              <div class=\"sidebar-response-item\">\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>Accept:</b> <br>bytes\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Media-Type:</b> <br>keep-alive\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Request-Id:</b> <br>gzip\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Limit:</b> <br>86\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Remaining:</b> <br>application/json; charset=utf-8\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Reset:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                                </p>\n" +
    "                              </div>\n" +
    "\n" +
    "                              <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                              <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head\">Response</h3>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "                            <p class=\"sidebar-response-item\">200</p>\n" +
    "\n" +
    "                            <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                            <div class=\"sidebar-response-item\">\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>accept-ranges:</b> <br>bytes\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>connection:</b> <br>keep-alive\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-encoding:</b> <br>gzip\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-length:</b> <br>86\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-type:</b> <br>application/json; charset=utf-8\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>date:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>strict-transport-security:</b> <br>max-age=631138519\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>x-varnish-cache:</b> <br>MISS\n" +
    "                              </p>\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "\n" +
    "                          <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                          <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                        </div>\n" +
    "                      </section>\n" +
    "                    </div>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to intermediate view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to full-screen/full-width view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"resource-panel-primary\">\n" +
    "                <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "                  <div class=\"resource-panel-description\">\n" +
    "                    <p class=\"description\">Whenever humanity seems condemned to heaviness, I think I should fly like Perseus into a different space.</p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "                    <li class=\"flag\"><b>Type:</b> collection</li>\n" +
    "                    <li class=\"flag\"><b>Trait:</b> filterable</li>\n" +
    "                  </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "                  <div class=\"toggle-tabs resource-panel-toggle-tabs\">\n" +
    "                    <a href=\"#\" class=\"toggle-tab is-active\">Request</a><a href=\"#\" class=\"toggle-tab\">Response</a>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Request -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "                  <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "                  <p>List your notifications. List all notifications for the current user, grouped by repository.</p>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-uri-parameters-mediatypeextension\">\n" +
    "                      <h4 class=\"resource-param-heading\">mediaTypeExtension <span class=\"resource-param-instructional\">required, one of (.json)</span></h4>\n" +
    "                      <p>Use .json to specify application/json media type.</p>\n" +
    "\n" +
    "                      <p>\n" +
    "                        <span class=\"resource-param-example\"><b>Example:</b> .json</span>\n" +
    "                      </p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">Accept <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Is used to set specified media type.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Media-Type <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>You can check the current version of media type in responses.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Request-Id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-limit\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Limit <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-remaining\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Remaining <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-reset\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Reset <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\" id=\"docs-query-parameters\">\n" +
    "                    <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">all <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show notifications marked as read.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">participating <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show only notifications in which the user is directly participating or mentioned.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Time filters out any notifications updated before the given time. The time should be passed in as UTC in the ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ. Example: \"2012-10-09T23:39:01Z\".</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">max_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID less than (that is, older than) or equal to the specified ID.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID greater than (that is, more recent than) the specified ID. There are limits to the number of Tweets which can be accessed through the API. If the limit of Tweets has occured since the sinceid, the sinceid will be forced to the oldest ID available.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">trim_user <span class=\"resource-param-instructional\">one of (0, 1, true, false, t, f)</span></h4>\n" +
    "\n" +
    "                      <p>When set to either true, t or 1, each tweet returned in a timeline will include a user object including only the status authors numerical ID. Omit this parameter to receive the complete user object.</p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Response -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "                  <div class=\"resource-response-jump\">\n" +
    "                    <p>\n" +
    "                      Jump to status\n" +
    "                      <span class=\"resource-btns\">\n" +
    "                        <button class=\"resource-btn\" href=\"#code200\">200</button>\n" +
    "                        <button class=\"resource-btn\" href=\"#code403\">403</button>\n" +
    "                      </span>\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <section class=\"resource-section resource-response-section\">\n" +
    "                    <a name=\"code200\"></a>\n" +
    "                    <h3 class=\"resource-heading-a\">Status 200</h3>\n" +
    "\n" +
    "                    <div class=\"resource-response\">\n" +
    "                      <h4 class=\"resource-body-heading\">\n" +
    "                        Body\n" +
    "                        <span class=\"flag\">application/json</span> <span class=\"flag\">text/plain</span>\n" +
    "                      </h4>\n" +
    "\n" +
    "                      <span>Example:</span>\n" +
    "                      <pre class=\"resource-pre\"><code>Some Code Here</code></pre>\n" +
    "\n" +
    "                      <p><button class=\"resource-btn js-schema-toggle\">Show Schema</button></p>\n" +
    "                      <pre class=\"resource-pre resource-pre-toggle\"><code>Some Code Here</code></pre>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <a name=\"code403\"></a>\n" +
    "                    <h3 class=\"resource-heading-a\">Status 403</h3>\n" +
    "\n" +
    "                    <div class=\"resource-response\">\n" +
    "                      <p>API rate limit exceeded. See <a href=\"http://developer.github.com/v3/#rate-limiting\">http://developer.github.com/v3/#rate-limiting</a> for details.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                  </div>\n" +
    "\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "          </li>\n" +
    "\n" +
    "          <li class=\"resource-list-item\">\n" +
    "            <div class=\"resource clearfix\">\n" +
    "              <div class=\"resource-path-container\">\n" +
    "                <h3 class=\"resource-heading\">\n" +
    "                  /notifications/threads/{id}<span class=\"resource-path-active\">/subscription</span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <span class=\"flag resource-heading-flag\"><b>Type:</b> item</span>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"tab-list\">\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-get\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">GET</span>\n" +
    "                </a>\n" +
    "\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-put\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">PUT</span>\n" +
    "                </a>\n" +
    "\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-delete\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">DELETE</span>\n" +
    "                </a>\n" +
    "              </div>\n" +
    "\n" +
    "              <button class=\"resource-close-btn\">\n" +
    "                Close\n" +
    "              </button>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"resource-panel\">\n" +
    "              <div class=\"resource-panel-wrapper\">\n" +
    "                <div class=\"sidebar\">\n" +
    "                  <div class=\"sidebar-flex-wrapper\">\n" +
    "                    <div class=\"sidebar-content\">\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head\">\n" +
    "                          Try it\n" +
    "                          <a href=\"#\" class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\">\n" +
    "                            <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                            <span class=\"visuallyhidden\">Expand</span>\n" +
    "                          </a>\n" +
    "                        </h3>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <!-- Show more -->\n" +
    "                      <div class=\"sidebar-show-more\">\n" +
    "                        <p>\n" +
    "                          more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "\n" +
    "                      <div class=\"sidebar-content-wrapper\">\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                              <button class=\"toggle toggle-mini is-active\">Anonymous</button>\n" +
    "                              <button class=\"toggle toggle-mini\">oauth_2_0</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-uri-parameters\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-method\">GET</p>\n" +
    "\n" +
    "                            <div class=\"sidebar-method-content\">\n" +
    "                              <p class=\"sidebar-url\">https://api.github.com/notifications</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"mediaTypeExtension\" class=\"sidebar-label\">mediaTypeExtension</label>\n" +
    "                              <input id=\"mediaTypeExtension\" class=\"sidebar-input\" value=\".json\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-headers\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-input-container sidebar-input-container-custom\">\n" +
    "                              <button class=\"sidebar-input-delete\"><span class=\"visuallyhidden\">Delete header</span></button>\n" +
    "                              <label for=\"custom-header\" class=\"sidebar-label sidebar-label-custom\">\n" +
    "                                <input class=\"sidebar-custom-input-for-label\" placeholder=\"custom header key\">\n" +
    "                              </label>\n" +
    "                              <input id=\"custom-header\" class=\"sidebar-input sidebar-input-custom\" placeholder=\"custom value\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"accept\" class=\"sidebar-label\">Accept</label>\n" +
    "                              <input id=\"accept\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-media-type\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Media-Type\" class=\"sidebar-label\">X-GitHub-Media-Type</label>\n" +
    "                              <input id=\"X-GitHub-Media-Type\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-request-id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Request-Id\" class=\"sidebar-label\">X-GitHub-Request-Id</label>\n" +
    "                              <input id=\"X-GitHub-Request-Id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Limit\" class=\"sidebar-label\">X-RateLimit-Limit</label>\n" +
    "                              <input id=\"X-RateLimit-Limit\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Remaining\" class=\"sidebar-label\">X-RateLimit-Remaining</label>\n" +
    "                              <input id=\"X-RateLimit-Remaining\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Reset\" class=\"sidebar-label\">X-RateLimit-Reset</label>\n" +
    "                              <input id=\"X-RateLimit-Reset\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"all\" class=\"sidebar-label\">all</label>\n" +
    "                              <input id=\"all\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-participating\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"participating\" class=\"sidebar-label\">participating</label>\n" +
    "                              <input id=\"participating\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since\" class=\"sidebar-label\">since</label>\n" +
    "                              <input id=\"since\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-max_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"max_id\" class=\"sidebar-label\">max_id</label>\n" +
    "                              <input id=\"max_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since_id\" class=\"sidebar-label\">since_id</label>\n" +
    "                              <input id=\"since_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-trim_user\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"trim_user\" class=\"sidebar-label\">trim_user</label>\n" +
    "                              <input id=\"trim_user\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Request URI</h4>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-response-item sidebar-request-url\">https://api.github.com/notifications?<b>all</b>=<i>true</i></p>\n" +
    "\n" +
    "                            <div class=\"sidebar-action-group\">\n" +
    "                              <button class=\"sidebar-action sidebar-action-get\">GET</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-clear\">Clear</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-reset\">Reset</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                              <button class=\"sidebar-expand-btn is-collapsed js-toggle-request-metadata\">\n" +
    "                                Request\n" +
    "                              </button>\n" +
    "                            </h3>\n" +
    "                            <button class=\"resource-btn\">Copy</button>\n" +
    "                          </header>\n" +
    "                          <div class=\"sidebar-request-metadata\">\n" +
    "\n" +
    "                            <div class=\"sidebar-row\">\n" +
    "                              <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                              <div class=\"sidebar-response-item\">\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>Accept:</b> <br>bytes\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Media-Type:</b> <br>keep-alive\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Request-Id:</b> <br>gzip\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Limit:</b> <br>86\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Remaining:</b> <br>application/json; charset=utf-8\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Reset:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                                </p>\n" +
    "                              </div>\n" +
    "\n" +
    "                              <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                              <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head\">Response</h3>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "                            <p class=\"sidebar-response-item\">200</p>\n" +
    "\n" +
    "                            <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                            <div class=\"sidebar-response-item\">\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>accept-ranges:</b> <br>bytes\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>connection:</b> <br>keep-alive\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-encoding:</b> <br>gzip\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-length:</b> <br>86\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-type:</b> <br>application/json; charset=utf-8\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>date:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>strict-transport-security:</b> <br>max-age=631138519\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>x-varnish-cache:</b> <br>MISS\n" +
    "                              </p>\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "\n" +
    "                          <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                          <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                        </div>\n" +
    "                      </section>\n" +
    "                    </div>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to intermediate view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to full-screen/full-width view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"resource-panel-primary\">\n" +
    "                <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "                  <div class=\"resource-panel-description\">\n" +
    "                    <p class=\"description\">Whenever humanity seems condemned to heaviness, I think I should fly like Perseus into a different space.</p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "                    <li class=\"flag\"><b>Type:</b> collection</li>\n" +
    "                    <li class=\"flag\"><b>Trait:</b> filterable</li>\n" +
    "                  </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "                  <div class=\"toggle-tabs resource-panel-toggle-tabs\">\n" +
    "                    <a href=\"#\" class=\"toggle-tab is-active\">Request</a><a href=\"#\" class=\"toggle-tab\">Response</a>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Request -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "                  <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "                  <p>List your notifications. List all notifications for the current user, grouped by repository.</p>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-uri-parameters-mediatypeextension\">\n" +
    "                      <h4 class=\"resource-param-heading\">mediaTypeExtension <span class=\"resource-param-instructional\">required, one of (.json)</span></h4>\n" +
    "                      <p>Use .json to specify application/json media type.</p>\n" +
    "\n" +
    "                      <p>\n" +
    "                        <span class=\"resource-param-example\"><b>Example:</b> .json</span>\n" +
    "                      </p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">Accept <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Is used to set specified media type.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Media-Type <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>You can check the current version of media type in responses.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Request-Id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-limit\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Limit <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-remaining\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Remaining <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-reset\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Reset <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\" id=\"docs-query-parameters\">\n" +
    "                    <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">all <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show notifications marked as read.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">participating <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show only notifications in which the user is directly participating or mentioned.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Time filters out any notifications updated before the given time. The time should be passed in as UTC in the ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ. Example: \"2012-10-09T23:39:01Z\".</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">max_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID less than (that is, older than) or equal to the specified ID.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID greater than (that is, more recent than) the specified ID. There are limits to the number of Tweets which can be accessed through the API. If the limit of Tweets has occured since the sinceid, the sinceid will be forced to the oldest ID available.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">trim_user <span class=\"resource-param-instructional\">one of (0, 1, true, false, t, f)</span></h4>\n" +
    "\n" +
    "                      <p>When set to either true, t or 1, each tweet returned in a timeline will include a user object including only the status authors numerical ID. Omit this parameter to receive the complete user object.</p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Response -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "                  <div class=\"resource-response-jump\">\n" +
    "                    <p>\n" +
    "                      Jump to status\n" +
    "                      <span class=\"resource-btns\">\n" +
    "                        <button class=\"resource-btn\" href=\"#code200\">200</button>\n" +
    "                        <button class=\"resource-btn\" href=\"#code403\">403</button>\n" +
    "                      </span>\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <section class=\"resource-section resource-response-section\">\n" +
    "                    <a name=\"code200\"></a>\n" +
    "                    <h3 class=\"resource-heading-a\">Status 200</h3>\n" +
    "\n" +
    "                    <div class=\"resource-response\">\n" +
    "                      <h4 class=\"resource-body-heading\">\n" +
    "                        Body\n" +
    "                        <span class=\"flag\">application/json</span> <span class=\"flag\">text/plain</span>\n" +
    "                      </h4>\n" +
    "\n" +
    "                      <span>Example:</span>\n" +
    "                      <pre class=\"resource-pre\"><code>Some Code Here</code></pre>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <a name=\"code403\"></a>\n" +
    "                    <h3 class=\"resource-heading-a\">Status 403</h3>\n" +
    "\n" +
    "                    <div class=\"resource-response\">\n" +
    "                      <p>API rate limit exceeded. See <a href=\"http://developer.github.com/v3/#rate-limiting\">http://developer.github.com/v3/#rate-limiting</a> for details.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                  </div>\n" +
    "\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "          </li>\n" +
    "        </ol>\n" +
    "      </li>\n" +
    "\n" +
    "      <li class=\"resource-list-item\">\n" +
    "        <div class=\"resource resource-root clearfix\">\n" +
    "          <div class=\"resource-path-container\">\n" +
    "            <button class=\"resource-root-toggle\">\n" +
    "              <span class=\"visuallyhidden\">See Nested Resources</span>\n" +
    "            </button>\n" +
    "\n" +
    "            <h2 class=\"resource-heading resource-heading-large\">\n" +
    "              <span class=\"resource-path-active\">/gists</span>\n" +
    "            </h2>\n" +
    "\n" +
    "            <span class=\"flag resource-heading-flag resource-heading-flag-root\"><b>Type:</b> collection</span>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"tab-list\">\n" +
    "            <a class=\"tab\" href=\"#\">\n" +
    "              <svg class=\"tab-image tab-get\">\n" +
    "                <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "              </svg>\n" +
    "\n" +
    "              <span class=\"tab-label\">GET</span>\n" +
    "            </a>\n" +
    "\n" +
    "            <a class=\"tab\" href=\"#\">\n" +
    "              <svg class=\"tab-image tab-post\">\n" +
    "                <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "              </svg>\n" +
    "\n" +
    "              <span class=\"tab-label\">POST</span>\n" +
    "            </a>\n" +
    "\n" +
    "            <a class=\"tab\" href=\"#\">\n" +
    "              <svg class=\"tab-image tab-put\">\n" +
    "                <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "              </svg>\n" +
    "\n" +
    "              <span class=\"tab-label\">PUT</span>\n" +
    "            </a>\n" +
    "\n" +
    "            <a class=\"tab\" href=\"#\">\n" +
    "              <svg class=\"tab-image tab-delete\">\n" +
    "                <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "              </svg>\n" +
    "\n" +
    "              <span class=\"tab-label\">DELETE</span>\n" +
    "            </a>\n" +
    "          </div>\n" +
    "\n" +
    "          <button class=\"resource-close-btn\">\n" +
    "            Close\n" +
    "          </button>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"resource-panel\">\n" +
    "          <div class=\"resource-panel-wrapper\">\n" +
    "            <div class=\"sidebar\">\n" +
    "              <div class=\"sidebar-flex-wrapper\">\n" +
    "                <div class=\"sidebar-content\">\n" +
    "                  <header class=\"sidebar-row sidebar-header\">\n" +
    "                    <h3 class=\"sidebar-head\">\n" +
    "                      Try it\n" +
    "                      <a href=\"#\" class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\">\n" +
    "                        <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                        <span class=\"visuallyhidden\">Expand</span>\n" +
    "                      </a>\n" +
    "                    </h3>\n" +
    "                  </header>\n" +
    "\n" +
    "                  <!-- Show more -->\n" +
    "                  <div class=\"sidebar-show-more\">\n" +
    "                    <p>\n" +
    "                      more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <div class=\"sidebar-content-wrapper\">\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "                        <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "\n" +
    "                        <button class=\"sidebar-add-btn\">\n" +
    "                          <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                        </button>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                          <button class=\"toggle toggle-mini is-active\">Anonymous</button>\n" +
    "                          <button class=\"toggle toggle-mini\">oauth_2_0</button>\n" +
    "                        </div>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section id=\"sidebar-uri-parameters\">\n" +
    "                      <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                        <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "\n" +
    "                        <button class=\"sidebar-add-btn\">\n" +
    "                          <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                        </button>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <p class=\"sidebar-method\">GET</p>\n" +
    "\n" +
    "                        <div class=\"sidebar-method-content\">\n" +
    "                          <p class=\"sidebar-url\">https://api.github.com/notifications</p>\n" +
    "                        </div>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"mediaTypeExtension\" class=\"sidebar-label\">mediaTypeExtension</label>\n" +
    "                          <input id=\"mediaTypeExtension\" class=\"sidebar-input\" value=\".json\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section id=\"sidebar-headers\">\n" +
    "                      <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                        <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "\n" +
    "                        <button class=\"sidebar-add-btn\">\n" +
    "                          <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                        </button>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <p class=\"sidebar-input-container sidebar-input-container-custom\">\n" +
    "                          <button class=\"sidebar-input-delete\"><span class=\"visuallyhidden\">Delete header</span></button>\n" +
    "                          <label for=\"custom-header\" class=\"sidebar-label sidebar-label-custom\">\n" +
    "                            <input class=\"sidebar-custom-input-for-label\" placeholder=\"custom header key\">\n" +
    "                          </label>\n" +
    "                          <input id=\"custom-header\" class=\"sidebar-input sidebar-input-custom\" placeholder=\"custom value\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"accept\" class=\"sidebar-label\">Accept</label>\n" +
    "                          <input id=\"accept\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-headers-x-github-media-type\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-GitHub-Media-Type\" class=\"sidebar-label\">X-GitHub-Media-Type</label>\n" +
    "                          <input id=\"X-GitHub-Media-Type\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-headers-x-github-request-id\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-GitHub-Request-Id\" class=\"sidebar-label\">X-GitHub-Request-Id</label>\n" +
    "                          <input id=\"X-GitHub-Request-Id\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-RateLimit-Limit\" class=\"sidebar-label\">X-RateLimit-Limit</label>\n" +
    "                          <input id=\"X-RateLimit-Limit\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-RateLimit-Remaining\" class=\"sidebar-label\">X-RateLimit-Remaining</label>\n" +
    "                          <input id=\"X-RateLimit-Remaining\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"X-RateLimit-Reset\" class=\"sidebar-label\">X-RateLimit-Reset</label>\n" +
    "                          <input id=\"X-RateLimit-Reset\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                        <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "\n" +
    "                        <button class=\"sidebar-add-btn\">\n" +
    "                          <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                        </button>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"all\" class=\"sidebar-label\">all</label>\n" +
    "                          <input id=\"all\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-participating\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"participating\" class=\"sidebar-label\">participating</label>\n" +
    "                          <input id=\"participating\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-since\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"since\" class=\"sidebar-label\">since</label>\n" +
    "                          <input id=\"since\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-max_id\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"max_id\" class=\"sidebar-label\">max_id</label>\n" +
    "                          <input id=\"max_id\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-since_id\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"since_id\" class=\"sidebar-label\">since_id</label>\n" +
    "                          <input id=\"since_id\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "\n" +
    "                        <p id=\"sidebar-query-parameters-trim_user\" class=\"sidebar-input-container\">\n" +
    "                          <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                          <span class=\"sidebar-input-tooltip-container\">\n" +
    "                            <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                            <span class=\"sidebar-tooltip-flyout\">\n" +
    "                              <span>Use .json to specify application/json media type.</span>\n" +
    "                            </span>\n" +
    "                          </span>\n" +
    "                          <label for=\"trim_user\" class=\"sidebar-label\">trim_user</label>\n" +
    "                          <input id=\"trim_user\" class=\"sidebar-input\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                        <h4 class=\"sidebar-subhead\">Request URI</h4>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <p class=\"sidebar-response-item sidebar-request-url\">https://api.github.com/notifications?<b>all</b>=<i>true</i></p>\n" +
    "\n" +
    "                        <div class=\"sidebar-action-group\">\n" +
    "                          <button class=\"sidebar-action sidebar-action-get\">GET</button>\n" +
    "                          <button class=\"sidebar-action sidebar-action-clear\">Clear</button>\n" +
    "                          <button class=\"sidebar-action sidebar-action-reset\">Reset</button>\n" +
    "                        </div>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                          <button class=\"sidebar-expand-btn is-collapsed js-toggle-request-metadata\">\n" +
    "                            Request\n" +
    "                          </button>\n" +
    "                        </h3>\n" +
    "                        <button class=\"resource-btn\">Copy</button>\n" +
    "                      </header>\n" +
    "                      <div class=\"sidebar-request-metadata\">\n" +
    "\n" +
    "                        <div class=\"sidebar-row\">\n" +
    "                          <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                          <div class=\"sidebar-response-item\">\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>Accept:</b> <br>bytes\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-GitHub-Media-Type:</b> <br>keep-alive\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-GitHub-Request-Id:</b> <br>gzip\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-RateLimit-Limit:</b> <br>86\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-RateLimit-Remaining:</b> <br>application/json; charset=utf-8\n" +
    "                            </p>\n" +
    "                            <p class=\"sidebar-response-metadata\">\n" +
    "                              <b>X-RateLimit-Reset:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "\n" +
    "                          <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                          <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                        </div>\n" +
    "                      </div>\n" +
    "                    </section>\n" +
    "\n" +
    "                    <section>\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head\">Response</h3>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <div class=\"sidebar-row\">\n" +
    "                        <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "                        <p class=\"sidebar-response-item\">200</p>\n" +
    "\n" +
    "                        <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                        <div class=\"sidebar-response-item\">\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>accept-ranges:</b> <br>bytes\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>connection:</b> <br>keep-alive\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>content-encoding:</b> <br>gzip\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>content-length:</b> <br>86\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>content-type:</b> <br>application/json; charset=utf-8\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>date:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>strict-transport-security:</b> <br>max-age=631138519\n" +
    "                          </p>\n" +
    "                          <p class=\"sidebar-response-metadata\">\n" +
    "                            <b>x-varnish-cache:</b> <br>MISS\n" +
    "                          </p>\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "\n" +
    "                      <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                      <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "              <!-- Sidebar control to intermediate view -->\n" +
    "              <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\">\n" +
    "                <button class=\"collapse\">\n" +
    "                  <span class=\"discoverable\">Try it</span>\n" +
    "                  <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                </button>\n" +
    "              </div>\n" +
    "\n" +
    "              <!-- Sidebar control to full-screen/full-width view -->\n" +
    "              <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "                <button class=\"collapse\">\n" +
    "                  <span class=\"discoverable\">Try it</span>\n" +
    "                  <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                </button>\n" +
    "              </div>\n" +
    "\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"resource-panel-primary\">\n" +
    "            <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "              <div class=\"resource-panel-description\">\n" +
    "                <p class=\"description\">Whenever humanity seems condemned to heaviness, I think I should fly like Perseus into a different space.</p>\n" +
    "              </div>\n" +
    "\n" +
    "              <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "                <li class=\"flag\"><b>Type:</b> collection</li>\n" +
    "                <li class=\"flag\"><b>Trait:</b> filterable</li>\n" +
    "              </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "              <div class=\"toggle-tabs resource-panel-toggle-tabs\">\n" +
    "                <a href=\"#\" class=\"toggle-tab is-active\">Request</a><a href=\"#\" class=\"toggle-tab\">Response</a>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Request -->\n" +
    "            <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "              <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "              <p>List your notifications. List all notifications for the current user, grouped by repository.</p>\n" +
    "\n" +
    "              <section class=\"resource-section\">\n" +
    "                <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "                <div class=\"resource-param\" id=\"docs-uri-parameters-mediatypeextension\">\n" +
    "                  <h4 class=\"resource-param-heading\">mediaTypeExtension <span class=\"resource-param-instructional\">required, one of (.json)</span></h4>\n" +
    "                  <p>Use .json to specify application/json media type.</p>\n" +
    "\n" +
    "                  <p>\n" +
    "                    <span class=\"resource-param-example\"><b>Example:</b> .json</span>\n" +
    "                  </p>\n" +
    "                </div>\n" +
    "              </section>\n" +
    "\n" +
    "              <section class=\"resource-section\">\n" +
    "                <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">Accept <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>Is used to set specified media type.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-GitHub-Media-Type <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>You can check the current version of media type in responses.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-GitHub-Request-Id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-limit\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-RateLimit-Limit <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-remaining\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-RateLimit-Remaining <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-reset\">\n" +
    "                  <h4 class=\"resource-param-heading\">X-RateLimit-Reset <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                </div>\n" +
    "              </section>\n" +
    "\n" +
    "              <section class=\"resource-section\" id=\"docs-query-parameters\">\n" +
    "                <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">all <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>True to show notifications marked as read.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">participating <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>True to show only notifications in which the user is directly participating or mentioned.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">since <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                  <p>Time filters out any notifications updated before the given time. The time should be passed in as UTC in the ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ. Example: \"2012-10-09T23:39:01Z\".</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">max_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                  <p>Returns results with an ID less than (that is, older than) or equal to the specified ID.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">since_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                  <p>Returns results with an ID greater than (that is, more recent than) the specified ID. There are limits to the number of Tweets which can be accessed through the API. If the limit of Tweets has occured since the sinceid, the sinceid will be forced to the oldest ID available.</p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-param\">\n" +
    "                  <h4 class=\"resource-param-heading\">trim_user <span class=\"resource-param-instructional\">one of (0, 1, true, false, t, f)</span></h4>\n" +
    "\n" +
    "                  <p>When set to either true, t or 1, each tweet returned in a timeline will include a user object including only the status authors numerical ID. Omit this parameter to receive the complete user object.</p>\n" +
    "                </div>\n" +
    "              </section>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Response -->\n" +
    "            <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "              <div class=\"resource-response-jump\">\n" +
    "                <p>\n" +
    "                  Jump to status\n" +
    "                  <span class=\"resource-btns\">\n" +
    "                    <button class=\"resource-btn\" href=\"#code200\">200</button>\n" +
    "                    <button class=\"resource-btn\" href=\"#code403\">403</button>\n" +
    "                  </span>\n" +
    "                </p>\n" +
    "              </div>\n" +
    "\n" +
    "              <section class=\"resource-section resource-response-section\">\n" +
    "                <a name=\"code200\"></a>\n" +
    "                <h3 class=\"resource-heading-a\">Status 200</h3>\n" +
    "\n" +
    "                <div class=\"resource-response\">\n" +
    "                  <h4 class=\"resource-body-heading\">\n" +
    "                    Body\n" +
    "                    <span class=\"flag\">application/json</span> <span class=\"flag\">text/plain</span>\n" +
    "                  </h4>\n" +
    "\n" +
    "                  <span>Example:</span>\n" +
    "                  <pre class=\"resource-pre\"><code>Some Code Here</code></pre>\n" +
    "                </div>\n" +
    "              </section>\n" +
    "\n" +
    "              <section class=\"resource-section\">\n" +
    "                <a name=\"code403\"></a>\n" +
    "                <h3 class=\"resource-heading-a\">Status 403</h3>\n" +
    "\n" +
    "                <div class=\"resource-response\">\n" +
    "                  <p>API rate limit exceeded. See <a href=\"http://developer.github.com/v3/#rate-limiting\">http://developer.github.com/v3/#rate-limiting</a> for details.</p>\n" +
    "                </div>\n" +
    "\n" +
    "              </div>\n" +
    "\n" +
    "\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <ol class=\"resource-list\">\n" +
    "          <li class=\"resource-list-item\">\n" +
    "            <div class=\"resource clearfix\">\n" +
    "              <div class=\"resource-path-container\">\n" +
    "                <h3 class=\"resource-heading\">\n" +
    "                  /gists<span class=\"resource-path-active\">/public</span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <span class=\"flag resource-heading-flag\"><b>Type:</b> collection</span>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"tab-list\">\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-get\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">GET</span>\n" +
    "                </a>\n" +
    "              </div>\n" +
    "\n" +
    "              <button class=\"resource-close-btn\">\n" +
    "                Close\n" +
    "              </button>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"resource-panel\">\n" +
    "              <div class=\"resource-panel-wrapper\">\n" +
    "                <div class=\"sidebar\">\n" +
    "                  <div class=\"sidebar-flex-wrapper\">\n" +
    "                    <div class=\"sidebar-content\">\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head\">\n" +
    "                          Try it\n" +
    "                          <a href=\"#\" class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\">\n" +
    "                            <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                            <span class=\"visuallyhidden\">Expand</span>\n" +
    "                          </a>\n" +
    "                        </h3>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <!-- Show more -->\n" +
    "                      <div class=\"sidebar-show-more\">\n" +
    "                        <p>\n" +
    "                          more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "\n" +
    "                      <div class=\"sidebar-content-wrapper\">\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                              <button class=\"toggle toggle-mini is-active\">Anonymous</button>\n" +
    "                              <button class=\"toggle toggle-mini\">oauth_2_0</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-uri-parameters\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-method\">GET</p>\n" +
    "\n" +
    "                            <div class=\"sidebar-method-content\">\n" +
    "                              <p class=\"sidebar-url\">https://api.github.com/notifications</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"mediaTypeExtension\" class=\"sidebar-label\">mediaTypeExtension</label>\n" +
    "                              <input id=\"mediaTypeExtension\" class=\"sidebar-input\" value=\".json\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-headers\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-input-container sidebar-input-container-custom\">\n" +
    "                              <button class=\"sidebar-input-delete\"><span class=\"visuallyhidden\">Delete header</span></button>\n" +
    "                              <label for=\"custom-header\" class=\"sidebar-label sidebar-label-custom\">\n" +
    "                                <input class=\"sidebar-custom-input-for-label\" placeholder=\"custom header key\">\n" +
    "                              </label>\n" +
    "                              <input id=\"custom-header\" class=\"sidebar-input sidebar-input-custom\" placeholder=\"custom value\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"accept\" class=\"sidebar-label\">Accept</label>\n" +
    "                              <input id=\"accept\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-media-type\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Media-Type\" class=\"sidebar-label\">X-GitHub-Media-Type</label>\n" +
    "                              <input id=\"X-GitHub-Media-Type\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-request-id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Request-Id\" class=\"sidebar-label\">X-GitHub-Request-Id</label>\n" +
    "                              <input id=\"X-GitHub-Request-Id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Limit\" class=\"sidebar-label\">X-RateLimit-Limit</label>\n" +
    "                              <input id=\"X-RateLimit-Limit\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Remaining\" class=\"sidebar-label\">X-RateLimit-Remaining</label>\n" +
    "                              <input id=\"X-RateLimit-Remaining\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Reset\" class=\"sidebar-label\">X-RateLimit-Reset</label>\n" +
    "                              <input id=\"X-RateLimit-Reset\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"all\" class=\"sidebar-label\">all</label>\n" +
    "                              <input id=\"all\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-participating\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"participating\" class=\"sidebar-label\">participating</label>\n" +
    "                              <input id=\"participating\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since\" class=\"sidebar-label\">since</label>\n" +
    "                              <input id=\"since\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-max_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"max_id\" class=\"sidebar-label\">max_id</label>\n" +
    "                              <input id=\"max_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since_id\" class=\"sidebar-label\">since_id</label>\n" +
    "                              <input id=\"since_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-trim_user\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"trim_user\" class=\"sidebar-label\">trim_user</label>\n" +
    "                              <input id=\"trim_user\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Request URI</h4>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-response-item sidebar-request-url\">https://api.github.com/notifications?<b>all</b>=<i>true</i></p>\n" +
    "\n" +
    "                            <div class=\"sidebar-action-group\">\n" +
    "                              <button class=\"sidebar-action sidebar-action-get\">GET</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-clear\">Clear</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-reset\">Reset</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                              <button class=\"sidebar-expand-btn is-collapsed js-toggle-request-metadata\">\n" +
    "                                Request\n" +
    "                              </button>\n" +
    "                            </h3>\n" +
    "                            <button class=\"resource-btn\">Copy</button>\n" +
    "                          </header>\n" +
    "                          <div class=\"sidebar-request-metadata\">\n" +
    "\n" +
    "                            <div class=\"sidebar-row\">\n" +
    "                              <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                              <div class=\"sidebar-response-item\">\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>Accept:</b> <br>bytes\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Media-Type:</b> <br>keep-alive\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Request-Id:</b> <br>gzip\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Limit:</b> <br>86\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Remaining:</b> <br>application/json; charset=utf-8\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Reset:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                                </p>\n" +
    "                              </div>\n" +
    "\n" +
    "                              <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                              <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head\">Response</h3>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "                            <p class=\"sidebar-response-item\">200</p>\n" +
    "\n" +
    "                            <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                            <div class=\"sidebar-response-item\">\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>accept-ranges:</b> <br>bytes\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>connection:</b> <br>keep-alive\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-encoding:</b> <br>gzip\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-length:</b> <br>86\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-type:</b> <br>application/json; charset=utf-8\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>date:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>strict-transport-security:</b> <br>max-age=631138519\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>x-varnish-cache:</b> <br>MISS\n" +
    "                              </p>\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "\n" +
    "                          <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                          <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                        </div>\n" +
    "                      </section>\n" +
    "                    </div>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to intermediate view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to full-screen/full-width view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"resource-panel-primary\">\n" +
    "                <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "                  <div class=\"resource-panel-description\">\n" +
    "                    <p class=\"description\">Whenever humanity seems condemned to heaviness, I think I should fly like Perseus into a different space.</p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "                    <li class=\"flag\"><b>Type:</b> collection</li>\n" +
    "                    <li class=\"flag\"><b>Trait:</b> filterable</li>\n" +
    "                  </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "                  <div class=\"toggle-tabs resource-panel-toggle-tabs\">\n" +
    "                    <a href=\"#\" class=\"toggle-tab is-active\">Request</a><a href=\"#\" class=\"toggle-tab\">Response</a>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Request -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "                  <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "                  <p>List your notifications. List all notifications for the current user, grouped by repository.</p>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-uri-parameters-mediatypeextension\">\n" +
    "                      <h4 class=\"resource-param-heading\">mediaTypeExtension <span class=\"resource-param-instructional\">required, one of (.json)</span></h4>\n" +
    "                      <p>Use .json to specify application/json media type.</p>\n" +
    "\n" +
    "                      <p>\n" +
    "                        <span class=\"resource-param-example\"><b>Example:</b> .json</span>\n" +
    "                      </p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">Accept <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Is used to set specified media type.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Media-Type <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>You can check the current version of media type in responses.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Request-Id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-limit\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Limit <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-remaining\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Remaining <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-reset\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Reset <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\" id=\"docs-query-parameters\">\n" +
    "                    <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">all <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show notifications marked as read.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">participating <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show only notifications in which the user is directly participating or mentioned.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Time filters out any notifications updated before the given time. The time should be passed in as UTC in the ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ. Example: \"2012-10-09T23:39:01Z\".</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">max_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID less than (that is, older than) or equal to the specified ID.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID greater than (that is, more recent than) the specified ID. There are limits to the number of Tweets which can be accessed through the API. If the limit of Tweets has occured since the sinceid, the sinceid will be forced to the oldest ID available.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">trim_user <span class=\"resource-param-instructional\">one of (0, 1, true, false, t, f)</span></h4>\n" +
    "\n" +
    "                      <p>When set to either true, t or 1, each tweet returned in a timeline will include a user object including only the status authors numerical ID. Omit this parameter to receive the complete user object.</p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Response -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "                  <div class=\"resource-response-jump\">\n" +
    "                    <p>\n" +
    "                      Jump to status\n" +
    "                      <span class=\"resource-btns\">\n" +
    "                        <button class=\"resource-btn\" href=\"#code200\">200</button>\n" +
    "                        <button class=\"resource-btn\" href=\"#code403\">403</button>\n" +
    "                      </span>\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <section class=\"resource-section resource-response-section\">\n" +
    "                    <a name=\"code200\"></a>\n" +
    "                    <h3 class=\"resource-heading-a\">Status 200</h3>\n" +
    "\n" +
    "                    <div class=\"resource-response\">\n" +
    "                      <h4 class=\"resource-body-heading\">\n" +
    "                        Body\n" +
    "                        <span class=\"flag\">application/json</span> <span class=\"flag\">text/plain</span>\n" +
    "                      </h4>\n" +
    "\n" +
    "                      <span>Example:</span>\n" +
    "                      <pre class=\"resource-pre\"><code>Some Code Here</code></pre>\n" +
    "\n" +
    "                      <p><button class=\"resource-btn js-schema-toggle\">Show Schema</button></p>\n" +
    "                      <pre class=\"resource-pre resource-pre-toggle\"><code>Some Code Here</code></pre>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <a name=\"code403\"></a>\n" +
    "                    <h3 class=\"resource-heading-a\">Status 403</h3>\n" +
    "\n" +
    "                    <div class=\"resource-response\">\n" +
    "                      <p>API rate limit exceeded. See <a href=\"http://developer.github.com/v3/#rate-limiting\">http://developer.github.com/v3/#rate-limiting</a> for details.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                  </div>\n" +
    "\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "          </li>\n" +
    "\n" +
    "          <li class=\"resource-list-item\">\n" +
    "            <div class=\"resource clearfix\">\n" +
    "              <div class=\"resource-path-container\">\n" +
    "                <h3 class=\"resource-heading\">\n" +
    "                  /gists<span class=\"resource-path-active\">/starred</span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <span class=\"flag resource-heading-flag\"><b>Type:</b> collection</span>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"tab-list\">\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-get\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">GET</span>\n" +
    "                </a>\n" +
    "              </div>\n" +
    "\n" +
    "              <button class=\"resource-close-btn\">\n" +
    "                Close\n" +
    "              </button>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"resource-panel\">\n" +
    "              <div class=\"resource-panel-wrapper\">\n" +
    "                <div class=\"sidebar\">\n" +
    "                  <div class=\"sidebar-flex-wrapper\">\n" +
    "                    <div class=\"sidebar-content\">\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head\">\n" +
    "                          Try it\n" +
    "                          <a href=\"#\" class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\">\n" +
    "                            <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                            <span class=\"visuallyhidden\">Expand</span>\n" +
    "                          </a>\n" +
    "                        </h3>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <!-- Show more -->\n" +
    "                      <div class=\"sidebar-show-more\">\n" +
    "                        <p>\n" +
    "                          more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "\n" +
    "                      <div class=\"sidebar-content-wrapper\">\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                              <button class=\"toggle toggle-mini is-active\">Anonymous</button>\n" +
    "                              <button class=\"toggle toggle-mini\">oauth_2_0</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-uri-parameters\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-method\">GET</p>\n" +
    "\n" +
    "                            <div class=\"sidebar-method-content\">\n" +
    "                              <p class=\"sidebar-url\">https://api.github.com/notifications</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"mediaTypeExtension\" class=\"sidebar-label\">mediaTypeExtension</label>\n" +
    "                              <input id=\"mediaTypeExtension\" class=\"sidebar-input\" value=\".json\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-headers\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-input-container sidebar-input-container-custom\">\n" +
    "                              <button class=\"sidebar-input-delete\"><span class=\"visuallyhidden\">Delete header</span></button>\n" +
    "                              <label for=\"custom-header\" class=\"sidebar-label sidebar-label-custom\">\n" +
    "                                <input class=\"sidebar-custom-input-for-label\" placeholder=\"custom header key\">\n" +
    "                              </label>\n" +
    "                              <input id=\"custom-header\" class=\"sidebar-input sidebar-input-custom\" placeholder=\"custom value\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"accept\" class=\"sidebar-label\">Accept</label>\n" +
    "                              <input id=\"accept\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-media-type\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Media-Type\" class=\"sidebar-label\">X-GitHub-Media-Type</label>\n" +
    "                              <input id=\"X-GitHub-Media-Type\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-request-id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Request-Id\" class=\"sidebar-label\">X-GitHub-Request-Id</label>\n" +
    "                              <input id=\"X-GitHub-Request-Id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Limit\" class=\"sidebar-label\">X-RateLimit-Limit</label>\n" +
    "                              <input id=\"X-RateLimit-Limit\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Remaining\" class=\"sidebar-label\">X-RateLimit-Remaining</label>\n" +
    "                              <input id=\"X-RateLimit-Remaining\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Reset\" class=\"sidebar-label\">X-RateLimit-Reset</label>\n" +
    "                              <input id=\"X-RateLimit-Reset\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"all\" class=\"sidebar-label\">all</label>\n" +
    "                              <input id=\"all\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-participating\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"participating\" class=\"sidebar-label\">participating</label>\n" +
    "                              <input id=\"participating\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since\" class=\"sidebar-label\">since</label>\n" +
    "                              <input id=\"since\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-max_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"max_id\" class=\"sidebar-label\">max_id</label>\n" +
    "                              <input id=\"max_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since_id\" class=\"sidebar-label\">since_id</label>\n" +
    "                              <input id=\"since_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-trim_user\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"trim_user\" class=\"sidebar-label\">trim_user</label>\n" +
    "                              <input id=\"trim_user\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Request URI</h4>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-response-item sidebar-request-url\">https://api.github.com/notifications?<b>all</b>=<i>true</i></p>\n" +
    "\n" +
    "                            <div class=\"sidebar-action-group\">\n" +
    "                              <button class=\"sidebar-action sidebar-action-get\">GET</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-clear\">Clear</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-reset\">Reset</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                              <button class=\"sidebar-expand-btn is-collapsed js-toggle-request-metadata\">\n" +
    "                                Request\n" +
    "                              </button>\n" +
    "                            </h3>\n" +
    "                            <button class=\"resource-btn\">Copy</button>\n" +
    "                          </header>\n" +
    "                          <div class=\"sidebar-request-metadata\">\n" +
    "\n" +
    "                            <div class=\"sidebar-row\">\n" +
    "                              <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                              <div class=\"sidebar-response-item\">\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>Accept:</b> <br>bytes\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Media-Type:</b> <br>keep-alive\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Request-Id:</b> <br>gzip\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Limit:</b> <br>86\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Remaining:</b> <br>application/json; charset=utf-8\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Reset:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                                </p>\n" +
    "                              </div>\n" +
    "\n" +
    "                              <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                              <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head\">Response</h3>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "                            <p class=\"sidebar-response-item\">200</p>\n" +
    "\n" +
    "                            <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                            <div class=\"sidebar-response-item\">\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>accept-ranges:</b> <br>bytes\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>connection:</b> <br>keep-alive\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-encoding:</b> <br>gzip\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-length:</b> <br>86\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-type:</b> <br>application/json; charset=utf-8\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>date:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>strict-transport-security:</b> <br>max-age=631138519\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>x-varnish-cache:</b> <br>MISS\n" +
    "                              </p>\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "\n" +
    "                          <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                          <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                        </div>\n" +
    "                      </section>\n" +
    "                    </div>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to intermediate view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to full-screen/full-width view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"resource-panel-primary\">\n" +
    "                <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "                  <div class=\"resource-panel-description\">\n" +
    "                    <p class=\"description\">Whenever humanity seems condemned to heaviness, I think I should fly like Perseus into a different space.</p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "                    <li class=\"flag\"><b>Type:</b> collection</li>\n" +
    "                    <li class=\"flag\"><b>Trait:</b> filterable</li>\n" +
    "                  </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "                  <div class=\"toggle-tabs resource-panel-toggle-tabs\">\n" +
    "                    <a href=\"#\" class=\"toggle-tab is-active\">Request</a><a href=\"#\" class=\"toggle-tab\">Response</a>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Request -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "                  <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "                  <p>List your notifications. List all notifications for the current user, grouped by repository.</p>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-uri-parameters-mediatypeextension\">\n" +
    "                      <h4 class=\"resource-param-heading\">mediaTypeExtension <span class=\"resource-param-instructional\">required, one of (.json)</span></h4>\n" +
    "                      <p>Use .json to specify application/json media type.</p>\n" +
    "\n" +
    "                      <p>\n" +
    "                        <span class=\"resource-param-example\"><b>Example:</b> .json</span>\n" +
    "                      </p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">Accept <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Is used to set specified media type.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Media-Type <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>You can check the current version of media type in responses.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Request-Id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-limit\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Limit <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-remaining\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Remaining <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-reset\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Reset <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\" id=\"docs-query-parameters\">\n" +
    "                    <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">all <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show notifications marked as read.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">participating <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show only notifications in which the user is directly participating or mentioned.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Time filters out any notifications updated before the given time. The time should be passed in as UTC in the ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ. Example: \"2012-10-09T23:39:01Z\".</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">max_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID less than (that is, older than) or equal to the specified ID.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID greater than (that is, more recent than) the specified ID. There are limits to the number of Tweets which can be accessed through the API. If the limit of Tweets has occured since the sinceid, the sinceid will be forced to the oldest ID available.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">trim_user <span class=\"resource-param-instructional\">one of (0, 1, true, false, t, f)</span></h4>\n" +
    "\n" +
    "                      <p>When set to either true, t or 1, each tweet returned in a timeline will include a user object including only the status authors numerical ID. Omit this parameter to receive the complete user object.</p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Response -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "                  <div class=\"resource-response-jump\">\n" +
    "                    <p>\n" +
    "                      Jump to status\n" +
    "                      <span class=\"resource-btns\">\n" +
    "                        <button class=\"resource-btn\" href=\"#code200\">200</button>\n" +
    "                        <button class=\"resource-btn\" href=\"#code403\">403</button>\n" +
    "                      </span>\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <section class=\"resource-section resource-response-section\">\n" +
    "                    <a name=\"code200\"></a>\n" +
    "                    <h3 class=\"resource-heading-a\">Status 200</h3>\n" +
    "\n" +
    "                    <div class=\"resource-response\">\n" +
    "                      <h4 class=\"resource-body-heading\">\n" +
    "                        Body\n" +
    "                        <span class=\"flag\">application/json</span> <span class=\"flag\">text/plain</span>\n" +
    "                      </h4>\n" +
    "\n" +
    "                      <span>Example:</span>\n" +
    "                      <pre class=\"resource-pre\"><code>Some Code Here</code></pre>\n" +
    "\n" +
    "                      <p><button class=\"resource-btn js-schema-toggle\">Show Schema</button></p>\n" +
    "                      <pre class=\"resource-pre resource-pre-toggle\"><code>Somoe Code Here</code></pre>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <a name=\"code403\"></a>\n" +
    "                    <h3 class=\"resource-heading-a\">Status 403</h3>\n" +
    "\n" +
    "                    <div class=\"resource-response\">\n" +
    "                      <p>API rate limit exceeded. See <a href=\"http://developer.github.com/v3/#rate-limiting\">http://developer.github.com/v3/#rate-limiting</a> for details.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                  </div>\n" +
    "\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "          </li>\n" +
    "\n" +
    "          <li class=\"resource-list-item\">\n" +
    "            <div class=\"resource clearfix\">\n" +
    "              <div class=\"resource-path-container\">\n" +
    "                <h3 class=\"resource-heading\">\n" +
    "                  /gists<span class=\"resource-path-active\">/{id}</span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <span class=\"flag resource-heading-flag\"><b>Type:</b> collection</span>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"tab-list\">\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-get\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">GET</span>\n" +
    "                </a>\n" +
    "\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-post\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">POST</span>\n" +
    "                </a>\n" +
    "\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-put\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">PUT</span>\n" +
    "                </a>\n" +
    "\n" +
    "                <a class=\"tab\" href=\"#\">\n" +
    "                  <svg class=\"tab-image tab-delete\">\n" +
    "                    <use xlink:href=\"img/tab.svg#shape\" />\n" +
    "                  </svg>\n" +
    "\n" +
    "                  <span class=\"tab-label\">DELETE</span>\n" +
    "                </a>\n" +
    "              </div>\n" +
    "\n" +
    "              <button class=\"resource-close-btn\">\n" +
    "                Close\n" +
    "              </button>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"resource-panel\">\n" +
    "              <div class=\"resource-panel-wrapper\">\n" +
    "                <div class=\"sidebar\">\n" +
    "                  <div class=\"sidebar-flex-wrapper\">\n" +
    "                    <div class=\"sidebar-content\">\n" +
    "                      <header class=\"sidebar-row sidebar-header\">\n" +
    "                        <h3 class=\"sidebar-head\">\n" +
    "                          Try it\n" +
    "                          <a href=\"#\" class=\"sidebar-fullscreen-toggle js-sidebar-fullscreen\">\n" +
    "                            <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                            <span class=\"visuallyhidden\">Expand</span>\n" +
    "                          </a>\n" +
    "                        </h3>\n" +
    "                      </header>\n" +
    "\n" +
    "                      <!-- Show more -->\n" +
    "                      <div class=\"sidebar-show-more\">\n" +
    "                        <p>\n" +
    "                          more <img src=\"img/icn-chevron-down.svg\" alt=\"\">\n" +
    "                        </p>\n" +
    "                      </div>\n" +
    "\n" +
    "                      <div class=\"sidebar-content-wrapper\">\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader sidebar-subheader-top\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Authentication</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <div class=\"toggle-group sidebar-toggle-group\">\n" +
    "                              <button class=\"toggle toggle-mini is-active\">Anonymous</button>\n" +
    "                              <button class=\"toggle toggle-mini\">oauth_2_0</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-uri-parameters\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">URI Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-method\">GET</p>\n" +
    "\n" +
    "                            <div class=\"sidebar-method-content\">\n" +
    "                              <p class=\"sidebar-url\">https://api.github.com/notifications</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"mediaTypeExtension\" class=\"sidebar-label\">mediaTypeExtension</label>\n" +
    "                              <input id=\"mediaTypeExtension\" class=\"sidebar-input\" value=\".json\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section id=\"sidebar-headers\">\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Headers</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-input-container sidebar-input-container-custom\">\n" +
    "                              <button class=\"sidebar-input-delete\"><span class=\"visuallyhidden\">Delete header</span></button>\n" +
    "                              <label for=\"custom-header\" class=\"sidebar-label sidebar-label-custom\">\n" +
    "                                <input class=\"sidebar-custom-input-for-label\" placeholder=\"custom header key\">\n" +
    "                              </label>\n" +
    "                              <input id=\"custom-header\" class=\"sidebar-input sidebar-input-custom\" placeholder=\"custom value\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"accept\" class=\"sidebar-label\">Accept</label>\n" +
    "                              <input id=\"accept\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-media-type\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Media-Type\" class=\"sidebar-label\">X-GitHub-Media-Type</label>\n" +
    "                              <input id=\"X-GitHub-Media-Type\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-headers-x-github-request-id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-GitHub-Request-Id\" class=\"sidebar-label\">X-GitHub-Request-Id</label>\n" +
    "                              <input id=\"X-GitHub-Request-Id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Limit\" class=\"sidebar-label\">X-RateLimit-Limit</label>\n" +
    "                              <input id=\"X-RateLimit-Limit\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Remaining\" class=\"sidebar-label\">X-RateLimit-Remaining</label>\n" +
    "                              <input id=\"X-RateLimit-Remaining\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"X-RateLimit-Reset\" class=\"sidebar-label\">X-RateLimit-Reset</label>\n" +
    "                              <input id=\"X-RateLimit-Reset\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Query Parameters</h4>\n" +
    "\n" +
    "                            <button class=\"sidebar-add-btn\">\n" +
    "                              <span class=\"visuallyhidden\">Add custom header</span>\n" +
    "                            </button>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p id=\"sidebar-query-parameters-all\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"all\" class=\"sidebar-label\">all</label>\n" +
    "                              <input id=\"all\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-participating\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"participating\" class=\"sidebar-label\">participating</label>\n" +
    "                              <input id=\"participating\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since\" class=\"sidebar-label\">since</label>\n" +
    "                              <input id=\"since\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-max_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"max_id\" class=\"sidebar-label\">max_id</label>\n" +
    "                              <input id=\"max_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-since_id\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"since_id\" class=\"sidebar-label\">since_id</label>\n" +
    "                              <input id=\"since_id\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "\n" +
    "                            <p id=\"sidebar-query-parameters-trim_user\" class=\"sidebar-input-container\">\n" +
    "                              <button class=\"sidebar-input-reset\"><span class=\"visuallyhidden\">Reset field</span></button>\n" +
    "                              <span class=\"sidebar-input-tooltip-container\">\n" +
    "                                <button class=\"sidebar-input-tooltip\"><span class=\"visuallyhidden\">Show documentation</span></button>\n" +
    "                                <span class=\"sidebar-tooltip-flyout\">\n" +
    "                                  <span>Use .json to specify application/json media type.</span>\n" +
    "                                </span>\n" +
    "                              </span>\n" +
    "                              <label for=\"trim_user\" class=\"sidebar-label\">trim_user</label>\n" +
    "                              <input id=\"trim_user\" class=\"sidebar-input\">\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-subheader\">\n" +
    "                            <h4 class=\"sidebar-subhead\">Request URI</h4>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <p class=\"sidebar-response-item sidebar-request-url\">https://api.github.com/notifications?<b>all</b>=<i>true</i></p>\n" +
    "\n" +
    "                            <div class=\"sidebar-action-group\">\n" +
    "                              <button class=\"sidebar-action sidebar-action-get\">GET</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-clear\">Clear</button>\n" +
    "                              <button class=\"sidebar-action sidebar-action-reset\">Reset</button>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head sidebar-head-expand\">\n" +
    "                              <button class=\"sidebar-expand-btn is-collapsed js-toggle-request-metadata\">\n" +
    "                                Request\n" +
    "                              </button>\n" +
    "                            </h3>\n" +
    "                            <button class=\"resource-btn\">Copy</button>\n" +
    "                          </header>\n" +
    "                          <div class=\"sidebar-request-metadata\">\n" +
    "\n" +
    "                            <div class=\"sidebar-row\">\n" +
    "                              <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                              <div class=\"sidebar-response-item\">\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>Accept:</b> <br>bytes\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Media-Type:</b> <br>keep-alive\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-GitHub-Request-Id:</b> <br>gzip\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Limit:</b> <br>86\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Remaining:</b> <br>application/json; charset=utf-8\n" +
    "                                </p>\n" +
    "                                <p class=\"sidebar-response-metadata\">\n" +
    "                                  <b>X-RateLimit-Reset:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                                </p>\n" +
    "                              </div>\n" +
    "\n" +
    "                              <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                              <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                            </div>\n" +
    "                          </div>\n" +
    "                        </section>\n" +
    "\n" +
    "                        <section>\n" +
    "                          <header class=\"sidebar-row sidebar-header\">\n" +
    "                            <h3 class=\"sidebar-head\">Response</h3>\n" +
    "                          </header>\n" +
    "\n" +
    "                          <div class=\"sidebar-row\">\n" +
    "                            <h3 class=\"sidebar-response-head\">Status</h3>\n" +
    "                            <p class=\"sidebar-response-item\">200</p>\n" +
    "\n" +
    "                            <h3 class=\"sidebar-response-head\">Headers</h3>\n" +
    "                            <div class=\"sidebar-response-item\">\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>accept-ranges:</b> <br>bytes\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>connection:</b> <br>keep-alive\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-encoding:</b> <br>gzip\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-length:</b> <br>86\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>content-type:</b> <br>application/json; charset=utf-8\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>date:</b> <br>Thu, 05 Jun 2014 02:09:20 GMT\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>strict-transport-security:</b> <br>max-age=631138519\n" +
    "                              </p>\n" +
    "                              <p class=\"sidebar-response-metadata\">\n" +
    "                                <b>x-varnish-cache:</b> <br>MISS\n" +
    "                              </p>\n" +
    "                            </p>\n" +
    "                          </div>\n" +
    "\n" +
    "                          <h3 class=\"sidebar-response-head sidebar-response-head-pre\">Body</h3>\n" +
    "                          <pre class=\"sidebar-pre\"><code>Some Code Here</code></pre>\n" +
    "                        </div>\n" +
    "                      </section>\n" +
    "                    </div>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to intermediate view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-collapse js-sidebar-collapse-toggle\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <!-- Sidebar control to full-screen/full-width view -->\n" +
    "                  <div class=\"sidebar-controls sidebar-controls-fullscreen js-sidebar-fullscreen\">\n" +
    "                    <button class=\"collapse\">\n" +
    "                      <span class=\"discoverable\">Try it</span>\n" +
    "                      <img src=\"img/icn-expand.svg\" alt=\"\">\n" +
    "                    </button>\n" +
    "                  </div>\n" +
    "\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"resource-panel-primary\">\n" +
    "                <div class=\"resource-panel-subheader resource-panel-primary-row clearfix\">\n" +
    "                  <div class=\"resource-panel-description\">\n" +
    "                    <p class=\"description\">Whenever humanity seems condemned to heaviness, I think I should fly like Perseus into a different space.</p>\n" +
    "                  </div>\n" +
    "\n" +
    "                  <ul class=\"flag-list resource-panel-flag-list\">\n" +
    "                    <li class=\"flag\"><b>Type:</b> collection</li>\n" +
    "                    <li class=\"flag\"><b>Trait:</b> filterable</li>\n" +
    "                  </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"resource-panel-tabs clearfix\">\n" +
    "\n" +
    "                  <div class=\"toggle-tabs resource-panel-toggle-tabs\">\n" +
    "                    <a href=\"#\" class=\"toggle-tab is-active\">Request</a><a href=\"#\" class=\"toggle-tab\">Response</a>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Request -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content is-active\">\n" +
    "                  <h3 class=\"resource-heading-a\">Description</h3>\n" +
    "\n" +
    "                  <p>List your notifications. List all notifications for the current user, grouped by repository.</p>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">URI Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-uri-parameters-mediatypeextension\">\n" +
    "                      <h4 class=\"resource-param-heading\">mediaTypeExtension <span class=\"resource-param-instructional\">required, one of (.json)</span></h4>\n" +
    "                      <p>Use .json to specify application/json media type.</p>\n" +
    "\n" +
    "                      <p>\n" +
    "                        <span class=\"resource-param-example\"><b>Example:</b> .json</span>\n" +
    "                      </p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\">\n" +
    "                    <h3 class=\"resource-heading-a\">Headers</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">Accept <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Is used to set specified media type.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Media-Type <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>You can check the current version of media type in responses.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-GitHub-Request-Id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-limit\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Limit <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-remaining\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Remaining <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\" id=\"docs-headers-x-ratelimit-reset\">\n" +
    "                      <h4 class=\"resource-param-heading\">X-RateLimit-Reset <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "\n" +
    "                  <section class=\"resource-section\" id=\"docs-query-parameters\">\n" +
    "                    <h3 class=\"resource-heading-a\">Query Parameters</h3>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">all <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show notifications marked as read.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">participating <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>True to show only notifications in which the user is directly participating or mentioned.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since <span class=\"resource-param-instructional\">string</span></h4>\n" +
    "\n" +
    "                      <p>Time filters out any notifications updated before the given time. The time should be passed in as UTC in the ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ. Example: \"2012-10-09T23:39:01Z\".</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">max_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID less than (that is, older than) or equal to the specified ID.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">since_id <span class=\"resource-param-instructional\">integer</span></h4>\n" +
    "\n" +
    "                      <p>Returns results with an ID greater than (that is, more recent than) the specified ID. There are limits to the number of Tweets which can be accessed through the API. If the limit of Tweets has occured since the sinceid, the sinceid will be forced to the oldest ID available.</p>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"resource-param\">\n" +
    "                      <h4 class=\"resource-param-heading\">trim_user <span class=\"resource-param-instructional\">one of (0, 1, true, false, t, f)</span></h4>\n" +
    "\n" +
    "                      <p>When set to either true, t or 1, each tweet returned in a timeline will include a user object including only the status authors numerical ID. Omit this parameter to receive the complete user object.</p>\n" +
    "                    </div>\n" +
    "                  </section>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Response -->\n" +
    "                <div class=\"resource-panel-primary-row resource-panel-content\">\n" +
    "                  <div class=\"resource-response-jump\">\n" +
    "                    <p>\n" +
    "                      Jump to status\n" +
    "                      <span class=\"resource-btns\">\n" +
    "                        <button class=\"resource-btn\" href=\"#code200\">200</button>\n" +
    "                        <button class=\"resource-btn\" href=\"#code403\">403</button>\n" +
    "                      </span>\n" +
    "                    </p>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "        </li>\n" +
    "      </ol>\n" +
    "    </li>\n" +
    "  </ol>\n" +
    "</main>\n"
  );

}]);
