export const navigationTree = (element) => element.shadowRoot.querySelector('api-navigation')

export const navigationSummarySection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.summary');
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

export const navigationDocumentationSection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.documentation');
}

export const navigationDocumentationList = (element) => {
  const apiNavigation = navigationDocumentationSection(element);
  return apiNavigation.querySelectorAll('.list-item');
}

export const navigationTypesSection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.types');
}

export const navigationTypesList = (element) => {
  const apiNavigation = navigationTypesSection(element);
  return apiNavigation.querySelectorAll('.list-item');
}

export const navigationSecuritySection = (element) => {
  const apiNavigation = navigationTree(element);
  return apiNavigation.shadowRoot.querySelector('.security');
}

export const navigationSecurityList = (element) => {
  const apiNavigation = navigationSecuritySection(element);
  return apiNavigation.querySelectorAll('.list-item');
}


