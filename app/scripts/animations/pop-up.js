(function() {
  'use strict';

  RAML.Animations.popUp = function() {
    return {
      beforeAddClass: function(element, className, done) {
        var placeholder = element;
        var wrapper = angular.element(element.children()[0]);
        var resource = angular.element(wrapper.children()[0]);

        var height = resource[0].offsetHeight + 'px';
        wrapper.css('position', 'fixed');
        var top = (wrapper[0].offsetTop - 20) + 'px';
        wrapper.css('position', null);

        placeholder.css('height', height);
        resource.css('height', height);
        resource.css('margin-top', top);

        setTimeout(done, 0);
      },
      addClass: function(element, className, done) {
        var resource = angular.element(element[0].children[0].children[0]);

        resource.css('height', null);
        resource.css('margin-top', '0px');

        done();
      }
    };
  };
})();
