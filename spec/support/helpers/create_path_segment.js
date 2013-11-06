function createPathSegment(relativeUri, uriParameters) {
  raml = fakeResourceRAML(relativeUri, uriParameters);
  return RAML.Client.PathSegment.fromRAML(raml);
}
