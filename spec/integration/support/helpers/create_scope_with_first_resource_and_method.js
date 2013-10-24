function createScopeWithFirstResourceAndMethod(parsedApi) {
  scope = createScope(function(scope) {
    scope.api = RAML.Inspector.create(parsedApi);
    scope.resource = scope.api.resources[0];
    scope.method = scope.resource.methods[0];
  });
  return scope;
};
