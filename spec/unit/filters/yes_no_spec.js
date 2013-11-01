describe("RAML.Filters.yesNo", function() {
  var filter;

  beforeEach(function() {
    filter = RAML.Filters.yesNo();
  });

  it("outputs 'yes' for truthy values", function() {
    expect(filter(1)).toEqual("Yes");
    expect(filter(true)).toEqual("Yes");
    expect(filter("cats")).toEqual("Yes");
  });

  it("returns 'No' for truthy values", function() {
    expect(filter(0)).toEqual("No");
    expect(filter(false)).toEqual("No");
    expect(filter(undefined)).toEqual("No");
    expect(filter(null)).toEqual("No");
  });

});
