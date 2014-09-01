(function () {
  'use strict';

  /**
   * Store configuration in local storage under the current key.
   *
   * @type {String}
   */
  var STORAGE_KEY = 'raml-console-config';

  /**
   * This is extremely hacky but done because the entire app avoids using
   * the dependency injection in angular.
   *
   * @type {Object}
   */
  var config = {
    disableProxy: false
  };

  /**
   * Create a persistent configuration instance that works with angular.
   */
  RAML.Services.Config = function ($rootScope, $window) {
    /**
     * Update the config object when local storage changes.
     *
     * @param {Object} e
     */
    function handleStorage(e) {
      if (e.key !== STORAGE_KEY) {
        return;
      }

      // Update the config with the updated storage value.
      try {
        $scope.$apply(function () {
          angular.copy(JSON.parse(e.newValue), config);
        });
      } catch (e) {}
    }

    /**
     * Attempt to get the value out of local storage.
     *
     * @return {Object}
     */
    function getStorage() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
      } catch (e) {}
    }

    /**
     * Attempt to set the value in local storage.
     *
     * @param {Object} value
     */
    function setStorage(value) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        return true;
      } catch (e) {}

      return false;
    }

    var $scope = $rootScope.$new();
    $scope.config = angular.extend(config, getStorage());

    // When the config options change, save into local storage.
    $scope.$watchCollection('config', setStorage, true);

    // Listen for local storage changes to persist across frames.
    if ($window.addEventListener) {
      $window.addEventListener('storage', handleStorage, false);
    } else {
      $window.attachEvent('onstorage', handleStorage);
    }

    return config;
  };

  // Alias the config for access outside angular.
  RAML.Services.Config.config = config;
})();
