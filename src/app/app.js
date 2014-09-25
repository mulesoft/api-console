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

// The RAML object is being created by the RAML Parser lib
RAML.Directives = {};
RAML.Services = {};
RAML.Filters = {};

angular.module('RAML.Directives', []);
angular.module('RAML.Services', ['raml']);
angular.module('ramlConsole', ['RAML.Directives', 'RAML.Services']);
