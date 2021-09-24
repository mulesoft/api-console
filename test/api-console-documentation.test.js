import {fixture, assert, html, aTimeout} from '@open-wc/testing';
import {AmfLoader, ApiDescribe} from './amf-loader.js';
import '../api-console.js';
import {
  documentationDocument,
  documentationPanel,
  documentationSummary, navigationSelectDocumentation,
  navigationSelectDocumentationSection,
  navigationSelectSummarySection
} from './testHelper.js';

/** @typedef {import('..').ApiConsole} ApiConsole */

describe('API Console documentation', () => {
  /**
   * @returns {Promise<ApiConsole>}
   */
  async function amfFixture(amf) {
    return (fixture(html`
        <api-console .amf="${amf}"></api-console>
    `));
  }

  const googleApi = 'google-drive-api';

  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true)
  ].forEach(({label, compact}) => {
    describe(label, () => {
      let element;
      let amf;

      before(async () => {
        amf = await AmfLoader.load({compact, fileName: googleApi});
      });

      beforeEach(async () => {
        element = await amfFixture(amf);
      });

      describe('Summary section', () => {
        beforeEach(async () => {
          navigationSelectSummarySection(element);
          await aTimeout(50)
        });

        it(`should render summary documentation panel`, async () => {
          await aTimeout(100);
          assert.ok(documentationPanel(element));
          assert.ok(documentationSummary(element));
        });

        it(`should render basic summary documentation`, async () => {
          const summaryShadowRoot = documentationSummary(element).shadowRoot;
          const title = summaryShadowRoot.querySelector('.api-title').innerText;
          await aTimeout(200);
          assert.equal(title.trim(), 'API title: Google Drive')
          const version = summaryShadowRoot.querySelector('.inline-description.version').innerText;
          await aTimeout(200);
          assert.equal(version.trim(), 'Version: v2')

          const url = summaryShadowRoot.querySelector('api-url').shadowRoot;
          const baseUri = url.querySelector('.url-area > .url-value').innerText;
          await aTimeout(200);
          assert.equal(baseUri.trim(), 'https://www.googleapis.com/drive/{version}')
          const description = summaryShadowRoot.querySelector('.marked-description').innerText;
          await aTimeout(200);
          assert.equal(description.trim(), 'Google Drive API')
        });

        it(`should render endpoints list`, async () => {
          const documentation = documentationSummary(element);
          const summaryShadowRoot = documentation.shadowRoot;
          const endpointsSection = summaryShadowRoot.querySelector('.toc');
          await aTimeout(200);
          assert.ok(endpointsSection)

          const endpoints = summaryShadowRoot.querySelectorAll('.endpoint-item');
          await aTimeout(200);
          assert.lengthOf(endpoints,32);

          const files = endpoints[0];
          await aTimeout(200);
          assert.equal(files.querySelector('.endpoint-path').innerText,'Files');
          assert.equal(files.querySelector('.endpoint-path-name').innerText,'/files');
          assert.ok(files.querySelector('.endpoint-header'));
          assert.lengthOf(files.querySelectorAll('.method-label'), 2);
        });
      });

      describe('Documentation section', () => {
        beforeEach(async () => {
          navigationSelectDocumentationSection(element);
          await aTimeout(50)
          navigationSelectDocumentation(element, 0);
          await aTimeout(50)
        });

        it(`should render documentation`, async () => {
          const item = documentationDocument(element);
          const docShadowRoot = item.shadowRoot;
          const title = docShadowRoot.querySelector('h1').innerText;
          assert.equal(title.trim(), 'Headline')
          const content = docShadowRoot.querySelector('.markdown-html').innerText;
          assert.equal(content.trim(), 'Google Drive is a file storage and synchronization service created and managed by Google. It allows users to store documents in the cloud, share files, and edit documents with collaborators. Google Drive encompasses Google Docs, Sheets and Slides, an office suite that permits collaborative editing of documents, spreadsheets, presentations, drawings, forms, and more.')
        });
      });
    });
  });
});
