import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { LitElement } from 'lit-element';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async function(compact, fileName) {
  compact = compact ? '-compact' : '';
  fileName = fileName || 'demo-api';
  const file = `${fileName}${compact}.json`;
  const url = location.protocol + '//' + location.host + '/base/demo/models/'+ file;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
        /* istanbul ignore next */
      } catch (e) {
        /* istanbul ignore next */
        reject(e);
        /* istanbul ignore next */
        return;
      }
      resolve(data);
    });
    /* istanbul ignore next */
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};

AmfLoader.lookupWebApi = function(model, endpoint) {
  helper.amf = model;
  return helper._computeWebApi(model);
};

AmfLoader.lookupEndpoint = function(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
};

AmfLoader.lookupOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint, operation);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
};

AmfLoader.lookupPayload = function(model, endpoint, operation) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  return helper._ensureArray(helper._computePayload(expects));
};

AmfLoader.lookupEndpointOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint, operation);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  const op = ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
  return [endPoint, op];
};

AmfLoader.lookupSecurity = function(model, name) {
  helper.amf = model;
  const webApi = helper._hasType(model, helper.ns.aml.vocabularies.document.Document) ?
    helper._computeWebApi(model) :
    model;
  const declares = helper._computeDeclares(webApi) || [];
  let result = declares.find((item) => {
    if (item instanceof Array) {
      item = item[0];
    }
    const result = helper._getValue(item, helper.ns.aml.vocabularies.core.name) === name;
    if (result) {
      return result;
    }
    return helper._getValue(item, helper.ns.aml.vocabularies.security.name) === name;
  });
  if (result instanceof Array) {
    result = result[0];
  }
  if (!result) {
    const references = helper._computeReferences(model) || [];
    for (let i = 0, len = references.length; i < len; i++) {
      if (!helper._hasType(references[i], helper.ns.aml.vocabularies.document.Module)) {
        continue;
      }
      result = AmfLoader.lookupSecurity(references[i], name);
      if (result) {
        break;
      }
    }
  }
  return result;
};

AmfLoader.lookupType = function(model, name) {
  helper.amf = model;
  const webApi = helper._hasType(model, helper.ns.aml.vocabularies.document.Document) ?
    helper._computeWebApi(model) :
    model;
  const declares = helper._computeDeclares(webApi) || [];
  let result = declares.find((item) => {
    if (item instanceof Array) {
      item = item[0];
    }
    return helper._getValue(item, helper.ns.w3.shacl.name) === name;
  });
  if (result instanceof Array) {
    result = result[0];
  }
  if (!result) {
    const references = helper._computeReferences(model) || [];
    for (let i = 0, len = references.length; i < len; i++) {
      if (!helper._hasType(references[i], helper.ns.aml.vocabularies.document.Module)) {
        continue;
      }
      result = AmfLoader.lookupType(references[i], name);
      if (result) {
        break;
      }
    }
  }
  return result;
};

AmfLoader.lookupDocumentation = function(model, name) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.core.documentation);
  const docs = helper._ensureArray(webApi[key]);
  return docs.find((item) => {
    if (item instanceof Array) {
      item = item[0];
    }
    return helper._getValue(item, helper.ns.aml.vocabularies.core.title) === name;
  });
};

AmfLoader.lookupEncodes = function(model) {
  if (model instanceof Array) {
    model = model[0];
  }
  helper.amf = model;
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.document.encodes);
  return helper._ensureArray(model[key]);
};
