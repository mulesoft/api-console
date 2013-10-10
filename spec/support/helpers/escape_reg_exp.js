(function(scope) {
  scope.escapeRegExp = function(string) {
    // at the end of the "Using Special Characters" section
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }
})(typeof(global) !== "undefined" ? global : window);
