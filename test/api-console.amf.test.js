/* eslint-disable no-param-reassign */
import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import { AmfLoader, ApiDescribe } from './amf-loader.js';
import '../api-console.js';

/** @typedef {import('..').ApiConsole} ApiConsole */

describe('ApiConsole', () => {
  /**
   * @returns {Promise<ApiConsole>}
   */
  async function amfFixture(amf) {
    return (fixture(html`
      <api-console .amf="${amf}"></api-console>
    `));
  }

  /**
   * @returns {Promise<ApiConsole>}
   */
  async function selectedFixture(amf, selected, type) {
    const element = /** @type ApiConsole */ (await fixture(html`
      <api-console
        .amf="${amf}"
        .selectedShape="${selected}"
        .selectedShapeType="${type}"
      ></api-console>
    `));
    await aTimeout(0);
    return element;
  }

  function selectOperation(element, endpointName, operationName) {
    const operation = AmfLoader.lookupOperation(element.amf, endpointName, operationName);
    const operationId = operation['@id'];
    element.selectedShape = operationId;
    element.selectedShapeType = 'method';
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

          it('returns undefined when no selection', () => {
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

        describe('api-documentation', () => {
          let element;
          let amf;

          before(async () => {
            amf = await AmfLoader.load({ compact });
          });

          beforeEach(async () => {
            element = await amfFixture(amf);
          });

          it('should not render method-label nor method-value in Summary view', async () => {
            element = await selectedFixture(amf, 'summary', 'summary')
            await nextFrame();
            await nextFrame();
            await nextFrame();
            const apiDocumentation = element.shadowRoot.querySelector('api-documentation');
            const apiSummary = apiDocumentation.shadowRoot.querySelector('api-summary');
            const apiUrl = apiSummary.shadowRoot.querySelector('api-url');
            assert.notExists(apiUrl.shadowRoot.querySelector('.method-label'));
            assert.notExists(apiUrl.shadowRoot.querySelector('.method-value'));
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

          it('auto-selects the default server', async () => {
            const op = AmfLoader.lookupOperation(amf, '/default', 'get');
            const element = await selectedFixture(amf, op['@id'], 'method');
            assert.equal(element.serverValue, 'https://{customerId}.saas-app.com:{port}/v2');
            assert.equal(element.serverType, 'server');
          });

          it('auto-selects the default server that has no variables', async () => {
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

  describe('AsyncAPI', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true),
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'async-api' });
        });

        beforeEach(async () => {
          element = await amfFixture(amf);
          await aTimeout(0);
        });

        it('should have _noTryItValue set to true', () => {
          assert.isTrue(element._noTryItValue);
        });
      });
    });
  });

  describe('APIC-553', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true),
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'APIC-553' });
        });

        beforeEach(async () => {
          element = await amfFixture(amf);
          await aTimeout(0);
        });

        it('should have URL set', async () => {
          selectOperation(element, '/cmt', 'get');
          await nextFrame();
          await nextFrame();
          await nextFrame();
          const apiDocumentation = element.shadowRoot.querySelector('api-documentation');
          const apiMethodDocumentation = apiDocumentation.shadowRoot.querySelector('api-method-documentation');
          assert.equal(apiMethodDocumentation.shadowRoot.querySelector('api-url').url, 'http://domain.org/cmt');
        });
      });
    });
  });

  describe('APIC-554', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true),
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'APIC-554' });
        });

        beforeEach(async () => {
          element = await amfFixture(amf);
          await aTimeout(0);
        });

        it('should set correct navigation labels', async () => {
          const apiNavigation = element.shadowRoot.querySelector('api-navigation');
          const labels = ['/customer/{customerId}/chromeos', '/deviceId', '/customerId'];
          assert.deepEqual(apiNavigation._endpoints.map(e => e.label), labels);
        });
      });
    });
  });

  describe('APIC-557', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true),
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'APIC-557' });
        });

        beforeEach(async () => {
          element = await amfFixture(amf);
          await aTimeout(0);
        });

        it('should update api-url url value on server change', async () => {
          selectOperation(element, '/pets', 'get');
          await nextFrame();
          await nextFrame();
          await nextFrame();
          const apiDocumentation = element.shadowRoot.querySelector('api-documentation');
          const apiMethodDocumentation = apiDocumentation.shadowRoot.querySelector('api-method-documentation');
          const apiUrl = apiMethodDocumentation.shadowRoot.querySelector('api-url');
          assert.equal(apiUrl.url, 'http://petstore.swagger.io/v1/pets');
          apiDocumentation.serverValue = 'http://qa.petstore.swagger.io/v1';
          apiDocumentation.serverType = 'server';
          await nextFrame();
          assert.equal(apiUrl.url, 'http://qa.petstore.swagger.io/v1/pets');
        });
      });
    });
  });

  describe('APIC-559', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true)
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'async-api' });
        });

        beforeEach(async () => {
          element = await selectedFixture(amf, 'summary', 'summary');
          await aTimeout(0);
        });

        it('should render Publish and Subscribe operations with styles in Summary panel', () => {
          const documentation = element.shadowRoot.querySelector('api-documentation');
          const summary = documentation.shadowRoot.querySelector('api-summary');
          const methodLabels = summary.shadowRoot.querySelectorAll('.method-label');
          assert.lengthOf(methodLabels, 2);
          const [pub, sub] = methodLabels;
          assert.notEqual(getComputedStyle(pub).backgroundColor, getComputedStyle(sub).backgroundColor);
        });
      });
    });
  });

  describe('APIC-571', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true)
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'async-api' });
        });

        beforeEach(async () => {
          // eslint-disable-next-line no-unused-vars
          const [_, operation] = AmfLoader.lookupEndpointOperation(amf, 'hello', 'publish');
          element = await selectedFixture(amf, operation['@id'], 'method');
          await aTimeout(0);
        });

        it('should render style Publish operation in method documentation', () => {
          const documentation = element.shadowRoot.querySelector('api-documentation');
          const methodDocumentation = documentation.shadowRoot.querySelector('api-method-documentation');
          const apiUrl = methodDocumentation.shadowRoot.querySelector('api-url');
          const methodLabel = apiUrl.shadowRoot.querySelector('.method-label');
          assert.equal(getComputedStyle(methodLabel).backgroundColor, 'rgba(31, 157, 85, 0.12)');
        });
      });
    });
  });

  describe('APIC-570', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true)
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'async-api' });
        });

        beforeEach(async () => {
          element = await selectedFixture(amf, 'summary', 'summary');
          await aTimeout(0);
        });

        it('should not prefix URL with `http://', () => {
          const documentation = element.shadowRoot.querySelector('api-documentation');
          const summary = documentation.shadowRoot.querySelector('api-summary');
          const apiUrl = summary.shadowRoot.querySelector('api-url');
          assert.isFalse(apiUrl.url.startsWith('http') || apiUrl.url.startsWith('https'));
        });
      });
    });
  });

  describe('APIC-562', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true)
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'async-api' });
        });

        beforeEach(async () => {
          element = await selectedFixture(amf, 'summary', 'summary');
          await aTimeout(0);
        });

        it('should not prefix URL with `http://', () => {
          const documentation = element.shadowRoot.querySelector('api-documentation');
          const summary = documentation.shadowRoot.querySelector('api-summary');
          const message = summary.shadowRoot.querySelector('.section.endpoints-title')
          assert.equal(message.textContent, 'API channels');
        });
      });
    });
  });

  describe('APIC-561', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true)
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'anyOf' });
        });

        beforeEach(async () => {
          // eslint-disable-next-line no-unused-vars
          const [_, operation] = AmfLoader.lookupEndpointOperation(amf, 'test', 'publish');
          element = await selectedFixture(amf, operation['@id'], 'method');
          await aTimeout(0);
        });

        it('should render correct type for anyOf body', async () => {
          const documentation = element.shadowRoot.querySelector('api-documentation');
          const methodDocumentation = documentation.shadowRoot.querySelector('api-method-documentation');
          const bodyDocument = methodDocumentation.shadowRoot.querySelector('api-body-document');
          bodyDocument.shadowRoot.querySelector('.section-title-area').click();
          await nextFrame();
          await nextFrame();
          const typeDocument = bodyDocument.shadowRoot.querySelector('api-type-document');
          assert.exists(typeDocument);
        });
      });
    });
  });

  describe('APIC-560', () => {
    [
      new ApiDescribe('Regular model'),
      new ApiDescribe('Compact model', true)
    ].forEach(({ label, compact }) => {
      describe(label, () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load({ compact, fileName: 'streetlights' });
        });

        beforeEach(async () => {
          const path = 'smartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured';
          // TODO this needs to be changed to 'publish' once AMF bug is fixed
          // eslint-disable-next-line no-unused-vars
          const [_, operation] = AmfLoader.lookupEndpointOperation(amf, path, 'subscribe');
          element = await selectedFixture(amf, operation['@id'], 'method');
          await aTimeout(0);
        });

        it('should render channel and server separately', async () => {
          const documentation = element.shadowRoot.querySelector('api-documentation');
          const methodDocumentation = documentation.shadowRoot.querySelector('api-method-documentation');
          const apiUrl = methodDocumentation.shadowRoot.querySelector('api-url');
          assert.exists(apiUrl.shadowRoot.querySelector('.url-channel-value'));
          assert.exists(apiUrl.shadowRoot.querySelector('.url-server-value'));
        });
      });
    });
  });
});
