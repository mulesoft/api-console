beforeEach(function() {
  this.addMatchers({
    toHaveLength: function(expected) {
      return this.actual.length == expected;
    }
  });
});
