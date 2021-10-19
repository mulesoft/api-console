import {fixture, assert, html, nextFrame, aTimeout} from '@open-wc/testing';
import * as sinon from 'sinon';
import {AmfLoader, ApiDescribe} from './amf-loader.js';
import '../api-console.js';
import {
  documentationTryItButton,
  navigationSelectEndpointMethod,
  requestBodySection, requestCredentialsSection,
  requestHeadersSection, requestPanel,
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

      describe('Authorization', () => {
        const assertDropdownMenu = (form, name, menuLabel, value) => {
          const menu = form.querySelector(`anypoint-dropdown-menu[name="${name}"]`);
          assert.exists(menu);
          assert.exists(menu.shadowRoot.querySelector('.label').innerText, menuLabel);
          assert.exists(menu.shadowRoot.querySelector('.input-wrapper').innerText, value);
        }

        const assertMaskedInput = (form, name, inputLabel) => {
          const input = form.querySelector(`anypoint-masked-input[name="${name}"]`);
          assert.exists(input);
          assert.exists(input.querySelector('label').innerText, inputLabel);
        }

        const assertInput = (form, name, inputLabel) => {
          const input = form.querySelector(`anypoint-input[name="${name}"]`);
          assert.exists(input);
          assert.exists(input.querySelector('label').innerText, inputLabel);
        }

        describe('x-other', () => {
          let credentialsSection

          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-custom-scheme', 'get');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
            credentialsSection = requestCredentialsSection(element);
          });

          it(`should render credentials section`, async () => {
            assert.exists(credentialsSection);
          });

          it(`should render auth label`, async () => {
            assert.equal(credentialsSection.shadowRoot.querySelector('.auth-selector-label').innerText, 'x-custom');
          });

          it(`should render authorization method`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            assert.equal(authorizationMethod.getAttribute('type'), 'custom');

            const authorizationMethodTitle = authorizationMethod.shadowRoot.querySelector('.subtitle');
            assert.equal(authorizationMethodTitle.querySelector('span').innerText, 'Scheme: customScheme');
            assert.exists(authorizationMethodTitle.querySelector('.hint-icon'));
          });

          it(`should render scheme fields`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            const authorizationMethodForm = authorizationMethod.shadowRoot.querySelector('form');
            await aTimeout(100);
            assert.equal(authorizationMethodForm.querySelector('.section-title').innerText, 'Headers');

            const fields = authorizationMethodForm.querySelectorAll('.field-value');
            await aTimeout(100);
            assert.lengthOf(fields, 1);
            const formItem = fields[0].querySelector('api-form-item');
            const input = formItem.shadowRoot.querySelector('anypoint-input');
            await aTimeout(100);
            assert.equal(input.querySelector('label').innerText, 'SpecialToken*');
            await aTimeout(100);
            assert.exists(fields[0].querySelector('.hint-icon'));
          });

          describe('Request with credentials', () => {
            beforeEach(async () => {
              spy = sinon.spy();
              document.body.addEventListener('api-request', spy);
            });

            it(`should add all credential headers to request`, async () => {
              requestSendButton(element).click();
              await nextFrame();

              assert.isTrue(spy.called);
              assert.equal(spy.getCall(0).args[0].detail.headers, 'SpecialToken: special-token');
            });
          });
        })

        describe('Oauth 1.0', () => {
          let credentialsSection

          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-oauth10-scheme', 'get');
            await aTimeout(70)
            documentationTryItButton(element).click()
            await aTimeout(70)
            credentialsSection = requestCredentialsSection(element);
          });

          it(`should render credentials section`, async () => {
            assert.exists(credentialsSection);
          });

          it(`should render auth label`, async () => {
            assert.equal(credentialsSection.shadowRoot.querySelector('.auth-selector-label').innerText, 'OAuth 1.0');
          });

          it(`should render authorization method`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            assert.equal(authorizationMethod.getAttribute('type'), 'oauth 1');
          });

          it(`should render scheme fields`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            const authorizationMethodForm = authorizationMethod.shadowRoot.querySelector('form');

            assertDropdownMenu(authorizationMethodForm, 'authTokenMethod', 'Authorization token method', 'POST')
            assertDropdownMenu(authorizationMethodForm, 'authParamsLocation', 'Oauth parameters location', 'Authorization header')
            assertDropdownMenu(authorizationMethodForm, 'signatureMethod', 'Signature method', 'HMAC-SHA1')

            assertMaskedInput(authorizationMethodForm, 'consumerKey', 'Consumer key')
            assertMaskedInput(authorizationMethodForm, 'consumerSecret', 'Consumer secret')
            assertMaskedInput(authorizationMethodForm, 'token', 'Token')
            assertMaskedInput(authorizationMethodForm, 'tokenSecret', 'Token secret')
            assertMaskedInput(authorizationMethodForm, 'realm', 'Realm')

            assertInput(authorizationMethodForm, 'requestTokenUri', 'Request token URI')
            assertInput(authorizationMethodForm, 'accessTokenUri', 'Token Authorization URI')
            assertInput(authorizationMethodForm, 'authorizationUri', 'User authorization dialog URI')
            assertInput(authorizationMethodForm, 'redirectUri', 'Redirect URI')
            assertInput(authorizationMethodForm, 'timestamp', 'Timestamp')
            assertInput(authorizationMethodForm, 'nonce', 'Nonce')

            assert.exists(authorizationMethod.shadowRoot.querySelector('.auth-button'));
          });
        })

        describe('Oauth 2.0', () => {
          let credentialsSection

          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-oauth20-scheme', 'get');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
            credentialsSection = requestCredentialsSection(element);
          });

          it(`should render credentials section`, async () => {
            assert.exists(credentialsSection);
          });

          it(`should render auth label`, async () => {
            await aTimeout(100);
            assert.equal(credentialsSection.shadowRoot.querySelector('.auth-selector-label').innerText, 'OAuth 2.0');
          });

          it(`should render authorization method`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            assert.equal(authorizationMethod.getAttribute('type'), 'oauth 2');
          });

          it(`should render scheme fields`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            const authorizationMethodForm = authorizationMethod.shadowRoot.querySelector('form');

            assertDropdownMenu(authorizationMethodForm, 'grantType', 'Response type', 'Access token')
            assertMaskedInput(authorizationMethodForm, 'clientId', 'Client id')
            assertInput(authorizationMethodForm, 'authorizationUri', 'Authorization URI')

            const scopes = authorizationMethod.shadowRoot.querySelector('oauth2-scope-selector');
            assert.exists(scopes);
            assert.equal(scopes.shadowRoot.querySelector('.form-label').innerText, 'Scopes');
            assert.exists(scopes.shadowRoot.querySelector('.scope-input'));

            assert.exists(authorizationMethod.shadowRoot.querySelector('.redirect-section span').innerText, 'https://auth.advancedrestclient.com/oauth-popup.html');
            assert.exists(authorizationMethod.shadowRoot.querySelector('.auth-button'));
          });
        })

        describe('Basic', () => {
          let credentialsSection

          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-basic-scheme', 'get');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
            credentialsSection = requestCredentialsSection(element);
          });

          it(`should render credentials section`, async () => {
            assert.exists(credentialsSection);
          });

          it(`should render auth label`, async () => {
            await aTimeout(100);
            assert.equal(credentialsSection.shadowRoot.querySelector('.auth-selector-label').innerText, 'Basic Authentication');
          });

          it(`should render authorization method`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            assert.equal(authorizationMethod.getAttribute('type'), 'basic');
          });

          it(`should render scheme fields`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            const authorizationMethodForm = authorizationMethod.shadowRoot.querySelector('form');

            assertInput(authorizationMethodForm, 'username', 'User name')
            assertMaskedInput(authorizationMethodForm, 'password', 'Password')
          });

          it(`should render all sections`, async () => {
            assert.exists(requestUrlSection(element));
            assert.exists(requestSendButton(element));
          });

          describe('Basic auth request', () => {
            beforeEach(async () => {
              spy = sinon.spy();
              document.body.addEventListener('api-request', spy);
            });

            it(`should add auth to request`, async () => {
              requestSendButton(element).click();
              await nextFrame();

              assert.isTrue(spy.called);

              const authElement = spy.getCall(0).args[0].detail.auth[0];
              assert.equal(authElement.type, 'basic');
              assert.equal(authElement.config.password, '');
              assert.equal(authElement.config.username, '');
            });
          });
        })

        describe('Digest', () => {
          let credentialsSection

          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-digest-scheme', 'get');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
            credentialsSection = requestCredentialsSection(element);
          });

          it(`should render credentials section`, async () => {
            assert.exists(credentialsSection);
          });

          it(`should render auth label`, async () => {
            await aTimeout(100);
            assert.equal(credentialsSection.shadowRoot.querySelector('.auth-selector-label').innerText, 'Digest Authentication');
          });

          it(`should render authorization method`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            assert.equal(authorizationMethod.getAttribute('type'), 'digest');
          });

          it(`should render scheme fields`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            const authorizationMethodForm = authorizationMethod.shadowRoot.querySelector('form');

            assertInput(authorizationMethodForm, 'username', 'User name')
            assertInput(authorizationMethodForm, 'realm', 'Server issued realm')
            assertInput(authorizationMethodForm, 'nonce', 'Server issued nonce')
            assertInput(authorizationMethodForm, 'nc', 'Nonce count')
            assertInput(authorizationMethodForm, 'opaque', 'Server issued opaque string')
            assertInput(authorizationMethodForm, 'cnonce', 'Client nonce')

            assertMaskedInput(authorizationMethodForm, 'password', 'Password')

            assertDropdownMenu(authorizationMethodForm, 'qop', 'Quality of protection', 'Access token')
            assertDropdownMenu(authorizationMethodForm, 'algorithm', 'Hash algorithm', 'MD5')
          });

          it(`should render all sections`, async () => {
            assert.exists(requestUrlSection(element));
            assert.exists(requestSendButton(element));
          });

          describe('Digest auth request', () => {
            beforeEach(async () => {
              spy = sinon.spy();
              document.body.addEventListener('api-request', spy);
            });

            it(`should add auth to request`, async () => {
              requestSendButton(element).click();
              await nextFrame();

              assert.isTrue(spy.called);

              const authElement = spy.getCall(0).args[0].detail.auth[0];
              assert.equal(authElement.type, 'digest');
              assert.equal(authElement.config.username, '');
              assert.equal(authElement.config.password, '');
              assert.equal(authElement.config.response, 'b51d5ed92022b12518f81219d05e0ea1');
              assert.equal(authElement.config.nc, '00000001');
              assert.isDefined(authElement.config.cnonce);
              assert.equal(authElement.config.algorithm, 'MD5');
              assert.isUndefined(authElement.config.realm);
              assert.isUndefined(authElement.config.nonce);
              assert.isUndefined(authElement.config.uri);
              assert.isUndefined(authElement.config.opaque);
              assert.isUndefined(authElement.config.qop);
            });
          });
        })

        describe('Pass through', () => {
          let credentialsSection

          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-pass-through-scheme', 'get');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
            credentialsSection = requestCredentialsSection(element);
          });

          it(`should render credentials section`, async () => {
            assert.exists(credentialsSection);
          });

          it(`should render auth label`, async () => {
            await aTimeout(100);
            assert.equal(credentialsSection.shadowRoot.querySelector('.auth-selector-label').innerText, 'Pass Through');
          });

          it(`should render authorization method`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            assert.equal(authorizationMethod.getAttribute('type'), 'pass through');
          });

          it(`should render scheme fields`, async () => {
            const authorizationMethod = credentialsSection.shadowRoot.querySelector('api-authorization-method');
            assert.equal(authorizationMethod.shadowRoot.querySelector('.subtitle').innerText.trim(), 'Scheme: passthrough');
            assert.exists(authorizationMethod.shadowRoot.querySelector('.hint-icon'));

            const authorizationMethodForm = authorizationMethod.shadowRoot.querySelector('form');
            const titles = authorizationMethodForm.querySelectorAll('.section-title');
            assert.lengthOf(titles, 2)
            assert.equal(titles[0].innerText, 'Headers')
            assert.equal(titles[1].innerText, 'Query parameters')

            const items = authorizationMethodForm.querySelectorAll('api-form-item');
            assert.lengthOf(items, 2)
            assert.equal(items[0].getAttribute('name'), 'api_key')
            assert.equal(items[0].getAttribute('data-type'), 'header')
            assert.equal(items[1].getAttribute('name'), 'query')
            assert.equal(items[1].getAttribute('data-type'), 'query')
          });

          it(`should render all sections`, async () => {
            assert.exists(requestUrlSection(element));
            assert.exists(requestSendButton(element));
          });

          describe('Pass through auth request', () => {
            beforeEach(async () => {
              spy = sinon.spy();
              document.body.addEventListener('api-request', spy);
            });

            it(`should add auth to request`, async () => {
              requestSendButton(element).click();
              await nextFrame();

              assert.isTrue(spy.called);
              const authElement = spy.getCall(0).args[0].detail.auth[0];
              assert.equal(authElement.type, 'pass through');
              assert.equal(authElement.config.headers.api_key, '');
              assert.isUndefined(authElement.config.query);
            });
          });
        })
      });

      describe('Query parameters', () => {
        describe('Required parameters', () => {
          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-query-parameters', 'post');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
            requestPanel(element).allowHideOptional = true
            await aTimeout(50)
          });

          it(`should render all sections`, async () => {
            assert.exists(requestUrlSection(element));
            assert.exists(requestQueryParamSection(element));
            assert.exists(requestBodySection(element));
          });

          it(`should render query parameters title`, async () => {
            const queryParams = requestQueryParamSection(element);
            assert.equal(queryParams.shadowRoot.querySelector('.form-title').innerText, 'Query parameters');
          });

          it(`should render optional parameters toggle`, async () => {
            const queryParams = requestQueryParamSection(element);
            await aTimeout(50)
            const showOptionalToggle = queryParams.shadowRoot.querySelector('anypoint-switch');
            assert.equal(showOptionalToggle.getAttribute('disabled'), '');
            assert.equal(showOptionalToggle.getAttribute('title'), 'Show optional parameters');
          });

          it(`should render all parameters`, async () => {
            const section = requestQueryParamSection(element);
            const queryParams = section.shadowRoot.querySelectorAll('.form-row.form-item');
            assert.lengthOf(queryParams, 2);

            const pageQueryParam = queryParams[0];
            const pageItem = pageQueryParam.querySelector('api-form-item')
            assert.equal(pageItem.getAttribute('data-type'), 'queryModel');
            assert.equal(pageItem.getAttribute('name'), 'page');
            assert.equal(pageItem.getAttribute('required'), '');
            assert.isNull(pageQueryParam.getAttribute('hidden'));

            const perPageQueryParam = queryParams[1];
            const perPageItem = perPageQueryParam.querySelector('api-form-item')
            assert.equal(perPageItem.getAttribute('data-type'), 'queryModel');
            assert.equal(perPageItem.getAttribute('name'), 'per_page');
            assert.equal(perPageItem.getAttribute('required'), '');
            assert.isNull(perPageQueryParam.getAttribute('hidden'));
          });

          describe('Request with parameters', () => {
            beforeEach(async () => {
              spy = sinon.spy();
              document.body.addEventListener('api-request', spy);
            });

            it(`should add all parameters to request`, async () => {
              requestSendButton(element).click();
              await nextFrame();

              assert.isTrue(spy.called);
              assert.equal(spy.getCall(0).args[0].detail.url, 'https://example/test-query-parameters?page=1&per_page=30');
            });
          });
        })

        describe('Optional parameters', () => {
          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-query-parameters', 'put');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
            requestPanel(element).allowHideOptional = true
            await aTimeout(50)
          });

          it(`should render optional parameters toggle`, async () => {
            const queryParams = requestQueryParamSection(element);
            const showOptionalToggle = queryParams.shadowRoot.querySelector('.param-switch');
            assert.isNull(showOptionalToggle.getAttribute('disabled'));
            assert.equal(showOptionalToggle.getAttribute('title'), 'Show optional parameters');
          });

          it(`should hide optional parameters`, async () => {
            const section = requestQueryParamSection(element);
            const queryParams = section.shadowRoot.querySelectorAll('.form-row.form-item');
            assert.lengthOf(queryParams, 2);

            const param1 = queryParams[0];
            assert.isNull(param1.getAttribute('hidden'));

            const param2 = queryParams[1];
            assert.isNull(param2.getAttribute('hidden'));

            const showOptionalToggle = section.shadowRoot.querySelector('.param-switch');
            await aTimeout(50);
            showOptionalToggle.shadowRoot.querySelector('.button').click();
            await aTimeout(50);

            const param1Item = param1.querySelector('api-form-item')
            assert.equal(param1Item.getAttribute('data-type'), 'queryModel');
            assert.equal(param1Item.getAttribute('name'), 'param1');
            assert.isNull(param1Item.getAttribute('required'));
            assert.equal(param1.getAttribute('hidden'), '');

            const param2Item = param2.querySelector('api-form-item')
            assert.equal(param2Item.getAttribute('data-type'), 'queryModel');
            assert.equal(param2Item.getAttribute('name'), 'param2');
            assert.equal(param2Item.getAttribute('required'), '');
            assert.isNull(param2.getAttribute('hidden'));
          });
        })

        describe('allowHideOptional disabled', () => {
          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-query-parameters', 'put');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
          });

          it(`should render optional parameters toggle`, async () => {
            const queryParams = requestQueryParamSection(element);
            assert.notExists(queryParams.shadowRoot.querySelector('.param-switch'));
          });
        })

        describe('No parameters', () => {
          beforeEach(async () => {
            await navigationSelectEndpointMethod(element, '/test-custom-scheme', 'get');
            await aTimeout(50)
            documentationTryItButton(element).click()
            await aTimeout(50)
          });

          it(`should not render query parameters section`, async () => {
            assert.notExists(requestQueryParamSection(element));
          });
        })
      });
    });
  });
});
