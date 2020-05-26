import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import { AmfLoader, ApiDescribe } from './amf-loader.js';
import '../api-console.js';

describe('<api-console>', function() {
  async function amfFixture(amf) {
    return (await fixture(html`
      <api-console .amf="${amf}"></api-console>
    `));
  }

  async function selectedFixture(amf, selected, type) {
    const element = (await fixture(html`
      <api-console
        .amf="${amf}"
        .selectedShape="${selected}"
        .selectedShapeType="${type}"
      ></api-console>
    `));
    await aTimeout(0);
    return element;
  }

  describe('AMF model computations', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true),
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        describe('_computeMethodName()', () => {
          let element;
          let amf;
          let id;
          let webapi;

          before(async () => {
            amf = await AmfLoader.load({ compact });
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
            await aTimeout(0);
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

  describe('OAS 3 multi server support', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true),
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        const fileName = 'multi-server';

        describe('server selection', () => {
          let amf;
          before(async () => {
            amf = await AmfLoader.load({ compact, fileName });
          });

          it('autoselects the default server', async () => {
            const op = AmfLoader.lookupOperation(amf, '/default', 'get');
            const element = await selectedFixture(amf, op['@id'], 'method');
            assert.equal(element.serverValue, 'https://{customerId}.saas-app.com:{port}/v2');
            assert.equal(element.serverType, 'server');
          });

          it('autoselects the default server that has no variables', async () => {
            const op = AmfLoader.lookupOperation(amf, '/files', 'get');
            const element = await selectedFixture(amf, op['@id'], 'method');
            assert.equal(element.serverValue, 'https://files.example.com');
            assert.equal(element.serverType, 'server');
          });
        });

        describe('slot rendering', () => {
          let amf;
          before(async () => {
            amf = await AmfLoader.load({ compact, fileName });
          });

          it('renders the slot when page is documentation', async () => {
            const op = AmfLoader.lookupOperation(amf, '/default', 'get');
            const element = await selectedFixture(amf, op['@id'], 'method');
            const slot = element.shadowRoot.querySelector('api-documentation slot');
            assert.ok(slot);
          });

          it('removes slot when page is request', async () => {
            const op = AmfLoader.lookupOperation(amf, '/default', 'get');
            const element = await selectedFixture(amf, op['@id'], 'method');
            element.page = 'request';
            await nextFrame();
            const slot = element.shadowRoot.querySelector('api-documentation slot');
            assert.notOk(slot);
          });

          it('request panel has slot', async () => {
            const op = AmfLoader.lookupOperation(amf, '/default', 'get');
            const element = await selectedFixture(amf, op['@id'], 'method');
            element.page = 'request';
            await nextFrame();
            const slot = element.shadowRoot.querySelector('api-request-panel slot');
            assert.ok(slot);
          });
        });
      });
    });
  });
});
