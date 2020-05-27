import { fixture, assert, aTimeout, html, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { isChrome } from '../src/ApiConsole.js';
import '../api-console.js';

//
//  Tests for computations that do not require AMF model.
//

describe('<api-console>', function () {
  async function basicFixture() {
    return (await fixture(`<api-console></api-console>`));
  }

  async function awareFixture() {
    return (await fixture(`<api-console aware="test"></api-console>`));
  }

  async function requestFixture() {
    return (await fixture(`<api-console page="request"></api-console>`));
  }

  async function noAttributionFixture() {
    return (await fixture(`<api-console noattribution></api-console>`));
  }

  async function extensionFixture() {
    return (await fixture(`<api-console allowExtensionBanner page="request"></api-console>`));
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
      await aTimeout(0);
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
      xhr.onCreate = function (xhr) {
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
        'Content-Type': 'application/json'
      },
        '[{"@context":{}, "@id": "","@type": []}]');
      assert.typeOf(element.amf, 'array');
    });

    it('returns set location from the getter', () => {
      element.modelLocation = 'apip.json';
      assert.equal(element.modelLocation, 'apip.json');
    });

    it('calls _apiLoadErrorHandler() when url is invalid', () => {
      const callback = sinon.spy(element, '_apiLoadErrorHandler');
      element.modelLocation = 'error.json';
      requests[0].respond(404, {
        'Content-Type': 'text/plain'
      },
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

    it('Sets amf property', () => {
      element._apiLoadEndHandler({
        response: '[{"@context":{}, "@id": "","@type": []}]'
      });
      assert.typeOf(element.amf, 'array');
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

  describe('Attribution', function () {
    it('Attribution logo is rendered', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.powered-by');
      assert.ok(node);
    });

    it('Attribution is removed from the DOM', async () => {
      const element = await noAttributionFixture();
      const node = element.shadowRoot.querySelector('.powered-by');
      assert.notOk(node);
    });
  });

  describe('page rendering', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders documentation page', async () => {
      element.page = 'docs';
      await aTimeout(0);
      const docs = element.shadowRoot.querySelector('api-documentation');
      assert.ok(docs);
    });

    it('renders request panel', async () => {
      element.page = 'request';
      await aTimeout(0);
      const docs = element.shadowRoot.querySelector('api-request-panel');
      assert.ok(docs);
    });

    it('renders no content when invalid selection', async () => {
      element.page = 'something';
      await aTimeout(0);
      const main = element.shadowRoot.querySelector('.main-content');
      const filtered = Array.from(main.children).filter((node) => node.nodeName !== 'SLOT');
      assert.lengthOf(filtered, 0);
    });
  });

  describe('navigation element view', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('does not render scrim when navigation is not opened', () => {
      const scrim = element.shadowRoot.querySelector('.nav-scrim');
      assert.notOk(scrim);
    });

    it('navigation is hidden outside the viewport', () => {
      const nav = element.shadowRoot.querySelector('.nav-drawer');
      const transform = getComputedStyle(nav).transform;
      assert.include(transform, '-256'); // default width
    });

    it('renders scrim when navigation is opened', async () => {
      element.navigationOpened = true;
      await aTimeout(0);
      const scrim = element.shadowRoot.querySelector('.nav-scrim');
      assert.ok(scrim);
    });

    it('Navigation is rendered on screen', async () => {
      element.navigationOpened = true;
      await aTimeout(350);
      const nav = element.shadowRoot.querySelector('.nav-drawer');
      const transform = getComputedStyle(nav).transform;
      assert.equal(transform, 'matrix(1, 0, 0, 1, 0, 0)')
    });

    it('closes the navigation when scrim is clicked', async () => {
      element.navigationOpened = true;
      await aTimeout(0);
      const scrim = element.shadowRoot.querySelector('.nav-scrim');
      MockInteractions.tap(scrim);
      assert.isFalse(element.navigationOpened);
    });

    it('dispatches wbwnt when closing navigation', async () => {
      element.navigationOpened = true;
      await aTimeout(0);
      const spy = sinon.spy();
      element.addEventListener('navigation-close', spy);
      const scrim = element.shadowRoot.querySelector('.nav-scrim');
      MockInteractions.tap(scrim);
      assert.isTrue(spy.called);
    });
  });

  describe('model auto loading', () => {
    function basicFixture(loc) {
      return new Promise((resolve, reject) => {
        fixture(html`<api-console modelLocation="${loc}"></api-console>`)
          .then((element) => {
            element.addEventListener('model-load-success', () => resolve(element));
            element.addEventListener('model-load-error', () => reject(element));
          })
      });
    }

    it('loads a model from remote location', async () => {
      const file = '/base/demo/models/demo-api.json';
      const element = await basicFixture(file);
      assert.ok(element.amf);
    });

    it('renders error toast when location is invalid', async () => {
      const file = '/base/demo/models/invalid.json';
      let element;
      try {
        await basicFixture(file);
      } catch (e) {
        element = e;
      }
      const toast = element.shadowRoot.querySelector('#apiLoadErrorToast');
      assert.isTrue(toast.opened);
    });
  });

  describe('setting oauth data', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    afterEach(() => {
      sessionStorage.removeItem('auth.methods.latest.client_id');
      sessionStorage.removeItem('auth.methods.latest.client_secret');
    });

    it('sets client id in the session storage', () => {
      element.oauth2clientId = 'client-id';
      const sessionValue = sessionStorage.getItem('auth.methods.latest.client_id');
      assert.ok(sessionValue, 'auth.methods.latest.client_id is set');
      assert.equal(sessionValue, element.oauth2clientId, 'session value equals element set value');
    });

    it('sets client secret in the session storage', () => {
      element.oauth2clientSecret = 'client-secret';
      const sessionValue = sessionStorage.getItem('auth.methods.latest.client_secret');
      assert.ok(sessionValue, 'auth.methods.latest.client_secret is set');
      assert.equal(sessionValue, element.oauth2clientSecret, 'session value equals element set value');
    });
  });

  describe('_tryitHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets "request" page when the event is handler', () => {
      const e = new CustomEvent('tryit-requested', { bubbles: true });
      element.dispatchEvent(e);
      assert.equal(element.page, 'request');
    });
  });

  describe('Extension banner', () => {
    let element;
    beforeEach(async () => {
      element = await extensionFixture();
    });

    (isChrome ? it : it.skip)('sets "_extensionBannerActive" after a timeout', async () => {
      await aTimeout(undefined);
      assert.isTrue(element._extensionBannerActive);
    });

    (isChrome ? it.skip : it)('does not sets "_extensionBannerActive" in unsupported browser', async () => {
      await aTimeout(0);
      assert.isUndefined(element._extensionBannerActive);
    });

    (isChrome ? it : it.skip)('renders the banner', async () => {
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('.extension-banner');
      assert.ok(node, 'banner container is rendered');
      assert.isTrue(node.hasAttribute('active'), 'banner is active');
    });

    (isChrome ? it : it.skip)('hides the banner when api-console-extension-installed', async () => {
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-console-ext-comm');
      const e = new CustomEvent('api-console-extension-installed');
      node.dispatchEvent(e);
      const banner = element.shadowRoot.querySelector('.extension-banner');
      assert.ok(banner, 'banner container is rendered');
      assert.isTrue(banner.hasAttribute('active'), 'banner is active');
    });

    (isChrome ? it : it.skip)('hides the banner when close icon click', async () => {
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('.extension-banner anypoint-icon-button');
      MockInteractions.tap(node);
      await aTimeout(0);
      const banner = element.shadowRoot.querySelector('.extension-banner');
      assert.ok(banner, 'banner container is rendered');
      assert.isFalse(banner.hasAttribute('active'), 'banner is not active');
    });
  });

  describe('#_rendersRequestPanel', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns true when page is request', () => {
      element.page = 'request';
      assert.isTrue(element._rendersRequestPanel);
    });

    it('returns false when page is not request', () => {
      element.page = 'docs';
      assert.isFalse(element._rendersRequestPanel);
    });
  });

  describe('#_noServerSelector', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns value of noServerSelector', () => {
      element.noServerSelector = true;
      assert.isTrue(element.noServerSelector);
    });

    it('returns default value', () => {
      assert.isFalse(element.noServerSelector);
    });
  });

  describe('apiserverchanged event', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    function dispatchEvent(element, value, type) {
      // technically only the docs and request panels sends this event but since
      // the component listens on itself for this event then it doesn't matter
      // which component did send the event.
      const node = element.shadowRoot.querySelectorAll('*')[0];
      const e = new CustomEvent('apiserverchanged', {
        detail: { value, type },
        bubbles: true,
        composed: true,
      });
      node.dispatchEvent(e);
    }

    it('sets serverValue property', () => {
      dispatchEvent(element, 'test', 'custom');
      assert.equal(element.serverValue, 'test');
    });

    it('sets serverType property', () => {
      dispatchEvent(element, 'test', 'custom');
      assert.equal(element.serverType, 'custom');
    });

    it.skip('propagates the selection back to the documentation element', async () => {
      dispatchEvent(element, 'test', 'custom');
      await nextFrame();
      const node = element.shadowRoot.querySelector('api-documentation');
      assert.equal(node.serverValue, 'test', 'serverValue is set');
      assert.equal(node.serverType, 'custom', 'serverType is set');
    });

    it('propagates the selection back to the request panel', async () => {
      dispatchEvent(element, 'test', 'custom');
      element.page = 'request';
      await nextFrame();
      const node = element.shadowRoot.querySelector('api-request-panel');
      assert.equal(node.serverValue, 'test', 'serverValue is set');
      assert.equal(node.serverType, 'custom', 'serverType is set');
    });
  });
});
