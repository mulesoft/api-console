(function() {
  'use strict';

  var animationDuration = 333;

  RAML.Animations.popUp = function() {
    function getElements(placeholder) {
      return {
        console: angular.element(document.querySelector('[role="api-console"]')), // FIXME What about multiple consoles on a page; can we just set offsetParent overflow:hidden?
        offsetParent: angular.element(placeholder[0].offsetParent),
        placeholder: placeholder,
        wrapper: placeholder.children().eq(0),
        resource: placeholder.children().eq(0).children().eq(0),
        description: angular.element(placeholder[0].querySelector('.description'))
      }
    }

    function beginExpansion(placeholder) {
      placeholder.scope().resourceView.expanded = true;
      return placeholder[0].getBoundingClientRect();
    }

    function prepareResourceForAbsolutePositioning(offsetParent, wrapper, resource, bounds) {
      var scrollOffset = offsetParent[0].scrollTop;
      var topOffset = offsetParent[0].getBoundingClientRect().top;

      wrapper.css('top', scrollOffset + 'px');
      resource.css('height', bounds.height + 'px');
      resource.css('margin-top', bounds.top - 20 - topOffset + 'px'); // 20 padding from wrapper
    }

    function rememberExpandedResourceBounds(offsetParent, placeholder, resource) {
      var topOffset = offsetParent[0].getBoundingClientRect().top;
      var expandedPlaceholderBounds = placeholder[0].getBoundingClientRect();
      console.log(expandedPlaceholderBounds.height);
      resource.data('height', expandedPlaceholderBounds.height + 'px');
      resource.data('margin-top', expandedPlaceholderBounds.top - topOffset + 'px');
    }

    function prepareDescriptionForAnimation(description) {
      description.data('height', description[0].getBoundingClientRect().height + 20 + 'px');
      description.css('height', description.data('height'));
      setTimeout(function() {
        description.css('transition', 'height ' + animationDuration/1000 + 's');
      });
    }

    function triggerOpenAnimation(resource, description) {
      resource.css('height', '');
      resource.css('margin-top', '');
      description.css('height', '0px');
    }

    function blockScroll(offsetParent, wrapper, console) {
      wrapper.css('top', 0);
      console
        .data('scrollTop', offsetParent[0].scrollTop)
        .css('height', '0px')
        .css('overflow', 'hidden');
    }

    function afterAnimation(cb) {
      setTimeout(cb, animationDuration);
    }

    function restoreScroll(offsetParent, wrapper, console) {
      var scrollTop = console.data('scrollTop');

      console.css('height', '').css('overflow', '');
      offsetParent[0].scrollTop = scrollTop;
      wrapper.css('top', scrollTop + 'px');
    }

    function triggerCloseAnimation(resource, description) {
      resource.css('height', resource.data('height'));
      resource.css('margin-top', parseInt(resource.data('margin-top'), 10) - 20 + 'px');
      description.css('height', description.data('height'));
    }

    return {
      beforeAddClass: function(element, className, done) {
        var elements = getElements(element);

        var originalPlaceholderBounds = beginExpansion(elements.placeholder);
        setTimeout(function() {
          rememberExpandedResourceBounds(elements.offsetParent, elements.placeholder, elements.resource);
          prepareResourceForAbsolutePositioning(elements.offsetParent, elements.wrapper, elements.resource, originalPlaceholderBounds);
          elements.placeholder.css('height', originalPlaceholderBounds.height + 'px');
          prepareDescriptionForAnimation(elements.description);

          done();
        });
      },

      addClass: function(element, className, done) {
        var elements = getElements(element);
        elements.resource.scope().$apply('resourceView.expandMethod(methodToAdd)');

        setTimeout(function() {
          triggerOpenAnimation(elements.resource, elements.description)

          afterAnimation(function() {
            elements.placeholder.css('height', elements.resource.data('height'));
            blockScroll(elements.offsetParent, elements.wrapper, elements.console);

            done();
          });
        });
      },

      beforeRemoveClass: function(element, className, done) {
        var elements = getElements(element);

        restoreScroll(elements.offsetParent, elements.wrapper, elements.console);
        elements.wrapper.css('background-color', 'transparent');
        elements.resource.css('height', elements.resource[0].getBoundingClientRect().height + 'px'); // Safari loses the resource's height otherwise

        setTimeout(function() {
          triggerCloseAnimation(elements.resource, elements.description);
          afterAnimation(done);
        }, 10);
      },

      removeClass: function(element, className, done) {
        var elements = getElements(element);
        elements.resource.scope().$apply('method = methodToAdd');

        elements.placeholder.css('height', '');
        elements.wrapper.css('background-color', '');
        elements.resource.css({ 'height': '', 'margin-top': '' });
        elements.description.css({ 'transition': 'height 0s', 'height': '' }); // otherwise Safari incorrectly animates description from 0 to its natural height and freaks out

        setTimeout(function() {
          elements.description.css('transition', '');
          done();
        });
      }
    };
  };
})();
