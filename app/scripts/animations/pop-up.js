(function() {
  'use strict';

  RAML.Animations.popUp = function() {
    return {
      beforeAddClass: function(element, className, done) {
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

          done();
        }, 0);
      },
      addClass: function(element, className, done) {
        var placeholder = element;
        var resource = angular.element(element[0].children[0].children[0]);
        var description = angular.element(resource[0].querySelector('.description'));

        resource.scope().$apply('resourceView.expandMethod(methodToAdd)');
        setTimeout(function() {
          resource.css('transition', 'height .33s, margin-top .33s');
          resource.css('height', null);
          resource.css('margin-top', null);
          description.css('height', '0px');

          setTimeout(function() {
            placeholder.css('height', resource.data('height'));
            done();
          }, 333);
        }, 0);
      },
      beforeRemoveClass: function(element, className, done) {
        var wrapper = angular.element(element.children()[0]);
        var resource = angular.element(wrapper.children()[0]);
        var description = angular.element(resource[0].querySelector('.description'));

        wrapper.css('background-color', 'transparent');
        resource.css('height', resource.data('height'));
        resource.css('margin-top', parseInt(resource.data('margin-top'), 10) - 20 + 'px');
        description.css('height', description.data('height'));

        setTimeout(done, 333);
      },
      removeClass: function(element, className, done) {
        var placeholder = element;
        var wrapper = angular.element(element.children()[0]);
        var resource = angular.element(wrapper.children()[0]);
        var description = angular.element(resource[0].querySelector('.description'));

        resource.scope().$apply('method = methodToAdd');

        placeholder.css('height', null);
        wrapper.css('background-color', null);
        resource.css('transition', null);
        resource.css('height', null);
        resource.css('margin-top', null);
        description.css('height', null);

        done();
      }
    };
  };
})();
