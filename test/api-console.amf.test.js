import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-console.js';

describe('<api-console>', function() {
  async function amfFixture(amf) {
    return (await fixture(html`
      <api-console .amf="${amf}"></api-console>
    `));
  }

  describe('AMF model computations', () => {
    [
      ['Regular model', false],
      ['Compact model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        describe('_computeMethodName()', () => {
          let element;
          let amf;
          let id;
          let webapi;

          before(async () => {
            amf = await AmfLoader.load(compact);
            webapi = AmfLoader.lookupWebApi(amf);
            const op = AmfLoader.lookupOperation(amf, '/people', 'get');
            id = op['@id'];
          });

          beforeEach(async () => {
            element = await amfFixture(amf);
          });

          it('computes after selection change', async () => {
            element.selectedShapeType = 'method';
            element.selectedShape = id;
            await aTimeout();
            assert.equal(element.methodName, 'List people');
          });

          it('returns undefined when no selectction', () => {
            const result = element._computeMethodName(undefined, webapi);
            assert.isUndefined(result);
          });

          it('returns undefined when no webapi', () => {
            const result = element._computeMethodName(id);
            assert.isUndefined(result);
          });

          it('returns undefined when no selected method', () => {
            const result = element._computeMethodName('someid');
            assert.isUndefined(result);
          });

          it('returns method name', () => {
            const result = element._computeMethodName(id, webapi);
            assert.equal(result, 'List people');
          });
        });
      });
    });
  });
});
