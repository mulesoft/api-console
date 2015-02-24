(function () {
  'use strict';

  RAML.Directives.rootDocumentation = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/root-documentation.tpl.html',
      replace: true,
      controller: function($scope, $location) {
        $scope.markedOptions = RAML.Settings.marked;
        $scope.selectedSection = 'all';

        $scope.hasDocumentationWithIndex = function () {
          var regex = /(^#|^##)+\s(.*)$/gim;

          return $scope.raml.documentation.filter(function (el) {
            return regex.test(el.content);
          }).length > 0;
        };

        $scope.collapseDocumentation = function ($event) {
          var $this = jQuery($event.currentTarget);

          if ($this.hasClass('raml-console-resources-expanded')) {
            $this.text('expand all');
            $this.removeClass('raml-console-resources-expanded');
            jQuery('#raml-console-documentation-container').find('ol.raml-console-resource-list').velocity('slideUp', {
              duration: 200
            });
          } else {
            $this.text('collapse all');
            $this.addClass('raml-console-resources-expanded');
            jQuery('#raml-console-documentation-container').find('ol.raml-console-resource-list').velocity('slideDown', {
              duration: 200
            });
          }

          jQuery('#raml-console-documentation-container').find('button.raml-console-resource-root-toggle').toggleClass('raml-console-is-active');
        };

        $scope.generateDocId = function (path) {
          return jQuery.trim(path.toString().replace(/\W/g, ' ')).replace(/\s+/g, '_').toLowerCase();
        };

        $scope.showSection = function ($event, key, section) {
          var $container = jQuery($event.currentTarget).closest('.raml-console-documentation');
          jQuery('.raml-console-documentation').removeClass('raml-console-documentation-active');
          $scope.selectedDocumentSection = key;
          $container.toggleClass('raml-console-documentation-active');
          $scope.documentationEnabled = true;
          $location.hash($scope.generateDocId(section));
        };

        $scope.closeDocumentation = function ($event) {
          var $container = jQuery($event.currentTarget).closest('.raml-console-documentation');
          $container.toggleClass('raml-console-documentation-active');
          $scope.documentationEnabled = false;
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
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('rootDocumentation', RAML.Directives.rootDocumentation);
})();
