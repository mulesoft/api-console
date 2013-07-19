angular.module('ramlConsoleApp')
	.controller('ramlOperationDetails', function ($scope, $filter, eventService) {
		$scope.tabName = 'try-it';

		$scope.$on('event:raml-method-changed', function () {
			$scope.init();
		});

		$scope.isTabActive = function (tabName) {
			return tabName === this.tabName;
		};
		$scope.changeTab = function (tabName) {
			this.tabName = tabName;
		};

		$scope.requestFilter = function (el) {
			return el.method === $scope.operation.method && typeof el.body !== 'undefined' && typeof el.body[$scope.bodyType.name] !== 'undefined';
		};

		$scope.init = function () {
			$scope.bodyType = $scope.bodyParams ? $scope.bodyParams[0] : {
				name: 'application/json'
			};
		}

		$scope.changeBodyType = function (bodyTypeName) {
			var bodyParam = $filter('filter')(this.bodyParams, {
				name: bodyTypeName
			});
			if (bodyParam && bodyParam.length) {
				$scope.bodyType = bodyParam[0];

				eventService.broadcast('event:raml-body-type-changed', bodyTypeName);
			}
		};

		$scope.responseFilter = function (el) {
			return el.method === $scope.operation.method && typeof el.responses !== 'undefined';
		};
	});