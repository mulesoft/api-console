$.fn.fillIn = function(value) {
  this.val(value);
  var inputEvent = document.createEvent('CustomEvent');
  inputEvent.initCustomEvent('input', false, false, null);
  this[0].dispatchEvent(inputEvent);

  return this;
};
