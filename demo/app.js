/**
 * @license
 * Copyright 2017 The Advanced REST client authors <arc@mulesoft.com>
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * The following script will handle API console routing when using the console as a standalone
 * application.
 *
 * It uses native JavaScript APIs so it can be used outside Polymer scope.
 *
 * @author Pawel Psztyc <pawel.psztyc@mulesoft.com>
 */
(function() {
  'use strict';
  // API Console namespace.
  var apiconsole = {};
  // Namespace for standalone application.
  apiconsole.app = {};
  /**
   * Initialize event listeners for console's path and page properties and observers
   * router data change.
   */
  apiconsole.app.init = function() {
    apiconsole.app.setInitialRouteData();
    apiconsole.app.addParserListeners();
    apiconsole.app.observeRouteEvents();
  };

  apiconsole.app.setInitialRouteData = function() {
    // sets the initial path for routing from external source.
    // The API console sets default path to `summary` after RAML change.
    var location = document.querySelector('app-location');
    var locationPath = location.path;
    if (!locationPath) {
      return;
    }
    var parsedPath = locationPath.replace(/\-/g, '.');
    if (parsedPath[0] === '/') {
      parsedPath = parsedPath.substr(1);
    }
    var _route = parsedPath.split('/');
    var page = _route[0];
    var path = _route[1];

    apiconsole.app.__initialPage = page;
    apiconsole.app.__initialPath = path;
  };
  /**
   * Adds event listeres to elements that are related to RAML dataq parsing.
   */
  apiconsole.app.addParserListeners = function() {
    document.querySelector('raml-docs-parser')
    .addEventListener('raml-ready', function(e) {
      var apiConsole = document.querySelector('api-console');
      apiConsole.raml = e.detail.raml;

      if (apiconsole.app.__initialPage && apiconsole.app.__initialPage !== apiConsole.page) {
        apiconsole.app.pageChanged(apiconsole.app.__initialPage);
        apiconsole.app.__initialPage = undefined;
      }
      if (apiconsole.app.__initialPath && apiconsole.app.__initialPath !== apiConsole.path) {
        apiconsole.app.pathChanged(apiconsole.app.__initialPath);
        apiconsole.app.__initialPath = undefined;
      }
    });
  };
  /**
   * Adds event listeres to elements that are related to the routing:
   * app-location, app-route and api-console.
   */
  apiconsole.app.observeRouteEvents = function() {
    var apiConsole = document.querySelector('api-console');
    var location = document.querySelector('app-location');

    apiConsole.addEventListener('path-changed', apiconsole.app._pathChanged);
    apiConsole.addEventListener('page-changed', apiconsole.app._pageChanged);
    location.addEventListener('route-changed', apiconsole.app._routeChanged);
  };
  // Event handler for the path change.
  apiconsole.app._pathChanged = function(e) {
    apiconsole.app.pathChanged(e.detail.value);
  };
  // Called when path changed from the api-console.
  apiconsole.app.pathChanged = function(path) {
    if (!path) {
      return;
    }
    var location = document.querySelector('app-location');
    var parsedPath = path.replace(/\./g, '-');
    var newPath = '/docs/' + parsedPath;
    if (newPath !== location.path) {
      location.set('path', newPath);
    }
  };
  // Event handler for the page change.
  apiconsole.app._pageChanged = function(e) {
    apiconsole.app.pageChanged(e.detail.value);
  };
  // Called when page change.
  apiconsole.app.pageChanged = function(page) {
    var apiConsole = document.querySelector('api-console');
    if (apiConsole.page !== page) {
      apiConsole.page = page;
    }
  };
  // Event handler for the route change.
  apiconsole.app._routeChanged = function(e) {
    apiconsole.app.routeChanged(e.detail.value);
  };
  // Updates api console path if different than curent URL
  apiconsole.app.routeChanged = function(route) {
    var locationPath = route.path;
    if (!locationPath || locationPath === '/') {
      document.querySelector('app-location').set('path', '/docs');
      return;
    }
    var parsedPath = locationPath.replace(/\-/g, '.');
    if (parsedPath[0] === '/') {
      parsedPath = parsedPath.substr(1);
    }
    var _route = parsedPath.split('/');
    var page = _route[0];
    var path = _route[1];
    var apiConsole = document.querySelector('api-console');
    if (apiConsole.page !== page) {
      apiConsole.page = page;
    }
    if (apiConsole.path !== path) {
      apiConsole.path = path;
    }
  };
  /**
   * Reads page name and the path from location path.
   *
   * @param {String} locationPath Current path read from path change event or read fomr the
   * `app-location` element.
   */
  apiconsole.app._readPagePath = function(locationPath) {
    var parsedPath = locationPath.replace(/\-/g, '.');
    if (parsedPath[0] === '/') {
      parsedPath = parsedPath.substr(1);
    }
    var _route = parsedPath.split('/');
    var page = _route[0];
    var path = _route[1];
    return {
      page: page,
      path: path
    };
  };

  // Notifys user when something went wrong...
  apiconsole.app.notifyInitError = function(message) {
    window.alert('Cannot initialize API console. ' + message);
  };
  apiconsole.app.init();
})();
