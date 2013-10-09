function createScope(cb) {
  var scope;
  inject(function($rootScope) {
    scope = $rootScope.$new();
    if (cb) {
      cb(scope);
    }
  });

  return scope;
}
