angular.module('ramlConsoleApp')
	.controller('ramlOperationDetails', function ($scope) {
		$scope.tabName = 'try-it';

		$scope.isTabActive = function (tabName) {
			return tabName === this.tabName;
		};
		$scope.changeTab = function (tabName) {
			this.tabName = tabName;
		};
		//// TODO: filter by the current content-type
		$scope.requestFilter = function (el) {
			return el.method === $scope.operation.method && typeof el.body !== 'undefined' && typeof el.body['application/json'] !== 'undefined';
		};

		//// TODO: filter by the current content-type
		$scope.responseFilter = function (el) {
			return el.method === $scope.operation.method && typeof el.responses !== 'undefined';
		};
	});