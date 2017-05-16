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
  // Cache object
  apiconsole.app.__data__ = {};
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
    var route = document.getElementById('route');
    var subroute = document.getElementById('subroute');
    apiconsole.app.__initialPage = route.data && route.data.page;
    apiconsole.app.__initialPath = subroute.data && subroute.data.path;
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
        apiconsole.app.pageChanged(apiConsole.__initialPage);
        apiConsole.__initialPage = undefined;
      }
      if (apiconsole.app.__initialPath && apiconsole.app.__initialPath !== apiConsole.path) {
        apiconsole.app.pathChanged(apiConsole.__initialPath);
        apiConsole.__initialPath = undefined;
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
    var route = document.getElementById('route');
    var subroute = document.getElementById('subroute');

    apiConsole.addEventListener('path-changed', apiconsole.app._pathChanged);
    apiConsole.addEventListener('page-changed', apiconsole.app._pageChanged);
    location.addEventListener('route-changed', apiconsole.app._routeChanged);
    route.addEventListener('route-changed', apiconsole.app._routeChanged);
    route.addEventListener('data-changed', apiconsole.app._routeDataChanged);
    route.addEventListener('tail-changed', apiconsole.app._subrouteChanged);
    subroute.addEventListener('route-changed', apiconsole.app._subrouteChanged);
    subroute.addEventListener('data-changed', apiconsole.app._subrouteDataChanged);
  };
  // Event handler for the path change.
  apiconsole.app._pathChanged = function(e) {
    apiconsole.app.pathChanged(e.detail.value);
  };
  // Called when path change.
  apiconsole.app.pathChanged = function(path) {
    if ('path' in apiconsole.app.__data__) {
      if (apiconsole.app.__data__.path === path) {
        return;
      }
    }
    apiconsole.app.__data__.path = path;
    var apiConsole = document.querySelector('api-console');
    var location = document.querySelector('app-location');
    var route = location.route;
    if (apiConsole.page !== 'docs') {
      route.path = '/docs/' + path.replace(/\./g, '-');
      apiconsole.app.routeChanged(route);
      return;
    }
    var subrouteElement = document.getElementById('subroute');
    var subrouteData = subrouteElement.data;

    if (!path) {
      subrouteData.path = '';
      apiconsole.app.subrouteDataChanged(subrouteData);
      return;
    }

    var parsedPath = path.replace(/\./g, '-');
    if (parsedPath !== subrouteData.path) {
      var newPath = '/' + apiConsole.page + '/' + parsedPath;
      if (route.path !== newPath) {
        route.path = newPath;
        apiconsole.app.routeChanged(route);
      }
      return;
    }
  };
  // Event handler for the page change.
  apiconsole.app._pageChanged = function(e) {
    apiconsole.app.pageChanged(e.detail.value);
  };
  // Called when page change.
  apiconsole.app.pageChanged = function(page) {
    if ('page' in apiconsole.app.__data__) {
      if (apiconsole.app.__data__.page === page) {
        return;
      }
    }
    apiconsole.app.__data__.page = page;
    var apiConsole = document.querySelector('api-console');
    if (apiConsole.page !== page) {
      apiConsole.page = page;
    }
  };
  // Event handler for the route change.
  apiconsole.app._routeChanged = function(e) {
    apiconsole.app.routeChanged(e.detail.value);
  };
  // Updates all elements that use the route object.
  apiconsole.app.routeChanged = function(route) {
    var location = document.querySelector('app-location');
    var routeElement = document.getElementById('route');
    // It uses type and value check to not override a value on the object that initialized
    // the change.
    // It also makes a copy of the object so change in one element will not cause unhandled change
    // in the other elements.
    if (!apiconsole.app._routeEquals(location.route, route)) {
      location.route = Object.assign({}, route);
    }
    if (!apiconsole.app._routeEquals(routeElement.route, route)) {
      // debugger;
      routeElement.route = Object.assign({}, route);
    }
  };
  // Check if route objects equals. Simplified version for the API Console.
  apiconsole.app._routeEquals = function(a, b) {
    if ((a && a.path) !== (b && b.path)) {
      return false;
    }
    if ((a && a.prefix) !== (b && b.prefix)) {
      return false;
    }
    return true;
  };
  // Event handler for the routeData change.
  apiconsole.app._routeDataChanged = function(e) {
    apiconsole.app.routeDataChanged(e.detail.value);
  };
  // Called when routeData change.
  apiconsole.app.routeDataChanged = function(routeData) {
    var routeElement = document.getElementById('route');
    if (routeElement.data !== routeData) {
      routeElement.data = routeData;
    }
    apiconsole.app.routePageChanged(routeData.page);
  };
  // Event handler for the subroute change.
  apiconsole.app._subrouteChanged = function(e) {
    apiconsole.app.subrouteChanged(e.detail.value);
  };
  // Updates all elements that use the subroute object.
  apiconsole.app.subrouteChanged = function(subroute) {
    var route = document.getElementById('route');
    var subrouteElement = document.getElementById('subroute');
    if (route.tail !== subroute) {
      route.tail = subroute;
    }
    if (subrouteElement.route !== subroute) {
      subrouteElement.route = subroute;
    }
  };
  // Event handler for the subrouteData change.
  apiconsole.app._subrouteDataChanged = function(e) {
    apiconsole.app.subrouteDataChanged(e.detail.value);
  };
  // Updates all elements that use the subrouteData object.
  apiconsole.app.subrouteDataChanged = function(subrouteData) {
    var subrouteElement = document.getElementById('subroute');
    subrouteElement.data = subrouteData;
    apiconsole.app.urlPathChanged(subrouteData.path);
  };
  // Notifys user when something went wrong...
  apiconsole.app.notifyInitError = function(message) {
    window.alert('Cannot initialize API console. ' + message);
  };

  apiconsole.app.routePageChanged = function(page) {
    if (page === '/' || page === '') {
      var location = document.querySelector('app-location');
      var route = location.route;
      route.path = '/docs';
      apiconsole.app.routeChanged(route);
      return;
    }
    apiconsole.app.pageChanged(page || 'docs');
  };
  apiconsole.app.urlPathChanged = function(path) {
    if (!path) {
      apiconsole.app.pathChanged('');
      return;
    }
    var parsedPath = path.replace(/\-/g, '.');
    var apiConsole = document.querySelector('api-console');
    if (parsedPath !== apiConsole.path) {
      apiconsole.app.pathChanged(parsedPath);
    }
  };

  apiconsole.app.init();
})();
