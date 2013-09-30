function createScope(cb) {
  var scope;
  inject(function($rootScope) {
    scope = $rootScope.$new();
    cb(scope);
  });

  return scope
}
