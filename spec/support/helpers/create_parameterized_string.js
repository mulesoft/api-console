function createParameterizedString(relativeUri, uriParameters) {
  raml = fakeResourceRAML(relativeUri, uriParameters);
  return RAML.Client.createPathSegment(raml);
}
