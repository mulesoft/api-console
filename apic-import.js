/**
 * This file is to be included into the Exchange or other application
 * main page that serves the console so it can detect which build
 * to use.
 * ES6 enabled browsers will use es6 build and ES5 otherwise.
 */
(function() {
  'use strict';
  if (!window.apic) {
    window.apic = {};
  }
  if (!window.apic) {
    window.apic.basePath = '';
  }
  if (!window.apic.importId) {
    window.apic.importId = 1;
  }
  /**
   * Detects ES6 support by testing arrow functions.
   * It has to be executed in eval or otherwise the script would
   * throw syntax error and won't be executed at all.
   *
   * @return {Boolean} True if the browser is a moderm browser.
   */
  function detectEs6() {
    if (typeof Symbol === 'undefined') {
      return false;
    }
    try {
      eval('{const foo = (x)=>x+1;}');
      eval('class Foo {}');
    } catch (e) {
      return false;
    }
    return true;
  }
  var isEs6 = detectEs6();
  var moduleRoot = window.apic.basePath;
  if (moduleRoot[moduleRoot.length - 1] !== '/') {
    moduleRoot += '/';
  }
  if (isEs6) {
    moduleRoot += 'es6-bundle';
  } else {
    moduleRoot += 'es5-bundle';
  }
  // See https://github.com/Polymer/polymer/issues/5196#issuecomment-397723878
  function bundleLoaded() {
    window.setTimeout(function() {
      ['api-console', 'api-documentation', 'api-navigation', 'api-request-panel']
      .forEach(function(cmp) {
        var element = document.body.querySelector(cmp);
        if (!element || !element.updateStyles) {
          return;
        }
        element.updateStyles({});
      });
    }, 1);
  }

  var script = document.createElement('script');
  var src = moduleRoot + '/bower_components/webcomponentsjs/webcomponents-loader.js';
  script.src = src;
  document.head.appendChild(script);

  var importFile = moduleRoot + '/api-console.html';
  var link = document.createElement('link');
  link.setAttribute('rel', 'import');
  link.setAttribute('href', importFile);
  link.setAttribute('id', 'apic' + (window.apic.importId++));
  if (document.readyState === 'loading') {
    document.write(link.outerHTML);
    var domLink = document.querySelector('#' + link.id);
    domLink.onload = bundleLoaded;
  } else {
    document.head.appendChild(link);
    link.onload = bundleLoaded;
  }
})();
