(function() {
  global.waitUntilTextEquals = function(element, expectedText) {
    global.protractor.getInstance().wait(function() {
      return element.getText().then(function(text) {
        return text === expectedText;
      });
    }, 5000);
  };
})()
