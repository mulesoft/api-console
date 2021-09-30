import {nextFrame} from '@open-wc/testing';

/** Navigation * */
export const navigationTree = (element) => element.shadowRoot.querySelector('api-navigation')

export const navigationSummarySection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.summary');
}

export const navigationSelectSummarySection = (element) => {
  const summarySection = navigationSummarySection(element);
  summarySection.querySelector('.list-item.summary').click();
}

export const navigationEndpointsSection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.endpoints');
}

export const navigationToggleEndpointsSection = (element) => {
  const endpoints = navigationEndpointsSection(element);
  return endpoints.querySelector('.toggle-button').click();
}

export const navigationEndpointsList = (element) => {
  const endpointsSection = navigationEndpointsSection(element);
  return endpointsSection.querySelectorAll('.list-item.endpoint')
}

export const navigationToggleEndpoint = (element, path) => {
  const endpointsSection = navigationEndpointsSection(element);
  const endpoint = endpointsSection.querySelector(`[data-endpoint-path="${path}"]`);
  endpoint.querySelector('.endpoint-toggle-button').click();
  return endpoint;
}

export const navigationSelectEndpointMethod = async (element, path, method) => {
  const endpoint = navigationToggleEndpoint(element, path);
  await nextFrame();
  await nextFrame();

  const endpointOperations = endpoint.nextElementSibling;
  const endpointMethod = endpointOperations.querySelector(`[data-method="${method}"]`);
  endpointMethod.parentElement.click();
}

export const navigationDocumentationSection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.documentation');
}

export const navigationDocumentationList = (element) => {
  const documentationSection = navigationDocumentationSection(element);
  return documentationSection.querySelectorAll('.list-item');
}

export const navigationSelectDocumentationSection = (element) => {
  const documentationSection = navigationDocumentationSection(element);
  documentationSection.querySelector('.toggle-button').click();
}

export const navigationSelectDocumentation = (element, index) => {
  const documentationList = navigationDocumentationList(element);
  documentationList[index].click();
}

export const navigationTypesSection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.types');
}

export const navigationTypesList = (element) => {
  const typesSection = navigationTypesSection(element);
  return typesSection.querySelectorAll('.list-item');
}

export const navigationSecuritySection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.security');
}

export const navigationSelectSecuritySection = (element) => {
  const securitySection = navigationSecuritySection(element);
  securitySection.querySelector('.toggle-button').click();
}

export const navigationSecurityList = (element) => {
  const securitySection = navigationSecuritySection(element);
  return securitySection.querySelectorAll('.list-item');
}

export const navigationSelectSecurity = (element, index) => {
  const securityList = navigationSecurityList(element);
  securityList[index].click();
}

/** Documentation * */
export const documentationPanel = (element) => element.shadowRoot.querySelector('api-documentation')

export const documentationSummary = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-summary');
}

export const documentationDocument = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-documentation-document');
}

export const documentationSecurity = (element) => {
  const documentation = documentationPanel(element);
  return documentation.shadowRoot.querySelector('api-security-documentation');
}

export const documentationTryItButton = (element) => {
  const documentation = documentationPanel(element);
  const methodDocumentation = documentation.shadowRoot.querySelector('api-method-documentation');
  return methodDocumentation.shadowRoot.querySelector('.action-button');
}

/** Request panel * */

const requestPanel = (element) => element.shadowRoot.querySelector('api-request-panel')

const requestEditor = (element) => {
  const request = requestPanel(element);
  return request.shadowRoot.querySelector('api-request-editor');
}

export const requestUrlSection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('.url-editor');
}

export const requestQueryParamSection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('api-url-params-editor');
}

export const requestHeadersSection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('api-headers-editor');
}

export const requestBodySection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('api-body-editor');
}

export const requestCredentialsSection = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('api-authorization');
}

export const requestSendButton = (element) => {
  const editor = requestEditor(element);
  return editor.shadowRoot.querySelector('.send-button');
}
