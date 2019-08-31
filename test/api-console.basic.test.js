import { fixture, assert, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import '../api-console.js';

//
//  Tests for computations that do not require AMF model.
//

describe('<api-console>', function() {
  async function basicFixture() {
    return (await fixture(`<api-console></api-console>`));
  }

  async function awareFixture() {
    return (await fixture(`<api-console aware="test"></api-console>`));
  }

  async function requestFixture() {
    return (await fixture(`<api-console page="request"></api-console>`));
  }

  describe('RAML aware', () => {
    it('Adds raml-aware to the DOM if aware is set', async () => {
      const element = await awareFixture();
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.ok(node);
    });

    it('passes AMF model', async () => {
      const element = await awareFixture();
      const aware = document.createElement('raml-aware');
      aware.scope = 'test';
      aware.api = [{}];
      assert.deepEqual(element.amf, [{}]);
      await aTimeout();
    });

    it('raml-aware is not in the DOM by default', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.notOk(node);
    });
  });

  describe('built-in model downloading', () => {
    let element;
    let xhr;
    let requests;
    before(() => {
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = function(xhr) {
        requests.push(xhr);
      };
    });

    after(() => {
      xhr.restore();
    });

    beforeEach(async () => {
      requests = [];
      element = await basicFixture();
    });

    it('does nothing when no argument', () => {
      element._modelLocationChanged();
      assert.equal(requests.length, 0);
    });

    it('downloads model from remote location', () => {
      element.modelLocation = 'apip.json';
      assert.equal(requests.length, 1);
      requests[0].respond(200, {
        'Content-Type': 'application/json' },
        '[{"@context":{}, "@id": "","@type": []}]');
      assert.typeOf(element.amf, 'array');
    });

    it('calls _apiLoadErrorHandler() when url is invalid', () => {
      const callback = sinon.spy(element, '_apiLoadErrorHandler');
      element.modelLocation = 'error.json';
      requests[0].respond(404, {
        'Content-Type': 'text/plain' },
        'nothing');
      assert.isTrue(callback.called);
    });
  });

  describe('_notifyApicExtension()', () => {
    it('dispatches api-console-ready custom event (automatically)', async () => {
      const spy = sinon.spy();
      document.body.addEventListener('api-console-ready', spy);
      await basicFixture();
      assert.isTrue(spy.called);
    });
  });

  describe('Navigation events', () => {
    let element;
    const SEL_ID = 'test-id';
    const SEL_TYPE = 'test-type';

    beforeEach(async () => {
      element = await requestFixture();
    });

    it('Closes request panel', () => {
      element._apiNavigationOcurred({
        detail: {
          selected: SEL_ID,
          type: SEL_TYPE
        }
      });
      assert.equal(element.page, 'docs');
    });

    it('Do not closes request panel when passive navigation', () => {
      element.selectedShape = SEL_ID;
      element.selectedShapeType = SEL_TYPE;
      element.page = 'request';
      element._apiNavigationOcurred({
        detail: {
          selected: SEL_ID,
          type: SEL_TYPE,
          passive: true
        }
      });
      assert.equal(element.page, 'request');
    });

    it('Sets selectedShape', () => {
      element._apiNavigationOcurred({
        detail: {
          selected: SEL_ID,
          type: SEL_TYPE
        }
      });
      assert.equal(element.selectedShape, SEL_ID);
    });

    it('Sets selectedShapeType', () => {
      element._apiNavigationOcurred({
        detail: {
          selected: SEL_ID,
          type: SEL_TYPE
        }
      });
      assert.equal(element.selectedShapeType, SEL_TYPE);
    });
  });

  describe('resetSelection()', () => {
    it('resets page to "docs"', async () => {
      const element = await requestFixture();
      element.resetSelection();
      assert.equal(element.page, 'docs');
    });

    it('resets selectedShape"', async () => {
      const element = await basicFixture();
      element.selectedShape = 'amf://#1';
      element.resetSelection();
      assert.equal(element.selectedShape, 'summary');
    });

    it('resets selectedShapeType"', async () => {
      const element = await basicFixture();
      element.selectedShapeType = 'type';
      element.resetSelection();
      assert.equal(element.selectedShapeType, 'summary');
    });
  });

  describe('_apiLoadEndHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets amfModel property', () => {
      element._apiLoadEndHandler({
        response: '[{"@context":{}, "@id": "","@type": []}]'
      });
      assert.typeOf(element.amfModel, 'array');
    });

    it('Calles _apiLoadErrorHandler when response is not valid', () => {
      const callback = sinon.spy(element, '_apiLoadErrorHandler');
      element._apiLoadEndHandler({
        response: '[{"@context":'
      });
      assert.isTrue(callback.called);
    });
  });

  describe('_apiLoadErrorHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets message on the toast', () => {
      element._apiLoadErrorHandler(new Error('test'));
      assert.typeOf(element.shadowRoot.querySelector('#apiLoadErrorToast').text, 'string');
    });

    it('The toast is opened', () => {
      element._apiLoadErrorHandler(new Error('test'));
      assert.isTrue(element.shadowRoot.querySelector('#apiLoadErrorToast').opened);
    });
  });
});
