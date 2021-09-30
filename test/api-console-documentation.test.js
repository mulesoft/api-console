import {fixture, assert, html, aTimeout} from '@open-wc/testing';
import {AmfLoader, ApiDescribe} from './amf-loader.js';
import '../api-console.js';
import {
  documentationDocument,
  documentationPanel, documentationSecurity,
  documentationSummary, navigationSelectDocumentation,
  navigationSelectDocumentationSection, navigationSelectSecurity, navigationSelectSecuritySection,
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
  const testApi = 'test-api';
  let element;
  let amf;

  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true)
  ].forEach(({label, compact}) => {
    describe(label, () => {
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

  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true)
  ].forEach(({label, compact}) => {
    describe(label, () => {
      before(async () => {
        amf = await AmfLoader.load({compact, fileName: testApi});
      });

      beforeEach(async () => {
        element = await amfFixture(amf);
      });

      describe('Security section', () => {
        const testSecurityTitleAndDescription = (elem, title, description) => {
          const item = documentationSecurity(elem);
          const securityShadowRoot = item.shadowRoot;
          const h2 = securityShadowRoot.querySelector('h2').innerText;
          assert.equal(h2.trim(), title)
          const marked = securityShadowRoot.querySelector('arc-marked');
          const markdown = marked.querySelector('.markdown-body').innerText;
          assert.equal(markdown.trim(), description)
        }

        const testCollapsibleSection = (elem, title) => {
          const headersSection = elem.shadowRoot.querySelector('.section-title-area');
          assert.equal(headersSection.getAttribute('data-opened'), '')
          assert.equal(headersSection.querySelector('.heading3').innerText, title)
          assert.ok(headersSection.querySelector('.toggle-button'))

          const headersContent = elem.shadowRoot.querySelector('anypoint-collapse');
          assert.equal(headersContent.getAttribute('collapse-opened'), '')
        }

        const testHeadersCollapsibleSection = (elem) => {
          const item = documentationSecurity(elem);
          const securityShadowRoot = item.shadowRoot;
          const headers = securityShadowRoot.querySelector('api-headers-document');
          testCollapsibleSection(headers, 'Headers');
        }

        const testNoExamplesTypeDocument = (elem) => {
          const typeDocument = elem.querySelector('api-type-document');
          const typeExamples = typeDocument.shadowRoot.querySelector('.examples');
          assert.equal(typeExamples.getAttribute('hidden'), '')
        }

        const testTypeDocumentShape = (elem, propName, propType, propDescription, requiredType) => {
          const typeDocument = elem.querySelector('api-type-document');
          const shape = typeDocument.shadowRoot.querySelector('property-shape-document');
          assert.equal(shape.shadowRoot.querySelector('.property-title .property-name').innerText, propName);
          assert.equal(shape.shadowRoot.querySelector('.property-traits .data-type').innerText, propType);
          assert.equal(shape.shadowRoot.querySelector('.property-traits .required-type').innerText, requiredType);
          assert.equal(shape.shadowRoot.querySelector('arc-marked').querySelector('.markdown-body').innerText.trim(), propDescription);
        }

        const testSecurityResponses = (elem, expectedTabs, selectedTabContent) => {
          const item = documentationSecurity(elem);
          const securityShadowRoot = item.shadowRoot;
          const responses = securityShadowRoot.querySelector('.response-documentation');
          assert.equal(responses.querySelector('h3').innerText, 'Responses')

          const responsesDocument = responses.querySelector('api-responses-document');
          const tabs = responsesDocument.shadowRoot.querySelector('.codes-selector anypoint-tabs');
          const tabsList = tabs.querySelectorAll('anypoint-tab');
          assert.lengthOf(tabsList, expectedTabs.length)
          assert.equal(tabsList[0].getAttribute('class'), 'selected')
          tabsList.forEach((t, index) => assert.equal(t.innerText, expectedTabs[index]))

          const methodResponse = responsesDocument.shadowRoot.querySelector('.method-response arc-marked');
          assert.equal(methodResponse.querySelector('.markdown-body').innerText, selectedTabContent);
        }

        describe('x-other', () => {
          beforeEach(async () => {
            navigationSelectSecuritySection(element);
            await aTimeout(50)
            navigationSelectSecurity(element, 0);
            await aTimeout(100)
          });

          it(`should render security title and description`, async () => {
            testSecurityTitleAndDescription(element, 'x-custom', 'A custom security scheme for authenticating requests.')
          });

          it(`should render headers section`, async () => {
            testHeadersCollapsibleSection(element);
          });

          it(`should render security headers content`, async () => {
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const headersDocument = securityShadowRoot.querySelector('api-headers-document');
            const collapse = headersDocument.shadowRoot.querySelector('anypoint-collapse');
            testNoExamplesTypeDocument(collapse);
            testTypeDocumentShape(collapse, 'SpecialToken', 'String', 'Used to send a custom token.', 'Required')
            const typeDocument = collapse.querySelector('api-type-document');
            const shape = typeDocument.shadowRoot.querySelector('property-shape-document');
            const range = shape.shadowRoot.querySelector('property-range-document');
            const resourceExample = range.shadowRoot.querySelector('api-resource-example-document');
            assert.equal(resourceExample.shadowRoot.querySelector('.example-title').innerText, 'Example');

            const example = resourceExample.shadowRoot.querySelector('.renderer');
            const exampleHighlight = example.querySelector('api-example-render').shadowRoot.querySelector('prism-highlight');
            assert.equal(exampleHighlight.shadowRoot.querySelector('.parsed-content').innerText.trim(), 'special-token');
          });

          it(`should render responses`, async () => {
            testSecurityResponses(element, ['401', '403'], 'Bad token.')
          });
        });

        describe('OAuth 1.0', () => {
          beforeEach(async () => {
            navigationSelectSecuritySection(element);
            await aTimeout(50)
            navigationSelectSecurity(element, 1);
            await aTimeout(50)
          });

          it(`should render security title and description`, async () => {
            testSecurityTitleAndDescription(element, 'OAuth 1.0', 'OAuth 1.0 continues to be supported for all API requests, but OAuth 2.0 is now preferred.')
          });

          it(`should render settings section`, async () => {
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const settings = securityShadowRoot.querySelector('api-oauth1-settings-document');
            const settingsValue = settings.shadowRoot.querySelectorAll('.settings-value');
            assert.equal(settings.shadowRoot.querySelector('[data-type="request-token-uri"]').innerText, 'Request token URI')
            assert.equal(settingsValue[0].innerText, 'https://api.mysampleapi.com/1/oauth/request_token')
            assert.equal(settings.shadowRoot.querySelector('[data-type="authorization-uri"]').innerText, 'Authorization URI')
            assert.equal(settingsValue[1].innerText, 'https://api.mysampleapi.com/1/oauth/authorize')
            assert.equal(settings.shadowRoot.querySelector('[data-type="token-credentials-uri"]').innerText, 'Token credentials URI')
            assert.equal(settingsValue[2].innerText, 'https://api.mysampleapi.com/1/oauth/access_token')
            assert.equal(settings.shadowRoot.querySelector('[data-type="signatures"]').innerText, 'Supported signatures')
            assert.equal(settings.shadowRoot.querySelectorAll('li')[0].innerText, 'HMAC-SHA1')
            assert.equal(settings.shadowRoot.querySelectorAll('li')[1].innerText, 'PLAINTEXT')
          });
        });

        describe('OAuth 2.0', () => {
          beforeEach(async () => {
            navigationSelectSecuritySection(element);
            await aTimeout(50)
            navigationSelectSecurity(element, 2);
            await aTimeout(50)
          });

          it(`should render security title and description`, async () => {
            testSecurityTitleAndDescription(element, 'OAuth 2.0', 'Dropbox supports OAuth 2.0 for authenticating all API requests.')
          });

          it(`should render settings section`, async () => {
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            assert.equal(securityShadowRoot.querySelector('.settings-title').innerText, 'Settings')

            const settings = securityShadowRoot.querySelector('api-oauth2-settings-document');
            assert.equal(settings.shadowRoot.querySelector('[data-type="authorization-grants"]').innerText, 'Authorization grants')
            const grants = settings.shadowRoot.querySelectorAll('[data-type="authorization-grant"]');
            assert.lengthOf(grants, 3)
            assert.equal(grants[0].innerText, 'authorization_code')
            assert.equal(grants[1].innerText, 'implicit')
            assert.equal(grants[2].innerText, 'urn:ietf:params:oauth:grant-type:saml2-bearer')

            const flow = settings.shadowRoot.querySelector('api-oauth2-flow-document');
            const flows = flow.shadowRoot.querySelectorAll('.settings-value');
            assert.equal(flow.shadowRoot.querySelector('[data-type="access-token-uri"]').innerText, 'Access token URI')
            assert.equal(flows[0].innerText, 'https://api.dropbox.com/1/oauth2/token')
            assert.equal(flow.shadowRoot.querySelector('[data-type="authorization-uri"]').innerText, 'Authorization URI')
            assert.equal(flows[1].innerText, 'https://www.dropbox.com/1/oauth2/authorize')
          });

          it(`should render query parameters section`, async () => {
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const parameters = securityShadowRoot.querySelector('api-parameters-document');
            testCollapsibleSection(parameters, 'Query parameters');
          });

          it(`should render query parameters`, async () => {
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const parameters = securityShadowRoot.querySelector('api-parameters-document');
            const collapse = parameters.shadowRoot.querySelector('anypoint-collapse');
            testNoExamplesTypeDocument(collapse);
            testTypeDocumentShape(collapse, 'access_token', 'String', 'Used to send a valid OAuth 2 access token. Do not use with the "Authorization" header.', 'Required')
          });

          it(`should render headers section`, async () => {
            testHeadersCollapsibleSection(element);
          });

          it(`should render headers`, async () => {
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const headers = securityShadowRoot.querySelector('api-headers-document');
            const collapse = headers.shadowRoot.querySelector('anypoint-collapse');
            testNoExamplesTypeDocument(collapse);
            testTypeDocumentShape(collapse, 'Authorization', 'String','Used to send a valid OAuth 2 access token. Do not use with the "access_token" query string parameter.', 'Required')
          });

          it(`should render responses`, async () => {
            testSecurityResponses(element, ['401', '403'], 'Bad or expired token. This can happen if the user or Dropbox revoked or expired an access token. To fix, re-authenticate the user.')
          });
        });
      });
    });
  });
});
