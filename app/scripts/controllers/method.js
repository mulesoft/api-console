(function() {
  'use strict';

  var controller = function($scope, DataStore) {
    $scope.methodView = this;
    this.resource = $scope.resource;
    this.method = $scope.method;
    this.DataStore = DataStore;
    this.expanded = this.DataStore.get(this.methodKey());
  };

  controller.prototype.toggleExpansion = function(evt) {
    evt.preventDefault();

    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  };

  controller.prototype.expand = function() {
    this.expanded = true;
    this.DataStore.set(this.methodKey(), this.expanded);
  };

  controller.prototype.collapse = function() {
    this.expanded = false;
    this.DataStore.set(this.methodKey(), this.expanded);
  };

  controller.prototype.methodKey = function() {
    return this.resource.toString() + ':' + this.method.method;
  };

  controller.prototype.cssClass = function() {
    if (this.expanded) {
      return 'expanded ' + this.method.method;
    } else {
      return 'collapsed ' + this.method.method;
    }
  };

  RAML.Controllers.Method = controller;
})();
