function prepareHttpBackend() {
  var httpBackend;

  inject(function($httpBackend) {
    httpBackend = $httpBackend;
  });

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  return httpBackend;
}
