describe('RAML.Services.RAMLParserWrapper', function() {
  var service, rootScopeStub, parserStub;

  beforeEach(function() {
    rootScopeStub = jasmine.createSpyObj('$rootScope', ['$broadcast']);
    parserStub = jasmine.createSpyObj('ramlParser', ['load', 'loadFile']);
    service = new RAML.Services.RAMLParserWrapper(rootScopeStub, parserStub);
  });

  describe('loading RAML from a file', function() {
    var promise;

    beforeEach(function() {
      promise = jasmine.createSpyObj('promise', ['then'])
      parserStub.loadFile.andReturn(promise);
      service.load('some.raml');
    });

    it('calls loadFile on the RAML Parser', function() {
      expect(parserStub.loadFile).toHaveBeenCalledWith('some.raml');
    });

    describe('when the parser succeeds', function() {
      beforeEach(function() {
        promise.then.mostRecentCall.args[0]('success');
      });

      it('broadcasts an event', function() {
        expect(rootScopeStub.$broadcast).toHaveBeenCalledWith('event:raml-parsed', 'success');
      });
    });

    describe('when the parser fails', function() {
      beforeEach(function() {
        promise.then.mostRecentCall.args[1]('failure');
      });

      it('broadcasts an event', function() {
        expect(rootScopeStub.$broadcast).toHaveBeenCalledWith('event:raml-invalid', 'failure');
      });
    });
  });

  describe('parsing RAML from a string', function() {
    beforeEach(function() {
      promise = jasmine.createSpyObj('promise', ['then']);
      parserStub.load.andReturn(promise);
      service.parse('I AM RAML');
    });

    it('calls loadFile on the RAML Parser', function() {
      expect(parserStub.load).toHaveBeenCalledWith('I AM RAML');
    });

    describe('when the parser succeeds', function() {
      beforeEach(function() {
        promise.then.mostRecentCall.args[0]('success');
      });

      it('broadcasts an event', function() {
        expect(rootScopeStub.$broadcast).toHaveBeenCalledWith('event:raml-parsed', 'success');
      });
    });

    describe('when the parser fails', function() {
      beforeEach(function() {
        promise.then.mostRecentCall.args[1]('failure');
      });

      it('broadcasts an event', function() {
        expect(rootScopeStub.$broadcast).toHaveBeenCalledWith('event:raml-invalid', 'failure');
      });
    });
  });
});
