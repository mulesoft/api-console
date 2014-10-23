RAML.Directives.methodList = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'directives/method-list.tpl.html',
    replace: true,
    controller: function($rootScope, $scope, $element) {
      function getResponseInfo() {
        var responseInfo = {};
        var responses = $scope.methodInfo.responses;

        if (responses) {
          Object.keys(responses).map(function (key) {
            if(typeof responses[key].body !== 'undefined') {
              responseInfo[key] = {};

              Object.keys(responses[key].body).sort().reverse().map(function (type) {
                responseInfo[key][type] = responses[key].body[type]
                responseInfo[key].currentType = type;
              });
            }
          });
        }

        return responseInfo;
      };

      $scope.readTraits = function (traits) {
        var list = [];

        if (traits) {
          traits.map(function (trait) {
            if (typeof trait === 'string') {
              list.push(trait);
            } else if (typeof trait === 'object') {
              list.push(Object.keys(trait).join(', '));
            }
          });
        }

        return list.join(', ');
      }

      $scope.showResource = function ($event, $index) {
        var $this = jQuery($event.currentTarget);
        var $inactiveElements = jQuery('.tab').add('.resource').add('li');
        var $resource = $this.closest('.resource');
        var $resourceListItem = $resource.parent('li');
        var $closingEl;

        $scope.methodInfo = $scope.resource.methods[$index];
        $scope.responseInfo = getResponseInfo();
        $scope.context = new RAML.Services.TryIt.Context($scope.resource, $scope.methodInfo);
        $scope.requestUrl = '';
        $scope.response = {};
        $scope.requestOptions = {};
        $scope.resetFields();
        $scope.requestEnd = false;
        $scope.showRequestMetadata = false;
        $scope.showMoreEnable = true;
        $scope.showSpinner = false;
        $scope.securitySchemes = $scope.methodInfo.securitySchemes();
        $scope.credentials = {};
        $scope.traits = $scope.readTraits($scope.methodInfo.is);

        if ($scope.methodInfo.allowsAnonymousAccess()) {
          $scope.securitySchemes.anonymous = {
            type: "Anonymous"
          };
        }

        var defaultScheme = Object.keys($scope.securitySchemes).sort()[0];
        $scope.currentScheme = {
          type: $scope.securitySchemes[defaultScheme].type,
          name: defaultScheme
        };

        // Hack for codemirror
        setTimeout(function () {
          var editors = jQuery('.sidebar-content-wrapper #sidebar-body .codemirror-body-editor .CodeMirror');

          editors.map(function (index) {
            var bodyEditor = editors[index].CodeMirror;

            if (bodyEditor && $scope.context.bodyContent) {
              bodyEditor.setOption('mode', $scope.context.bodyContent.selected);
              bodyEditor.refresh();
            }
          });
        }, 10);

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
        } else if (jQuery($this).hasClass('is-active')) {
          $resourceListItem.children('.resource-panel')
            .velocity('slideUp');
          $inactiveElements.removeClass('is-active');
        } else {
          jQuery($this).addClass('is-active');
          jQuery($this).siblings('.tab').removeClass('is-active');
        }
      };
    }
  };
};

angular.module('RAML.Directives')
  .directive('methodList', ['$window', RAML.Directives.methodList]);
