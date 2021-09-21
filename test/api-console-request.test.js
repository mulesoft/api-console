import {fixture, assert, html, nextFrame, aTimeout} from '@open-wc/testing';
import * as sinon from 'sinon';
import {AmfLoader, ApiDescribe} from './amf-loader.js';
import '../api-console.js';
import {
  documentationTryItButton,
  navigationSelectEndpointMethod,
  requestBodySection,
  requestHeadersSection,
  requestQueryParamSection, requestSendButton,
  requestUrlSection
} from './testHelper.js';

/** @typedef {import('..').ApiConsole} ApiConsole */

describe('API Console request', () => {
  /**
   * @returns {Promise<ApiConsole>}
   */
  async function amfFixture(amf) {
    return (fixture(html`
        <api-console .amf="${amf}"></api-console>
    `));
  }

  const testApi = 'test-api';

  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true)
  ].forEach(({label, compact}) => {
    describe(label, () => {
      let element;
      let amf;
      let spy;

      before(async () => {
        amf = await AmfLoader.load({compact, fileName: testApi});
      });

      beforeEach(async () => {
        element = await amfFixture(amf);
      });

      describe('Sections', () => {
        beforeEach(async () => {
          await navigationSelectEndpointMethod(element, '/test-headers', 'post');
          await aTimeout(50)
          documentationTryItButton(element).click();
          await aTimeout(50)
        });

        it(`should render all sections`, async () => {
          assert.exists(requestUrlSection(element));
          assert.exists(requestQueryParamSection(element));
          assert.exists(requestHeadersSection(element));
          assert.exists(requestBodySection(element));
          assert.exists(requestSendButton(element));
        });
      });

      describe('Headers', () => {
        beforeEach(async () => {
          await navigationSelectEndpointMethod(element, '/test-headers', 'post');
          await aTimeout(50)
          documentationTryItButton(element).click()
          await aTimeout(50)
        });

        it(`should render header section`, async () => {
          assert.exists(requestHeadersSection(element));
        });

        it(`should render all buttons`, async () => {
          const headers = requestHeadersSection(element);
          assert.exists(headers.shadowRoot.querySelector('.copy-button'));
          assert.exists(headers.shadowRoot.querySelector('.editor-switch'));
        });

        it(`should render all headers`, async () => {
          const headers = requestHeadersSection(element);
          const form = headers.shadowRoot.querySelector('api-form-item');
          const inputs = form.shadowRoot.querySelectorAll('anypoint-input');
          assert.lengthOf(inputs, 1);
          assert.equal(inputs[0].getAttribute('data-form-item-name'), 'Cache-Control');

          const removeButton = headers.shadowRoot.querySelector('anypoint-icon-button');
          assert.equal(removeButton.getAttribute('title'), 'Remove this parameter');
        });

        describe('Request with headers', () => {
          beforeEach(async () => {
            spy = sinon.spy();
            document.body.addEventListener('api-request', spy);
          });

          it(`should add all headers to request`, async () => {
            requestSendButton(element).click();
            await nextFrame();

            assert.isTrue(spy.called);
            assert.equal(spy.getCall(0).args[0].detail.headers, 'Cache-Control: only-if-cached\ncontent-type: application/json');
          });

          it(`should remove headers`, async () => {
            const headers = requestHeadersSection(element);
            headers.shadowRoot.querySelector('anypoint-icon-button').click();
            await nextFrame();

            requestSendButton(element).click();
            await nextFrame();

            assert.isTrue(spy.called);
            assert.equal(spy.getCall(0).args[0].detail.headers, 'content-type: application/json');
          });
        });
      });

      describe('Body', () => {
        beforeEach(async () => {
          await navigationSelectEndpointMethod(element, '/test-headers', 'post');
          await aTimeout(50)
          documentationTryItButton(element).click()
          await aTimeout(50)
        });

        it(`should render body section`, async () => {
          assert.exists(requestBodySection(element));
        });

        it(`should render raw editor`, async () => {
          const body = requestBodySection(element);
          assert.exists(body.shadowRoot.querySelector('raw-payload-editor'));
        });
      });
    });
  });
});
