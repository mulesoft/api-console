(function () {
  'use strict';

  RAML.Directives.rootDocumentation = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/root-documentation.tpl.html',
      replace: true,
      controller: ['$scope', '$timeout', function($scope, $timeout) {
        $scope.markedOptions = RAML.Settings.marked;
        $scope.selectedSection = 'all';

        $scope.hasDocumentationWithIndex = function () {
          var regex = /(^#|^##)+\s(.*)$/gim;

          return $scope.documentation.filter(function (el) {
            return regex.test(el.content);
          }).length > 0;
        };

        $scope.generateDocId = function (path) {
          return jQuery.trim(path.toString().replace(/\W/g, ' ')).replace(/\s+/g, '_').toLowerCase();
        };

        $scope.toggleSection = function ($event, key, section) {
          var $el = jQuery($event.currentTarget).closest('.raml-console-documentation');
          $scope.selectedDocumentSection = key;
          $scope.documentationEnabled = $el.hasClass('raml-console-documentation-active') ? false : true;

          jQuery('.raml-console-resource-list-item').removeClass('raml-console-documentation-active');

          $el[!$scope.documentationEnabled ? 'removeClass' : 'addClass']('raml-console-documentation-active');

          $timeout(function () {
            jQuery('html, body').animate({
              scrollTop: jQuery('#'+$scope.generateDocId(section)).offset().top + 'px'
            }, 'fast');
          }, 10);
        };

        $scope.closeDocumentation = function ($event) {
          var $container = jQuery($event.currentTarget).closest('.raml-console-documentation');
          $container.toggleClass('raml-console-documentation-active');
          $scope.documentationEnabled = false;
          jQuery('.raml-console-resource-list-item').removeClass('raml-console-documentation-active');
        };

        $scope.sectionChange = function (value) {
          $scope.selectedDocumentSection = value;
        };

        $scope.getDocumentationContent = function (content, selected) {
          var lines  = content.split('\n');
          var index  = lines.indexOf(selected);
          var result = [];
          var regex  = /(^#|^##)+\s(.*)$/gim;

          result.push(lines[index]);

          for (var i = index+1; i < lines.length; i++) {
            var line = lines[i];

            if (regex.test(line)) {
              break;
            }

            result.push(line);
          }

          return !selected || selected === 'all' ? content : result.join('\n');
        };

        $scope.filterHeaders = function (c) {
          return c.filter(function (el) {
            return el.heading <= 2;
          });
        };

        $scope.getMarkdownHeaders = function (content) {
          var headers = content.match(/^#+\s(.*)$/gim);
          var result  = [];
          var regex   = new RegExp(/(^#|^##)+\s(.*)$/gim);

          if (headers) {
            var key = headers[0];

            headers.map(function(el) {
              if(el.match(regex) !== null) {
                key = el;
              }

              result.push({
                value: key,
                heading: el.match(/#/g).length,
                label: el.replace(/#/ig, '').trim()
              });
            });
          }

          return result;
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('rootDocumentation', RAML.Directives.rootDocumentation);
})();
