import { fixture, assert, html, aTimeout, waitUntil, nextFrame } from '@open-wc/testing';
import { AmfLoader, ApiDescribe } from './amf-loader.js';
import '../api-console.js';
import {
  documentationDocument,
  documentationEndpoint,
  documentationMethod,
  documentationPanel,
  documentationSecurity,
  documentationSummary,
  documentationType,
  navigationSelectDocumentation,
  navigationSelectDocumentationSection,
  navigationSelectEndpointMethod,
  navigationSelectEndpointOverview,
  navigationSelectSecurity,
  navigationSelectSecuritySection,
  navigationSelectSummarySection,
  navigationSelectType,
  navigationSelectTypesSection
} from './testHelper.js';

/** @typedef {import('..').ApiConsole} ApiConsole */
/** @typedef {import('./testHelper.js').TypeDocumentShapeOpts} TypeDocumentShapeOpts */

describe('API Console documentation', () => {
  /**
   * @returns {Promise<ApiConsole>}
   */
    // eslint-disable-next-line require-await
  const amfFixture = async (amf) => (fixture(html`
        <api-console .amf="${amf}"></api-console>
    `));

  const googleApi = 'google-drive-api';
  const testApi = 'test-api';
  const streetlights = 'streetlights';
  const representativeService = 'representative-service';
  let element;
  let amf;

  const testNoExamplesTypeDocument = (elem) => {
    const typeDocument = elem.querySelector('api-type-document');
    const typeExamples = typeDocument.shadowRoot.querySelector('.examples');
    assert.equal(typeExamples.getAttribute('hidden'), '');
  };

  const testResourceExampleDocument = async (elem) => {
    const resourceExample = elem.shadowRoot.querySelector('api-resource-example-document');
    await waitUntil(() => resourceExample.shadowRoot.querySelector('.example-title'));
    assert.equal(resourceExample.shadowRoot.querySelector('.example-title').innerText.trim(), 'Example');

    // if (!isWebkit) {
    //   const renderer = resourceExample.shadowRoot.querySelector('.renderer');
    //   const exampleHighlight = renderer.querySelector('api-example-render').shadowRoot.querySelector('prism-highlight');
    //   assert.equal(exampleHighlight.shadowRoot.querySelector('.parsed-content').innerText.trim(), example);
    // }
  };

  /**
   * @param {Element|ShadowRoot} elem
   * @param {TypeDocumentShapeOpts[]} opts
   */
  const testTypeDocumentShape = async (elem, opts) => {
    const typeDocument = elem.querySelector('api-type-document');
    await waitUntil(() => Boolean(typeDocument.shadowRoot.querySelector('property-shape-document')));
    const shapes = typeDocument.shadowRoot.querySelectorAll('property-shape-document');
    assert.lengthOf(shapes, opts.length);

    // @ts-ignore
    for (const [index, s] of shapes.entries()) {
      const shape = opts[index];
      if (shape.name) {
        assert.equal(s.shadowRoot.querySelector('.property-title .property-name').innerText, shape.name);
      }
      if (shape.type) {
        assert.equal(s.shadowRoot.querySelector('.property-traits .data-type').innerText, shape.type);
      }
      if (shape.required) {
        assert.equal(s.shadowRoot.querySelector('.property-traits .required-type').innerText, shape.required);
      }
      if (shape.displayName) {
        assert.equal(s.shadowRoot.querySelector('.property-display-name').innerText, shape.displayName);
      }
      if (shape.description) {
        const expectedDescription = s.shadowRoot.querySelector('arc-marked').querySelector('.markdown-body').innerText.trim();
        const description = expectedDescription.replace(/\n/g, ' ');
        assert.equal(description, shape.description);
      }
      if (shape.example) {
        const range = s.shadowRoot.querySelector('property-range-document');
        // eslint-disable-next-line no-await-in-loop
        await testResourceExampleDocument(range);
      }
    }
  };

  const testTypeDocumentExample = async (elem, example, attributes, shapeIndex = 0) => {
    const typeDocument = elem.querySelector('api-type-document');
    const shape = typeDocument.shadowRoot.querySelectorAll('property-shape-document')[shapeIndex];
    const range = shape.shadowRoot.querySelector('property-range-document');

    if (attributes) {
      const propAttributes = range.shadowRoot.querySelectorAll('.property-attribute');
      propAttributes.forEach((a, index) => {
        assert.equal(a.querySelector('.attribute-label').innerText, attributes[index].label);
        assert.equal(a.querySelector('.attribute-value').innerText, attributes[index].value);
      });
    }

    await testResourceExampleDocument(range);
  };

  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true),
  ].forEach(({ label, compact }) => {
    describe(label, () => {
      before(async () => {
        amf = await AmfLoader.load({ compact, fileName: googleApi });
      });

      beforeEach(async () => {
        element = await amfFixture(amf);
      });

      describe('Summary section', () => {
        beforeEach(async () => {
          navigationSelectSummarySection(element);
          await aTimeout(50);
        });

        it('should render summary documentation panel', async () => {
          await aTimeout(100);
          assert.ok(documentationPanel(element));
          assert.ok(documentationSummary(element));
        });

        it('should render basic summary documentation', async () => {
          await waitUntil(() => Boolean(documentationSummary(element)));
          const summaryShadowRoot = documentationSummary(element).shadowRoot;
          await waitUntil(() => Boolean(summaryShadowRoot.querySelector('.api-title')));
          assert.equal(summaryShadowRoot.querySelector('.api-title').textContent.trim(), 'API title:\n    Google Drive');

          await waitUntil(() => Boolean(summaryShadowRoot.querySelector('.inline-description.version')));
          assert.equal(summaryShadowRoot.querySelector('.inline-description.version').textContent.trim(), 'Version:\n      v2');

          const url = summaryShadowRoot.querySelector('api-url').shadowRoot;
          await waitUntil(() => Boolean(url.querySelector('.url-area > .url-value')));
          assert.equal(url.querySelector('.url-area > .url-value').textContent.trim(), 'https://www.googleapis.com/drive/{version}');

          await waitUntil(() => Boolean(summaryShadowRoot.querySelector('.marked-description')));
          assert.equal(summaryShadowRoot.querySelector('.marked-description').textContent.trim(), 'Google Drive API');
        });

        it('should render endpoints list', async () => {
          await waitUntil(() => Boolean(documentationSummary(element)));
          const documentation = documentationSummary(element);
          const summaryShadowRoot = documentation.shadowRoot;
          await waitUntil(() => Boolean(summaryShadowRoot.querySelector('.toc')));
          assert.ok(summaryShadowRoot.querySelector('.toc'));

          await waitUntil(() => Boolean(summaryShadowRoot.querySelectorAll('.endpoint-item')));
          const endpoints = summaryShadowRoot.querySelectorAll('.endpoint-item');
          assert.lengthOf(endpoints, 32);

          // eslint-disable-next-line prefer-destructuring
          const files = endpoints[0];
          await aTimeout(200);
          assert.equal(files.querySelector('.endpoint-path').textContent, 'Files');
          assert.equal(files.querySelector('.endpoint-path-name').textContent, '/files');
          assert.ok(files.querySelector('.endpoint-header'));
          assert.lengthOf(files.querySelectorAll('.method-label'), 2);
        });
      });

      describe('Documentation section', () => {
        beforeEach(async () => {
          navigationSelectDocumentationSection(element);
          await aTimeout(50);
          navigationSelectDocumentation(element, 0);
          await aTimeout(50);
        });

        it('should render documentation', () => {
          const item = documentationDocument(element);
          const docShadowRoot = item.shadowRoot;
          const title = docShadowRoot.querySelector('h1').innerText;
          assert.equal(title.trim(), 'Headline');
          const content = docShadowRoot.querySelector('.markdown-html').textContent;
          assert.equal(content.trim(), 'Google Drive is a file storage and synchronization service created and managed by Google. It allows users to store documents in the cloud, share files, and edit documents with collaborators. Google Drive encompasses Google Docs, Sheets and Slides, an office suite that permits collaborative editing of documents, spreadsheets, presentations, drawings, forms, and more.');
        });
      });
    });
  });

  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true),
  ].forEach(({ label, compact }) => {
    describe(label, () => {
      before(async () => {
        amf = await AmfLoader.load({ compact, fileName: testApi });
      });

      beforeEach(async () => {
        element = await amfFixture(amf);
      });

      describe('Security section', () => {
        const testSecurityTitleAndDescription = (elem, title, description) => {
          const item = documentationSecurity(elem);
          const securityShadowRoot = item.shadowRoot;
          const h2 = securityShadowRoot.querySelector('h2').innerText;
          assert.equal(h2.trim(), title);
          const marked = securityShadowRoot.querySelector('arc-marked');
          const markdown = marked.querySelector('.markdown-body').textContent;
          assert.equal(markdown.trim(), description);
        };

        const testCollapsibleSection = (elem, title) => {
          const headersSection = elem.shadowRoot.querySelector('.section-title-area');
          assert.equal(headersSection.getAttribute('data-opened'), '');
          assert.equal(headersSection.querySelector('.heading3').innerText, title);
          assert.ok(headersSection.querySelector('.toggle-button'));

          const headersContent = elem.shadowRoot.querySelector('anypoint-collapse');
          assert.equal(headersContent.getAttribute('collapse-opened'), '');
        };

        const testHeadersCollapsibleSection = (elem) => {
          const item = documentationSecurity(elem);
          const securityShadowRoot = item.shadowRoot;
          const headers = securityShadowRoot.querySelector('api-headers-document');
          testCollapsibleSection(headers, 'Headers');
        };

        const testSecurityResponses = async (elem, expectedTabs, selectedTabContent) => {
          await waitUntil(() => Boolean(documentationSecurity(elem)));
          const item = documentationSecurity(elem);
          const securityShadowRoot = item.shadowRoot;
          const responses = securityShadowRoot.querySelector('.response-documentation');
          assert.equal(responses.querySelector('h3').innerText, 'Responses');

          const responsesDocument = responses.querySelector('api-responses-document');
          const tabs = responsesDocument.shadowRoot.querySelector('.codes-selector anypoint-tabs');
          const tabsList = tabs.querySelectorAll('anypoint-tab');
          assert.lengthOf(tabsList, expectedTabs.length);
          assert.equal(tabsList[0].getAttribute('class'), 'selected');
          tabsList.forEach((t, index) => assert.equal(t.textContent, expectedTabs[index]));

          const methodResponse = responsesDocument.shadowRoot.querySelector('.method-response arc-marked');
          assert.equal(methodResponse.querySelector('.markdown-body').textContent.trim(), selectedTabContent);
        };

        describe('x-other', () => {
          beforeEach(async () => {
            navigationSelectSecuritySection(element);
            await aTimeout(50);
            navigationSelectSecurity(element, 1);
            await aTimeout(100);
          });

          it('should render security title and description', () => {
            testSecurityTitleAndDescription(element, 'x-custom', 'A custom security scheme for authenticating requests.');
          });

          it('should render headers section', () => {
            testHeadersCollapsibleSection(element);
          });

          it('should render security headers content', async () => {
            await waitUntil(() => Boolean(documentationSecurity(element)));
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const headersDocument = securityShadowRoot.querySelector('api-headers-document');
            const collapse = headersDocument.shadowRoot.querySelector('anypoint-collapse');
            testNoExamplesTypeDocument(collapse);
            await testTypeDocumentShape(collapse, [{ name: 'SpecialToken', type: 'String', description: 'Used to send a custom token.', required: 'Required' }]);
            await testTypeDocumentExample(collapse, 'special-token');
          });

          it('should render responses', async () => {
            await testSecurityResponses(element, ['401', '403'], 'Bad token.');
          });
        });

        describe('OAuth 1.0', () => {
          beforeEach(async () => {
            navigationSelectSecuritySection(element);
            await aTimeout(50);
            navigationSelectSecurity(element, 5);
            await aTimeout(50);
          });

          it('should render security title and description', () => {
            testSecurityTitleAndDescription(element, 'OAuth 1.0', 'OAuth 1.0 continues to be supported for all API requests, but OAuth 2.0 is now preferred.');
          });

          it('should render settings section', async () => {
            await waitUntil(() => Boolean(documentationSecurity(element)));
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const settings = securityShadowRoot.querySelector('api-oauth1-settings-document');
            const settingsValue = settings.shadowRoot.querySelectorAll('.settings-value');
            assert.equal(settings.shadowRoot.querySelector('[data-type="request-token-uri"]').textContent, 'Request token URI');
            assert.equal(settingsValue[0].textContent, 'https://api.mysampleapi.com/1/oauth/request_token');
            assert.equal(settings.shadowRoot.querySelector('[data-type="authorization-uri"]').textContent, 'Authorization URI');
            assert.equal(settingsValue[1].textContent, 'https://api.mysampleapi.com/1/oauth/authorize');
            assert.equal(settings.shadowRoot.querySelector('[data-type="token-credentials-uri"]').textContent, 'Token credentials URI');
            assert.equal(settingsValue[2].textContent, 'https://api.mysampleapi.com/1/oauth/access_token');
            assert.equal(settings.shadowRoot.querySelector('[data-type="signatures"]').textContent, 'Supported signatures');
            assert.equal(settings.shadowRoot.querySelectorAll('li')[0].innerText, 'HMAC-SHA1');
            assert.equal(settings.shadowRoot.querySelectorAll('li')[1].innerText, 'PLAINTEXT');
          });
        });

        describe('OAuth 2.0', () => {
          beforeEach(async () => {
            navigationSelectSecuritySection(element);
            await aTimeout(50);
            navigationSelectSecurity(element, 2);
            await aTimeout(50);
          });

          it('should render security title and description', () => {
            testSecurityTitleAndDescription(element, 'OAuth 2.0', 'Dropbox supports OAuth 2.0 for authenticating all API requests.');
          });

          it('should render settings section', async () => {
            await waitUntil(() => Boolean(documentationSecurity(element)));
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            assert.equal(securityShadowRoot.querySelector('.settings-title').textContent, 'Settings');

            const settings = securityShadowRoot.querySelector('api-oauth2-settings-document');
            assert.equal(settings.shadowRoot.querySelector('[data-type="authorization-grants"]').textContent, 'Authorization grants');
            const grants = settings.shadowRoot.querySelectorAll('[data-type="authorization-grant"]');
            assert.lengthOf(grants, 3);
            assert.equal(grants[0].textContent, 'authorization_code');
            assert.equal(grants[1].textContent, 'implicit');
            assert.equal(grants[2].textContent, 'urn:ietf:params:oauth:grant-type:saml2-bearer');

            const flow = settings.shadowRoot.querySelector('api-oauth2-flow-document');
            const flows = flow.shadowRoot.querySelectorAll('.settings-value');
            assert.equal(flow.shadowRoot.querySelector('[data-type="access-token-uri"]').textContent, 'Access token URI');
            assert.equal(flows[0].textContent, 'https://api.dropbox.com/1/oauth2/token');
            assert.equal(flow.shadowRoot.querySelector('[data-type="authorization-uri"]').textContent, 'Authorization URI');
            assert.equal(flows[1].textContent, 'https://www.dropbox.com/1/oauth2/authorize');
          });

          it('should render query parameters section', async () => {
            let item = documentationSecurity(element);
            await waitUntil(() => {
              item = documentationSecurity(element);
              return Boolean(item);
            });
            const securityShadowRoot = item.shadowRoot;
            const parameters = securityShadowRoot.querySelector('api-parameters-document');
            testCollapsibleSection(parameters, 'Query parameters');
          });

          it('should render query parameters', async () => {
            await waitUntil(() => Boolean(documentationSecurity(element)));
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const parameters = securityShadowRoot.querySelector('api-parameters-document');
            const collapse = parameters.shadowRoot.querySelector('anypoint-collapse');
            testNoExamplesTypeDocument(collapse);
            await testTypeDocumentShape(collapse, [
{
              name: 'access_token',
              type: 'String',
              description: 'Used to send a valid OAuth 2 access token. Do not use with the "Authorization" header.',
              required: 'Required'
            }
]);
          });

          it('should render headers section', () => {
            testHeadersCollapsibleSection(element);
          });

          it('should render headers', async () => {
            await waitUntil(() => Boolean(documentationSecurity(element)));
            const item = documentationSecurity(element);
            const securityShadowRoot = item.shadowRoot;
            const headers = securityShadowRoot.querySelector('api-headers-document');
            const collapse = headers.shadowRoot.querySelector('anypoint-collapse');
            testNoExamplesTypeDocument(collapse);
            await testTypeDocumentShape(collapse, [
{
              name: 'Authorization',
              type: 'String',
              description: 'Used to send a valid OAuth 2 access token. Do not use with the "access_token" query string parameter.',
              required: 'Required'
            }
]);
          });

          it('should render responses', async () => {
            await testSecurityResponses(element, ['401', '403'], 'Bad or expired token. This can happen if the user or Dropbox\nrevoked or expired an access token. To fix, re-authenticate\nthe user.');
          });
        });
      });

      describe('Types section', () => {
        beforeEach(async () => {
          navigationSelectTypesSection(element);
          await aTimeout(50);
        });

        const testTypeDocumentation = (elem, title, description) => {
          assert.equal(elem.querySelector('.title').innerText, title);
          assert.equal(elem.querySelector('arc-marked').querySelector('.markdown-html').innerText.trim(), description);
        };

        describe('Time-only type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 0);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            let item = documentationType(element);
            await waitUntil(() => {
              item = documentationType(element);
              return Boolean(item);
            });
            const docShadowRoot = item.shadowRoot;
            const description = 'This is time-only type';
            const displayName = 'Time-only type';
            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'timeType', type: 'Time', description, displayName }]);
          });
        });

        describe('Nil type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 1);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is nil type';
            const displayName = 'Nil type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'nilType', type: 'Null', description }]);
          });
        });

        describe('Datetime type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 2);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            await waitUntil(() => Boolean(documentationType(element)));
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is datetime type';
            const displayName = 'Datetime type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'dateTimeType', type: 'DateTime', description, displayName }]);
            await testTypeDocumentExample(docShadowRoot, 'Sun, 28 Feb 2016 16:41:41 GMT');
          });
        });

        describe('Union type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 3);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is union type';
            const displayName = 'Union type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);

            const typeDocument = docShadowRoot.querySelector('api-type-document');
            const typeShadowRoot = typeDocument.shadowRoot;
            let unionSelector = typeShadowRoot.querySelector('.union-type-selector');
            await waitUntil(() => {
              unionSelector = typeShadowRoot.querySelector('.union-type-selector');
              return Boolean(unionSelector);
            });
            assert.equal(unionSelector.querySelector('span').innerText, 'Any of:');

            const unionButtons = unionSelector.querySelectorAll('anypoint-button');
            assert.lengthOf(unionButtons, 2);
            assert.equal(unionButtons[0].innerText, 'OBJECT TYPE');
            assert.equal(unionButtons[1].innerText, 'STRING TYPE');

            await testTypeDocumentShape(typeShadowRoot, [{ name: 'prop1', type: 'String', required: 'Required' }, { name: 'prop2', type: 'String' }]);
            await testTypeDocumentExample(typeShadowRoot, 'prop1');
          });
        });

        describe('File type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 4);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is file type';
            const displayName = 'File type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'fileType', type: 'File', description }]);
          });
        });

        describe('Number type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 5);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            await waitUntil(() => Boolean(documentationType(element)));
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is number type';
            const displayName = 'Number type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'numberType', type: 'Integer', description, displayName }]);
            await testTypeDocumentExample(docShadowRoot, '2', [{ label: 'Min value:', value: '1' }, { label: 'Max value:', value: '10' }]);
          });
        });

        describe('String type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 6);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is string type';
            const displayName = 'String type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'stringType', type: 'String', description, displayName }]);
            await testTypeDocumentExample(docShadowRoot, 'a@example', [{ label: 'Pattern:', value: '^.+@.+.+$' }, { label: 'Minimum characters:', value: '1' }, { label: 'Maximum characters:', value: '10' }]);
          });
        });

        describe('Datetime-only type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 7);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is datetime-only type';
            const displayName = 'Datetime-only type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'dateTimeOnlyType', type: 'DateTime', description, displayName }]);
            await testTypeDocumentExample(docShadowRoot, '2015-07-04T21:00:00');
          });
        });

        describe('Object type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 8);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is object type';
            const displayName = 'Object type';
            const prop1 = 'prop1';
            const prop2 = 'prop2';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: prop1, type: 'String', required: 'Required', example: prop1 }, { name: prop2, type: 'String', example: prop2 }]);
          });
        });

        describe('Boolean type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 9);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            let item = documentationType(element);
            await waitUntil(() => {
              item = documentationType(element);
              return Boolean(item);
            });
            const docShadowRoot = item.shadowRoot;
            const description = 'This is boolean type';
            const displayName = 'Boolean type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'booleanType', type: 'Boolean', description, displayName }]);
            await testTypeDocumentExample(docShadowRoot, 'false');
          });
        });

        describe('Array type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 10);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const typeDocument = docShadowRoot.querySelector('api-type-document');
            const description = 'This is array type';
            const displayName = 'Array type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            await testResourceExampleDocument(typeDocument);
          });
        });

        describe('Date-only type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 11);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            await waitUntil(() => Boolean(documentationType(element)));
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is date-only type';
            const displayName = 'Date-only type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            testNoExamplesTypeDocument(docShadowRoot);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'dateType', type: 'Date', description, displayName }]);
            await testTypeDocumentExample(docShadowRoot, '2015-05-23');
          });
        });

        describe('Any type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 12);
            await aTimeout(100);
          });

          it('should render type documentation', async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const typeDocument = docShadowRoot.querySelector('api-type-document');
            const description = 'This is any type';
            const displayName = 'Any type';

            testTypeDocumentation(docShadowRoot, displayName, description);
            await testResourceExampleDocument(typeDocument);
            await testTypeDocumentShape(docShadowRoot, [{ name: 'anyType', type: 'Any', description }]);
          });
        });
      });

      describe('Endpoint section', () => {
        let docShadowRoot;

        [true, false].forEach((noOverview) => {
          describe(`No overview ${noOverview ? 'enabled' : 'disabled'}`, () => {
            beforeEach(async () => {
              element.noOverview = noOverview;
              await nextFrame();
              await navigationSelectEndpointOverview(element, '/test-query-parameters', noOverview);
              await waitUntil(() => Boolean(documentationEndpoint(element)));
              const item = documentationEndpoint(element);
              docShadowRoot = item.shadowRoot;
            });

            it('should render endpoint title', async () => {
              await waitUntil(() => Boolean(docShadowRoot.querySelector('.title')));
              assert.equal(docShadowRoot.querySelector('.title').innerText, 'Query Parameters');
            });

            it('should render URL', async () => {
              await waitUntil(() => Boolean(docShadowRoot.querySelector('api-url')));
              assert.equal(docShadowRoot.querySelector('api-url').shadowRoot.querySelector('.url-area').innerText.trim(), 'https://example/test-query-parameters');
            });

            it('should render description', async () => {
              await waitUntil(() => Boolean(docShadowRoot.querySelector('arc-marked')));
              assert.equal(docShadowRoot.querySelector('arc-marked').querySelector('.markdown-body').innerText.trim(), 'Query parameters endpoint');
            });

            it('should render methods', async () => {
              await waitUntil(() => Boolean(docShadowRoot.querySelector('.methods')));
              const methodsSection = docShadowRoot.querySelector('.methods');
              assert.exists(methodsSection);

              const methods = methodsSection.querySelectorAll('.method');
              assert.lengthOf(methods, 3);
              assert.equal(methods[0].querySelector('.method-label').innerText, 'POST');
              assert.equal(methods[0].querySelector('arc-marked').querySelector('.markdown-body').innerText.trim(), 'Post method description');
              assert.equal(methods[1].querySelector('.method-label').innerText, 'PUT');
              assert.equal(methods[2].querySelector('.method-label').innerText, 'GET');
            });
          });
        });
      });

      describe('Method section', () => {
        let docShadowRoot;

        beforeEach(async () => {
          await navigationSelectEndpointMethod(element, '/test-query-parameters', 'post');
          await waitUntil(() => Boolean(documentationMethod(element)));
          const item = documentationMethod(element);
          docShadowRoot = item.shadowRoot;
        });

        it('should render endpoint title', async () => {
          await waitUntil(() => docShadowRoot.querySelector('.title').innerText === 'Post');
          assert.equal(docShadowRoot.querySelector('.title').innerText, 'Post');
        });

        it('should render URL', () => {
          const urlArea = docShadowRoot.querySelector('api-url').shadowRoot.querySelector('.url-area');
          assert.equal(urlArea.querySelector('.method-label').innerText, 'POST');
          assert.equal(urlArea.querySelector('.url-value').innerText, 'https://example/test-query-parameters');
        });

        it('should render code examples section', async () => {
          const codeExamples = docShadowRoot.querySelector('.snippets');
          assert.exists(codeExamples);
          assert.equal(codeExamples.querySelector('.heading3.table-title').innerText, 'Code examples');

          const toggleButton = codeExamples.querySelector('.toggle-button');
          assert.exists(toggleButton);
          toggleButton.click();
          await aTimeout(50);

          const codes = codeExamples.querySelector('anypoint-collapse').querySelector('http-code-snippets').shadowRoot;
          assert.exists(codes.querySelector('curl-http-snippet'));

          waitUntil(() => codes.querySelector('anypoint-tab'));
          const tabs = codes.querySelectorAll('anypoint-tab');
          assert.lengthOf(tabs, 6);
          // assert.equal(tabs[0].innerText, 'CURL')
          // assert.equal(tabs[1].innerText, 'HTTP')
          // assert.equal(tabs[2].innerText, 'JAVASCRIPT')
          // assert.equal(tabs[3].innerText, 'PYTHON')
          // assert.equal(tabs[4].innerText, 'C')
          // assert.equal(tabs[5].innerText, 'JAVA')
        });

        it('should render query parameters section', async () => {
          await waitUntil(() => Boolean(docShadowRoot.querySelector('api-parameters-document')));
          const parametersSection = docShadowRoot.querySelector('api-parameters-document').shadowRoot;
          assert.exists(parametersSection);
          assert.equal(parametersSection.querySelector('.heading3').innerText, 'Query parameters');

          const collapse = parametersSection.querySelector('anypoint-collapse');
          await testTypeDocumentShape(collapse, [{ name: 'page', type: 'Integer', description: 'Specify the page that you want to retrieve', required: 'Required' }, { name: 'per_page', type: 'Integer', description: 'Specify the amount of items that will be retrieved per page', required: 'Required' }]);
          await testTypeDocumentExample(collapse, '1', [{ label: 'Min value:', value: '1' }, { label: 'Max value:', value: '10' }]);
          await testTypeDocumentExample(collapse, '50', [{ label: 'Default value:', value: '30' }, { label: 'Min value:', value: '10' }, { label: 'Max value:', value: '200' }]);
        });

        it('should render body section', async () => {
          await waitUntil(() => Boolean(docShadowRoot.querySelector('api-body-document')));
          const parametersSection = docShadowRoot.querySelector('api-body-document').shadowRoot;
          assert.exists(parametersSection);
          assert.equal(parametersSection.querySelector('.heading3').innerText, 'Body');

          const toggleButton = parametersSection.querySelector('.toggle-button');
          assert.exists(toggleButton);
          toggleButton.click();
          await nextFrame();

          const collapse = parametersSection.querySelector('anypoint-collapse');
          await waitUntil(() => collapse.querySelector('.media-type-selector').innerText === 'Media type: application/json');
          assert.equal(collapse.querySelector('.media-type-selector').innerText, 'Media type: application/json');
          assert.equal(collapse.querySelector('.any-info').innerText, 'Any instance of data is allowed.');
          assert.equal(collapse.querySelector('.any-info-description').innerText, 'The API file specifies body for this request but it does not specify the data model.');
        });
      });
    });
  });

  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true),
    new ApiDescribe('Flattened model', false, true),
  ].forEach(({ label, compact, flattened }) => {
    describe(label, () => {
      let docShadowRoot;

      before(async () => {
        amf = await AmfLoader.load({ compact, fileName: streetlights, flattened });
      });

      describe('Async APIs', () => {
        describe('Subscribe', () => {
          beforeEach(async () => {
            element = await amfFixture(amf);
            await navigationSelectEndpointMethod(element, 'smartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured', 'subscribe');
            await aTimeout(100);
            const item = documentationMethod(element);
            docShadowRoot = item.shadowRoot;
          });

          it('should render URL', async () => {
            await waitUntil(() => Boolean(docShadowRoot.querySelector('api-url')));
            const apiUrl = docShadowRoot.querySelector('api-url').shadowRoot;
            assert.equal(apiUrl.querySelector('.url-channel-value').innerText.trim(), 'Channel\nsmartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured');
            assert.equal(apiUrl.querySelector('.url-server-value').innerText.trim(), 'Server\nmqtt://api.streetlights.smartylighting.com:{port}');
          });

          it('should render description', async () => {
            await waitUntil(() => Boolean(docShadowRoot.querySelector('arc-marked')));
            assert.equal(docShadowRoot.querySelector('arc-marked').querySelector('.markdown-body').innerText.trim(), 'The topic on which measured values may be produced and consumed.');
          });

          it('should render methods', async () => {
            await waitUntil(() => Boolean(docShadowRoot.querySelector('.request-documentation')));
            const requestDocumentation = docShadowRoot.querySelector('.request-documentation');
            assert.exists(requestDocumentation);
            await waitUntil(() => Boolean(requestDocumentation.querySelector('.security')));
            assert.exists(requestDocumentation.querySelector('.security'));
            assert.exists(requestDocumentation.querySelector('api-parameters-document'));
            assert.exists(requestDocumentation.querySelector('api-headers-document'));
            assert.exists(requestDocumentation.querySelector('api-body-document'));
          });
        });

        describe('Publish', () => {
          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, 'smartylighting/streetlights/1/0/action/{streetlightId}/turn/on', 'publish');
            await aTimeout(100);
            const item = documentationMethod(element);
            docShadowRoot = item.shadowRoot;
          });

          it('should render URL', async () => {
            await waitUntil(() => Boolean(docShadowRoot.querySelector('api-url')));
            const apiUrl = docShadowRoot.querySelector('api-url').shadowRoot;
            assert.equal(apiUrl.querySelector('.url-channel-value').innerText.trim(), 'Channelsmartylighting/streetlights/1/0/action/{streetlightId}/turn/on');
            assert.equal(apiUrl.querySelector('.url-server-value').innerText.trim(), 'Servermqtt://api.streetlights.smartylighting.com:{port}');
          });

          it('should render methods', async () => {
            await waitUntil(() => Boolean(docShadowRoot.querySelector('.request-documentation')));
            const requestDocumentation = docShadowRoot.querySelector('.request-documentation');
            assert.exists(requestDocumentation);
            assert.exists(requestDocumentation.querySelector('.security'));
            assert.exists(requestDocumentation.querySelector('api-parameters-document'));
            assert.exists(requestDocumentation.querySelector('api-headers-document'));
            assert.exists(requestDocumentation.querySelector('api-body-document'));
          });
        });
      });
    });
  });

  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true)
  ].forEach(({ label, compact }) => {
    describe(label, () => {
      let docShadowRoot;

      before(async () => {
        amf = await AmfLoader.load({ compact, fileName: representativeService });
      });

      describe('OAS 3.0', () => {
        beforeEach(async () => {
          element = await amfFixture(amf);
          await navigationSelectEndpointMethod(element, '/streams', 'post');
          await aTimeout(100);
          const item = documentationMethod(element);
          docShadowRoot = item.shadowRoot;
        });

        it('should render URL', async () => {
          await waitUntil(() => Boolean(docShadowRoot.querySelector('api-url')));
          assert.equal(docShadowRoot.querySelector('api-url').shadowRoot.querySelector('.url-area > .url-value').innerText.trim(), 'https://localhost:8080/streams');
        });

        it('should render description', async () => {
          await waitUntil(() => Boolean(docShadowRoot.querySelector('arc-marked')));
          assert.equal(docShadowRoot.querySelector('arc-marked').querySelector('.markdown-body').innerText.trim(), 'subscribes a client to receive out-of-band data');
        });

        it('should add callbacks to documentation sections', async () => {
          await waitUntil(() => Boolean(docShadowRoot.querySelector('.request-documentation')));
          const requestDocumentation = docShadowRoot.querySelector('.request-documentation');
          assert.exists(requestDocumentation);
          assert.exists(requestDocumentation.querySelector('.snippets'));
          await waitUntil(() => Boolean(requestDocumentation.querySelector('.security')));
          assert.exists(requestDocumentation.querySelector('.security'));
          assert.exists(requestDocumentation.querySelector('api-parameters-document'));
          assert.exists(requestDocumentation.querySelector('.callbacks'));
        });

        it('should render responses', async () => {
          await waitUntil(() => Boolean(docShadowRoot.querySelector('.response-documentation')));
          assert.exists(docShadowRoot.querySelector('.response-documentation'));
        });

        it('should render callbacks section in documentation', async () => {
          await waitUntil(() => Boolean(docShadowRoot.querySelector('.request-documentation')));
          const requestDocumentation = docShadowRoot.querySelector('.request-documentation');
          await waitUntil(() => Boolean(requestDocumentation.querySelector('.callbacks')));
          const callbacks = requestDocumentation.querySelector('.callbacks');
          assert.equal(callbacks.querySelector('.table-title').innerText, 'Callbacks');
        });

        it('should render callbacks info', async () => {
          await waitUntil(() => Boolean(docShadowRoot.querySelector('.request-documentation')));
          await waitUntil(() => Boolean(docShadowRoot.querySelector('.request-documentation').querySelector('.callbacks')));
          const callbacks = docShadowRoot.querySelector('.request-documentation').querySelector('.callbacks');
          const callbacksCollapse = callbacks.querySelector('anypoint-collapse');
          assert.isNull(callbacksCollapse.getAttribute('collapse-opened'));

          const toggleButton = callbacks.querySelector('.toggle-button');
          assert.exists(toggleButton);
          toggleButton.click();

          await waitUntil(() => Boolean(callbacksCollapse.querySelector('.callback-section')));
          assert.exists(callbacksCollapse.querySelector('.callback-section'));
        });
      });
    });
  });

  // AsyncAPI
  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true)
  ].forEach(({ label, compact }) => {
    describe(label, () => {
      const multipleMessagesApi = 'multiple-messages';

      before(async () => {
        amf = await AmfLoader.load({ compact, fileName: multipleMessagesApi });
      });

      describe('OAS 3.0', () => {
        beforeEach(async () => {
          element = await amfFixture(amf);
          await navigationSelectEndpointMethod(element, 'shipping-messages', 'publish');
          await nextFrame();
        });

        it('should render the messages dropdown selector', async () => {
          await waitUntil(() => !!documentationMethod(element));
          const methodDocumentation = documentationMethod(element);
          await waitUntil(() => !!methodDocumentation.shadowRoot.querySelector('.messages-options'));
          assert.exists(methodDocumentation.shadowRoot.querySelector('.messages-options'));
        });
      });
    });
  });
});
