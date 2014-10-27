"use strict"

if (typeof window === 'undefined') {
    var raml = require('../../lib/raml.js')
    var chai = require('chai')
        , expect = chai.expect
        , should = chai.should();
    var chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
} else {
    var raml = RAML.Parser;
    chai.should();
}

describe('Parser', function() {
    describe('Include', function() {
        it('should succeed on including local files', function(done) {
            raml.loadFile('test/raml-files/local.yml').should.eventually.deep.equal({
                title: 'MyApi',
                documentation: [
                    { title: 'Getting Started', content: '# Getting Started\n\nThis is a getting started guide.' }
                ]
            }).and.notify(done);
        });
    });
});
