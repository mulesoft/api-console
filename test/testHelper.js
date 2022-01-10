import { nextFrame, waitUntil } from '@open-wc/testing';

/** @typedef {import('@api-components/api-navigation').ApiNavigation} ApiNavigation */
/** @typedef {import('@api-components/api-request').ApiRequestPanelElement} ApiRequestPanel */
/** @typedef {import('@api-components/api-request').ApiRequestEditorElement} ApiRequestEditor */

/**
 * Get api-navigation element
 * @param {Element} element
 * @returns {ApiNavigation}
 */
export const navigationTree = (element) => element.shadowRoot.querySelector('api-navigation');

export const navigationSummarySection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.summary');
};

export const navigationSelectSummarySection = (element) => {
  const summarySection = navigationSummarySection(element);
  // @ts-ignore
  summarySection.querySelector('.list-item.summary').click();
};

export const navigationEndpointsSection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.endpoints');
};

export const navigationToggleEndpointsSection = (element) => {
  const endpoints = navigationEndpointsSection(element);
  // @ts-ignore
  return endpoints.querySelector('.toggle-button').click();
};

export const navigationEndpointsList = (element) => {
  const endpointsSection = navigationEndpointsSection(element);
  return endpointsSection.querySelectorAll('.list-item.endpoint');
};

export const navigationToggleEndpoint = (element, path) => {
  const endpointsSection = navigationEndpointsSection(element);
  const endpoint = endpointsSection.querySelector(`[data-endpoint-path="${path}"]`);
  // @ts-ignore
  endpoint.querySelector('.endpoint-toggle-button').click();
  return endpoint;
};

export const navigationSelectEndpointMethod = async (element, path, method) => {
  const endpoint = navigationToggleEndpoint(element, path);
  await nextFrame();
  await nextFrame();

  const endpointOperations = endpoint.nextElementSibling;
  const endpointMethod = endpointOperations.querySelector(`[data-method="${method}"]`);
  endpointMethod.parentElement.click();
};

export const navigationSelectEndpointOverview = async (element, path, noOverview) => {
  const endpoint = navigationToggleEndpoint(element, path);
  await nextFrame();
  await nextFrame();

  if (noOverview) {
    endpoint.querySelector('.endpoint-name-overview').click();
  } else {
    const endpointOperations = endpoint.nextElementSibling;
    const endpointMethod = endpointOperations.querySelector(`[data-endpoint-overview="${path}"]`);
    endpointMethod.click();
  }
};

export const navigationDocumentationSection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.documentation');
};

export const navigationDocumentationList = (element) => {
  const documentationSection = navigationDocumentationSection(element);
  return documentationSection.querySelectorAll('.list-item');
};

export const navigationSelectDocumentationSection = (element) => {
  const documentationSection = navigationDocumentationSection(element);
  // @ts-ignore
  documentationSection.querySelector('.toggle-button').click();
};

export const navigationSelectDocumentation = (element, index) => {
  const documentationList = navigationDocumentationList(element);
  // @ts-ignore
  documentationList[index].click();
};

export const navigationTypesSection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.types');
};

export const navigationTypesList = (element) => {
  const typesSection = navigationTypesSection(element);
  return typesSection.querySelectorAll('.list-item');
};

export const navigationSelectTypesSection = (element) => {
  const typesSection = navigationTypesSection(element);
  // @ts-ignore
  typesSection.querySelector('.toggle-button').click();
};

export const navigationSelectType = (element, index) => {
  const typesList = navigationTypesList(element);
  // @ts-ignore
  typesList[index].click();
};

export const navigationSecuritySection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.security');
};

export const navigationSelectSecuritySection = (element) => {
  const securitySection = navigationSecuritySection(element);
  // @ts-ignore
  securitySection.querySelector('.toggle-button').click();
};

export const navigationSecurityList = (element) => {
  const securitySection = navigationSecuritySection(element);
  return securitySection.querySelectorAll('.list-item');
};

export const navigationSelectSecurity = (element, index) => {
  const securityList = navigationSecurityList(element);
  // @ts-ignore
  securityList[index].click();
};

/** Documentation * */
export const documentationPanel = (element) => element.shadowRoot.querySelector('api-documentation');

export const documentationSummary = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-summary');
};

export const documentationDocument = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-documentation-document');
};

export const documentationSecurity = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-security-documentation');
};

export const documentationType = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-type-documentation');
};

export const documentationEndpoint = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-endpoint-documentation');
};

export const documentationMethod = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-method-documentation');
};

export const documentationTryItButton = async (element) => {
  await waitUntil(() => Boolean(documentationPanel(element)));
  const documentation = documentationPanel(element);
  await waitUntil(() => Boolean(documentation.shadowRoot.querySelector('api-method-documentation')));
  const methodDocumentation = documentation.shadowRoot.querySelector('api-method-documentation');
  return methodDocumentation.shadowRoot.querySelector('.action-button');
};

/** Request panel * */

/**
 * Get api-request-panel element
 * @param {Element} element
 * @returns {ApiRequestPanel}
 */
export const requestPanel = (element) => element.shadowRoot.querySelector('api-request-panel');

/**
 * Get api-request-editor element
 * @param {Element} element
 * @returns {ApiRequestEditor}
 */
export const requestEditor = (element) => {
  const request = requestPanel(element);
  return request.shadowRoot.querySelector('api-request-editor');
};

export const requestUrlSection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('.url-editor');
};

export const requestQueryParamSection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('api-url-params-editor');
};

export const requestHeadersSection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('api-headers-editor');
};

export const requestBodySection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('api-body-editor');
};

export const requestCredentialsSection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('api-authorization');
};

export const requestSendButton = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('.send-button');
};
