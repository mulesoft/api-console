import { visualDiff } from '@web/test-runner-visual-regression';
import { aTimeout } from '@open-wc/testing';
import { amfFixture } from '../api-console.amf.test.js';
import { AmfLoader, ApiDescribe } from '../amf-loader.js';
import { navigationTree } from '../testHelper.js';

/** @typedef {import('@api-components/api-navigation').ApiNavigation} ApiNavigation */
/** @typedef {import('@api-components/amf-helper-mixin').WebApi} WebApi */

const apis = ['demo-api'];

const hasScrolledToTheEnd = (target) => target.scrollTop === (target.scrollHeight - target.offsetHeight);
const DEFAULT_RENDER_TIMEOUT = () => aTimeout(1000);

const isScrollable = (element) => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

const diffFullScroll = async (element, name) => {
  if (!isScrollable(element)) {
    await visualDiff(element, name);
    return;
  }
  element.scrollTo(0, 0);
  let screenShotCount = 0;
  const height = element.clientHeight;
  const scrollAmount = Math.max(100, Math.floor(height / 100) * 100);
  await visualDiff(element, `${name}-0`);
  while (!hasScrolledToTheEnd(element)) {
    screenShotCount++;
    element.scrollBy(0, scrollAmount);
    // eslint-disable-next-line no-await-in-loop
    await visualDiff(element, `${name}-${screenShotCount}`);
  }
};

/**
 *
 * @param {ApiNavigation} navigation
 * @param {WebApi} amf
 */
const getAllOperationsWithEndpoint = (navigation, amf) => {
  const endpoints = navigation._endpoints;
  return endpoints.map((endpoint) => {
    const webApi = navigation._computeWebApi(amf);
    const operations = navigation._computeOperations(webApi, endpoint.id);
    return { endpoint, operations };
  });
};

describe('Visual tests', () => {
  [
    new ApiDescribe('Regular model'),
    new ApiDescribe('Compact model', true),
  ].forEach(({ label, compact }) => {
    describe(label, () => {
      apis.forEach((api) => {
        describe(api, () => {
          let element;
          let amf;
          let navigation;
          let mainContent;

          beforeEach(async () => {
            amf = await AmfLoader.load({ fileName: api, compact });
            element = await amfFixture(amf);
            navigation = navigationTree(element);
            mainContent = element.shadowRoot.querySelector('.main-content');
          });

          it('should render default view', async () => {
            await DEFAULT_RENDER_TIMEOUT();
            await diffFullScroll(element, `${label}/default`);
          });

          describe('with navigation open', () => {
            it('should render navigation', async () => {
              element.navigationOpened = true;
              await DEFAULT_RENDER_TIMEOUT();
              await diffFullScroll(navigation, `${label}/nav-opened`);
            });

            it('should render navigation with all sections expanded', async () => {
              element.navigationOpened = true;
              navigation.docsOpened = true;
              navigation.typesOpened = true;
              navigation.securityOpened = true;
              navigation.endpointsOpened = true;
              navigation.operationsOpened = true;
              await DEFAULT_RENDER_TIMEOUT();
              await diffFullScroll(navigation, `${label}/nav-opened-all-sections-opened`);
            });
          });

          describe('with navigation closed', () => {
            describe('endpoints & operations', () => {
              it('should render each endpoint', async () => {
                const endpoints = navigation._endpoints;
                for (const endpoint of endpoints) {
                  element.selectedShapeType = 'endpoint';
                  element.selectedShape = endpoint.id;
                  // eslint-disable-next-line no-await-in-loop
                  await DEFAULT_RENDER_TIMEOUT();
                  // eslint-disable-next-line no-await-in-loop
                  await visualDiff(mainContent, `${label}/endpoint-doc-view${endpoint.path}`);
                }
              });

              it('should render each operation', async () => {
                const items = getAllOperationsWithEndpoint(navigation, amf);
                for (const item of items) {
                  const { endpoint, operations } = item;
                  if (operations) {
                    for (const operation of operations) {
                      element.selectedShapeType = 'method';
                      element.selectedShape = operation['@id'];
                      // eslint-disable-next-line no-await-in-loop
                      await DEFAULT_RENDER_TIMEOUT();
                      const methodKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.method);
                      const method = element._getValue(operation, methodKey);
                      // eslint-disable-next-line no-await-in-loop
                      await visualDiff(mainContent, `${label}/operation-doc-view${endpoint.path}-${method}`);
                    }
                  }
                }
              });
            });
          });
        });
      });
    });
  });
});
