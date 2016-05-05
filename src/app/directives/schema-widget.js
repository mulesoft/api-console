(function () {
  'use strict';

  RAML.Directives.schemaWidget = function () {
    return {
      restrict: 'E',
      templateUrl: 'directives/schema-widget.tpl.html',
      replace: false,
      controller: ['$scope', '$element', '$window', function($scope, $element, $window) {
          $scope.schemaURL = $scope.$eval($element.attr('src'));
          $scope.schemaID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
          // function receiveMessage(event) {
          //     // console.log("<", event)
          //     if (event.data.id && event.data.id === 'docson') {
          //       var frame = document.getElementById(event.data.url);
          //       if(event.data.action === 'resized') {
          //         frame.height = event.data.height + 18;
          //       }
          //       if(event.data.action === 'ready') {
          //         // console.log(frame.parentNode)
          //         frame.contentWindow.postMessage({ id: 'docson', font: window.getComputedStyle(frame.parentNode).fontFamily}, '*');
          //       }
          //     }
          // }
          // window.addEventListener('message', receiveMessage, false);
          function render(schema) {
              try {
                  $window.docson.doc($scope.schemaID, schema, null, $scope.schemaURL.replace(/\/[^\/]*\/?$/, '/'));
              } catch (err) {
                  // error("Could not parse schema: " + err.message + "<pre>" + $('<pre/>').text(schema).html() + "</pre>");
                  $window.alert(err);
              }
          }

          angular.element.get($scope.schemaURL)
                  .done(render)
                  .fail(function (xhr, status, err) {
                      // error('Could not load ' + $scope.schemaURL.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                      //        return '&#'+i.charCodeAt(0)+';';
                      // }) + ': ' + status + ' ' + err);
                        $window.alert(err);
          });
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('schemaWidget', RAML.Directives.schemaWidget);
})();
