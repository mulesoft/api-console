(function() {

  var controller = function($scope) {
    this.tabs = $scope.tabs = [];
    $scope.tabset = this;
  };

  controller.prototype.select = function(tab) {
    this.tabs.forEach(function(tab) {
      tab.active = false;
    });
    tab.active = true;
  };

  controller.prototype.addTab = function(tab) {
    this.tabs.push(tab);
    if (this.tabs.length === 1 || tab.active) {
      this.select(tab);
    }
  };

  RAML.Controllers.tabset = controller;

})();
