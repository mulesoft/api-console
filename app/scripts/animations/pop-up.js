(function() {
  'use strict';

  RAML.Animations.popUp = function() {
    return {
      beforeAddClass: function(element, className, done) {
        angular.element(document.body).css('height', '100vh').css('overflow', 'hidden');

        var placeholder = element;
        var wrapper = angular.element(element.children()[0]);
        var resource = angular.element(wrapper.children()[0]);
        var description = angular.element(resource[0].querySelector('.description'));

        var rect = placeholder[0].getBoundingClientRect();
        placeholder.scope().resourceView.expanded = true;
        setTimeout(function() {
          var rect2 = placeholder[0].getBoundingClientRect();

          placeholder.css('height', rect.height + 'px');
          resource.css('height', rect.height + 'px');
          resource.css('margin-top', rect.top - 20 + 'px'); // 20 padding from wrapper
          resource.data('height', rect2.height + 'px');
          resource.data('margin-top', rect.top + 'px');

          description.data('height', description[0].getBoundingClientRect().height + 20 + 'px');
          description.css('height', description.data('height'));
          setTimeout(function() {
            description.css('transition', 'height 0.33s');
          });

          done();
        });
      },
      addClass: function(element, className, done) {
        var placeholder = element;
        var resource = angular.element(element[0].children[0].children[0]);
        var description = angular.element(resource[0].querySelector('.description'));

        resource.scope().$apply('resourceView.expandMethod(methodToAdd)');
        setTimeout(function() {
          resource.css('transition', 'height .33s, margin-top .33s');
          setTimeout(function() {
            resource.css('height', '');
            resource.css('margin-top', '');
            setTimeout(function() {
              description.css('height', '0px');
            });

            setTimeout(function() {
              placeholder.css('height', resource.data('height'));
              done();
            }, 333);
          });
        });
      },
      beforeRemoveClass: function(element, className, done) {
        var wrapper = angular.element(element.children()[0]);
        var resource = angular.element(wrapper.children()[0]);
        var description = angular.element(resource[0].querySelector('.description'));

        wrapper.css('background-color', 'transparent');
        resource.css('height', resource[0].getBoundingClientRect().height + 'px'); // Firefox won't animate from calc(100%-40px) to _px
        setTimeout(function() {
          resource.css('height', resource.data('height'));
          resource.css('margin-top', parseInt(resource.data('margin-top'), 10) - 20 + 'px');
          description.css('height', description.data('height'));

          setTimeout(done, 333);
        }, 20);
      },
      removeClass: function(element, className, done) {
        var placeholder = element;
        var wrapper = angular.element(element.children()[0]);
        var resource = angular.element(wrapper.children()[0]);
        var description = angular.element(resource[0].querySelector('.description'));

        resource.scope().$apply('method = methodToAdd');

        placeholder.css('height', '');
        wrapper.css('background-color', '');
        resource.css('transition', '');
        resource.css('height', '');
        resource.css('margin-top', '');
        description.css('transition', 'height 0s'); // otherwise Sarfari incorrectly animates description from 0 to its natural height
        description.css('height', '');
        setTimeout(function() {
          description.css('transition', '');
        });

        angular.element(document.body).css('height', 'auto').css('overflow', 'visible');

        done();
      }
    };
  };
})();
