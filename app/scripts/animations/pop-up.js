(function() {
  'use strict';

  var animationDuration = 333;

  RAML.Animations.popUp = function(DataStore) {
    function getElements(placeholder) {
      return {
        console: angular.element(document.querySelector('[role="api-console"]')), // FIXME What about multiple consoles on a page; can we just set offsetParent overflow:hidden?
        offsetParent: angular.element(placeholder[0].offsetParent),
        placeholder: placeholder,
        wrapper: placeholder.children().eq(0),
        resource: placeholder.children().eq(0).children().eq(0),
        description: angular.element(placeholder[0].querySelector('.description'))
      };
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

    function rememberExpandedResourceBounds(offsetParent, placeholder) {
      var topOffset = offsetParent[0].getBoundingClientRect().top;
      var expandedPlaceholderBounds = placeholder[0].getBoundingClientRect();
      DataStore.set('pop-up:resource-height', expandedPlaceholderBounds.height + 'px');
      DataStore.set('pop-up:resource-margin-top', expandedPlaceholderBounds.top - topOffset + 'px');
    }

    function prepareDescriptionForAnimation(description) {
      var height = description[0].getBoundingClientRect().height + 20 + 'px';
      DataStore.set('pop-up:description-height', height);
      description.css('height', height);
      setTimeout(function() {
        description.css('transition', 'height ' + animationDuration/1000 + 's');
      });
    }

    function triggerOpenAnimation(offsetParent, wrapper, resource, description) {
      var wrapperHeight = offsetParent[0].getBoundingClientRect().height + 'px';
      wrapper.css('height', wrapperHeight);
      DataStore.set('pop-up:wrapper-height', wrapperHeight);

      resource.css('height', '');
      resource.css('margin-top', '');
      description.css('height', '0px');
    }

    function blockScroll(offsetParent, wrapper, console) {
      wrapper.css('top', 0);
      DataStore.set('pop-up:console-scrollTop', offsetParent[0].scrollTop);
      console.addClass('scroll-disabled');
    }

    function afterAnimation(cb) {
      setTimeout(cb, animationDuration);
    }

    function restoreScroll(offsetParent, wrapper, console) {
      var scrollTop = DataStore.get('pop-up:console-scrollTop');
      console.removeClass('scroll-disabled');
      offsetParent[0].scrollTop = scrollTop;
      wrapper.css('top', scrollTop + 'px');
    }

    function triggerCloseAnimation(resource, description) {
      resource.css('height', DataStore.get('pop-up:resource-height'));
      resource.css('margin-top', parseInt(DataStore.get('pop-up:resource-margin-top'), 10) - 20 + 'px');
      description.css('height', DataStore.get('pop-up:description-height'));
    }

    return {
      beforeAddClass: function(element, className, done) {
        var elements = getElements(element);

        var originalPlaceholderBounds = beginExpansion(elements.placeholder);
        setTimeout(function() {
          rememberExpandedResourceBounds(elements.offsetParent, elements.placeholder);
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
          triggerOpenAnimation(elements.offsetParent, elements.wrapper, elements.resource, elements.description);

          afterAnimation(function() {
            elements.wrapper.css('height', '');
            elements.placeholder.css('height', DataStore.get('pop-up:resource-height'));
            blockScroll(elements.offsetParent, elements.wrapper, elements.console);

            done();
          });
        });
      },

      beforeRemoveClass: function(element, className, done) {
        var elements = getElements(element);

        restoreScroll(elements.offsetParent, elements.wrapper, elements.console);
        elements.wrapper.css('background-color', 'transparent');
        elements.wrapper.css('height', DataStore.get('pop-up:wrapper-height'));
        elements.resource.css('height', elements.resource[0].getBoundingClientRect().height + 'px'); // Safari loses the resource's height otherwise

        setTimeout(function() {
          triggerCloseAnimation(elements.resource, elements.description);
          afterAnimation(done);
        }, 10);
      },

      removeClass: function(element, className, done) {
        var elements = getElements(element);
        elements.resource.scope().$apply('selectedMethod = methodToAdd');

        elements.placeholder.css('height', '');
        elements.wrapper.css({ 'background-color': '', 'height': '' });
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
