import {fixture, assert, html, aTimeout} from '@open-wc/testing';
import {AmfLoader, ApiDescribe} from './amf-loader.js';
import '../api-console.js';
import {
  documentationDocument,
  documentationPanel, documentationSecurity,
  documentationSummary, documentationType, navigationSelectDocumentation,
  navigationSelectDocumentationSection, navigationSelectSecurity, navigationSelectSecuritySection,
  navigationSelectSummarySection, navigationSelectType, navigationSelectTypesSection
} from './testHelper.js';

/** @typedef {import('..').ApiConsole} ApiConsole */
/** @typedef {import('./testHelper.js').TypeDocumentShapeOpts} TypeDocumentShapeOpts */

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

  const testNoExamplesTypeDocument = (elem) => {
    const typeDocument = elem.querySelector('api-type-document');
    const typeExamples = typeDocument.shadowRoot.querySelector('.examples');
    assert.equal(typeExamples.getAttribute('hidden'), '')
  }

  const testResourceExampleDocument = (elem, example) => {
    const resourceExample = elem.shadowRoot.querySelector('api-resource-example-document');
    assert.equal(resourceExample.shadowRoot.querySelector('.example-title').innerText, 'Example');

    const renderer = resourceExample.shadowRoot.querySelector('.renderer');
    const exampleHighlight = renderer.querySelector('api-example-render').shadowRoot.querySelector('prism-highlight');
    assert.equal(exampleHighlight.shadowRoot.querySelector('.parsed-content').innerText.trim(), example);
  }

  /**
   * @param {Element|ShadowRoot} elem
   * @param {TypeDocumentShapeOpts[]} opts
   */
  const testTypeDocumentShape = (elem, opts) => {
    const typeDocument = elem.querySelector('api-type-document');
    const shapes = typeDocument.shadowRoot.querySelectorAll('property-shape-document');
    assert.lengthOf(shapes, opts.length);
    shapes.forEach((s, index) => {
      const shape = opts[index];
      shape.name && assert.equal(s.shadowRoot.querySelector('.property-title .property-name').innerText, shape.name);
      shape.type && assert.equal(s.shadowRoot.querySelector('.property-traits .data-type').innerText, shape.type);
      shape.description && assert.equal(s.shadowRoot.querySelector('arc-marked').querySelector('.markdown-body').innerText.trim(), shape.description);
      shape.required && assert.equal(s.shadowRoot.querySelector('.property-traits .required-type').innerText, shape.required);
      shape.displayName && assert.equal(s.shadowRoot.querySelector('.property-display-name').innerText, shape.displayName);
      if (shape.example) {
        const range = s.shadowRoot.querySelector('property-range-document');
        testResourceExampleDocument(range, shape.example)
      }
    })
  }

  const testTypeDocumentExample = (elem, example, attributes, shapeIndex = 0) => {
    const typeDocument = elem.querySelector('api-type-document');
    const shape = typeDocument.shadowRoot.querySelectorAll('property-shape-document')[shapeIndex];
    const range = shape.shadowRoot.querySelector('property-range-document');

    if (attributes) {
      const propAttributes = range.shadowRoot.querySelectorAll('.property-attribute');
      propAttributes.forEach((a, index) => {
        assert.equal(a.querySelector('.attribute-label').innerText, attributes[index].label);
        assert.equal(a.querySelector('.attribute-value').innerText, attributes[index].value);
      })
    }

    testResourceExampleDocument(range, example)
  }

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
          await aTimeout(300);
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
          await aTimeout(400);
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
            testTypeDocumentShape(collapse, [{name: 'SpecialToken', type: 'String', description: 'Used to send a custom token.', required: 'Required'}])
            testTypeDocumentExample(collapse, 'special-token')
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
            testTypeDocumentShape(collapse, [{
              name: 'access_token',
              type: 'String',
              description: 'Used to send a valid OAuth 2 access token. Do not use with the "Authorization" header.',
              required: 'Required'
            }])
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
            testTypeDocumentShape(collapse, [{
              name: 'Authorization',
              type: 'String',
              description: 'Used to send a valid OAuth 2 access token. Do not use with the "access_token" query string parameter.',
              required: 'Required'
            }])
          });

          it(`should render responses`, async () => {
            testSecurityResponses(element, ['401', '403'], 'Bad or expired token. This can happen if the user or Dropbox revoked or expired an access token. To fix, re-authenticate the user.')
          });
        });
      });

      describe('Types section', () => {
        beforeEach(async () => {
          navigationSelectTypesSection(element);
          await aTimeout(50)
        });

        const testTypeDocumentation = (elem, title, description) => {
          assert.equal(elem.querySelector('.title').innerText, title);
          assert.equal(elem.querySelector('arc-marked').querySelector('.markdown-html').innerText.trim(), description);
        }

        describe('Time-only type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 0);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is time-only type';
            const displayName = 'Time-only type';
            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'timeType', type: 'Time', description, displayName}]);
          });
        });

        describe('Nil type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 1);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is nil type';
            const displayName = 'Nil type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'nilType', type: 'Null', description}]);
          });
        });

        describe('Datetime type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 2);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is datetime type';
            const displayName = 'Datetime type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'dateTimeType', type: 'DateTime', description, displayName}]);
            testTypeDocumentExample(docShadowRoot,  'Sun, 28 Feb 2016 16:41:41 GMT')
          });
        });

        describe('Union type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 3);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is union type';
            const displayName = 'Union type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)

            const typeDocument = docShadowRoot.querySelector('api-type-document');
            const typeShadowRoot = typeDocument.shadowRoot;
            const unionSelector = typeShadowRoot.querySelector('.union-type-selector');
            assert.equal(unionSelector.querySelector('span').innerText, 'Any of:');

            const unionButtons = unionSelector.querySelectorAll('anypoint-button');
            assert.lengthOf(unionButtons, 2);
            assert.equal(unionButtons[0].innerText, 'OBJECT TYPE');
            assert.equal(unionButtons[1].innerText, 'STRING TYPE');

            testTypeDocumentShape(typeShadowRoot, [{name: 'prop1', type: 'String', required: 'Required'}, {name: 'prop2', type: 'String'}]);
            testTypeDocumentExample(typeShadowRoot, 'prop1')
          });
        });

        describe('File type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 4);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is file type';
            const displayName = 'File type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'fileType', type: 'File', description}]);
          });
        });

        describe('Number type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 5);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is number type';
            const displayName = 'Number type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'numberType', type: 'Integer', description, displayName}]);
            testTypeDocumentExample(docShadowRoot,  '2', [{label: 'Min value:', value: '1'}, {label: 'Max value:', value: '10'}])
          });
        });

        describe('String type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 6);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is string type';
            const displayName = 'String type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'stringType', type: 'String', description, displayName}]);
            testTypeDocumentExample(docShadowRoot, 'a@example', [{label: 'Pattern:', value: '^.+@.+.+$'}, {label: 'Minimum characters:', value: '1'}, {label: 'Maximum characters:', value: '10'}])
          });
        });

        describe('Datetime-only type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 7);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is datetime-only type';
            const displayName = 'Datetime-only type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'dateTimeOnlyType', type: 'Time', description, displayName}]);
            testTypeDocumentExample(docShadowRoot,  '2015-07-04T21:00:00')
          });
        });

        describe('Object type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 8);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is object type';
            const displayName = 'Object type';
            const prop1 = 'prop1';
            const prop2 = 'prop2';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: prop1, type: 'String', required: 'Required', example: prop1}, {name: prop2, type: 'String', example: prop2}]);
          });
        });

        describe('Boolean type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 9);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is boolean type';
            const displayName = 'Boolean type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'booleanType', type: 'Boolean', description, displayName}]);
            testTypeDocumentExample(docShadowRoot, 'false')
          });
        });

        describe('Array type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 10);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const typeDocument = docShadowRoot.querySelector('api-type-document');
            const description = 'This is array type';
            const displayName = 'Array type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testResourceExampleDocument(typeDocument,  "- 'item1'\n- 'item2'")
          });
        });

        describe('Date-only type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 11);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const description = 'This is date-only type';
            const displayName = 'Date-only type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testNoExamplesTypeDocument(docShadowRoot)
            testTypeDocumentShape(docShadowRoot, [{name: 'dateType', type: 'Date', description, displayName}]);
            testTypeDocumentExample(docShadowRoot,  '2015-05-23')
          });
        });

        describe('Any type', () => {
          beforeEach(async () => {
            navigationSelectType(element, 12);
            await aTimeout(100)
          });

          it(`should render type documentation`, async () => {
            const item = documentationType(element);
            const docShadowRoot = item.shadowRoot;
            const typeDocument = docShadowRoot.querySelector('api-type-document');
            const description = 'This is any type';
            const displayName = 'Any type';

            testTypeDocumentation(docShadowRoot, displayName, description)
            testResourceExampleDocument(typeDocument,  'any')
            testTypeDocumentShape(docShadowRoot, [{name: 'anyType', type: 'Any', description}]);
          });
        });
      });
    });
  });
});
