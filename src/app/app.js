// var findTab = function (element) {
//   return jQuery(element).closest('.resource')
//     .find('.tab-list')
//     .children()
//     .first();
// };

//// TODO: Add this code!
// jQuery('.resource-heading')
//   .on('mouseenter', function () {
//     findTab(this).addClass('is-hovered');
//   }).on('mouseleave', function () {
//     findTab(this).removeClass('is-hovered');
//   }).on('click', function () {
//     findTab(this).trigger('click');
//   });

//// CODE ////

// The RAML object is being created by the RAML Parser lib
RAML.Directives = {};
RAML.Services = {};
RAML.Filters = {};
RAML.Services.TryIt = {};

angular.module('RAML.Directives', []);
angular.module('RAML.Services', ['raml']);
angular.module('ramlConsole', ['RAML.Directives', 'RAML.Services', 'hc.marked', 'ui.codemirror']);

// Marked Config
var renderer = new window.marked.Renderer();

renderer.paragraph = function (text, level) {
  return text;
};

window.marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});
