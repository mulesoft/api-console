import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

export class ApiDescribe {
  /**
   * @param {string} label
   * @param {boolean} compact
   */
  constructor(label, compact=false) {
    /**
     * @type {string}
     */
    this.label = label;
    /**
     * @type {boolean}
     */
    this.compact = compact;
  }
}

export const AmfLoader = {};

/**
 * @mixes AmfHelperMixin
 */
class HelperElement extends AmfHelperMixin(Object) {}

const helper = new HelperElement();

/**
 * @typedef {Object} ApiLoadOptions
 * @property {boolean=} compact Whether to download a compact version of an API
 * @property {string=} fileName Name of the API file, without the extension
 */

/**
 * @typedef {Object} ApiModel
 */

/**
 * @typedef {Object} WebApiModel
 */

/**
 * @typedef {Object} EndpointModel
 */

/**
 * @typedef {Object} OperationModel
 */

/**
 * @typedef {Object} PayloadModel
 */

/**
 * @typedef {Object} SecurityModel
 */

/**
 * @typedef {Object} TypeModel
 */

/**
 * @typedef {Object} DocumentationModel
 */

/**
 * @typedef {Object} EncodeModel
 */

/**
 * Downloads API file from the demo/models/ folder.
 * @param {ApiLoadOptions=} [config={}]
 *
 * @return {Promise<ApiModel>} Promise resolved to API object.
 */
AmfLoader.load = async function(config = {}) {
  const { compact=false, fileName='demo-api' } = config;
  const suffix = compact ? '-compact' : '';
  const file = `${fileName}${suffix}.json`;
  const url = location.protocol + '//' + location.host + '/base/demo/models/'+ file;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to download ${url}`);
  }
  const result = await response.json();
  return Array.isArray(result) ? result[0] : result;
};

/**
 * Lookups WebAppi's AMF definition from the API model.
 * @param {ApiModel} model Api model.
 * @return {WebApiModel} Model for the WebApi
 */
AmfLoader.lookupWebApi = function(model) {
  helper.amf = model;
  return helper._computeWebApi(model);
};

/**
 * Searches for an endpoint in the API model
 * @param {ApiModel} model Api model.
 * @param {string} endpoint Endpoint path
 * @return {EndpointModel|undefined} Model for the endpoint
 */
AmfLoader.lookupEndpoint = function(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
};

/**
 * Searches for an endpoint in the API model
 * @param {ApiModel} model Api model.
 * @param {string} endpoint Endpoint path
 * @param {string} operation Operation name (the verb, lowercase)
 * @return {OperationModel|undefined} Model for the endpoint
 */
AmfLoader.lookupOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
};

/**
 * Searches for an payload model in an operation
 * @param {ApiModel} model Api model.
 * @param {string} endpoint Endpoint path
 * @param {string} operation Operation name (the verb, lowercase)
 * @return {PayloadModel[]|undefined} Model for the payload
 */
AmfLoader.lookupPayload = function(model, endpoint, operation) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  return helper._ensureArray(helper._computePayload(expects));
};

/**
 * Looks up for an endpoint and an operation in a single query.
 * Thids is equivalent to calling:
 *
 * ```javascript
 * const result = [AmfLoader.lookupEndpoint(...), AmfLoader.lookupOperation(...)]
 * ```
 *
 * @param {ApiModel} model Api model.
 * @param {string} endpoint Endpoint path
 * @param {string} operation Operation name (the verb, lowercase)
 * @return {Array<EndpointModel|OperationModel>} First item is the endpoint model and the second is the operation model.
 */
AmfLoader.lookupEndpointOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  const op = ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
  return [endPoint, op];
};

/**
 * Looks up for a security definition in the API model.
 * @param {ApiModel} model Api model.
 * @param {string} name Name of the security scheme
 * @return {SecurityModel}
 */
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

/**
 * Looks up for a type definition in the API model.
 * @param {ApiModel} model Api model.
 * @param {string} name Name of the data type
 * @return {TypeModel}
 */
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

/**
 * Looks up for a documentation definition in the API model.
 * @param {ApiModel} model Api model.
 * @param {string} name Name of the documentation
 * @return {DocumentationModel}
 */
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

/**
 * Looks up for the list of encoded values in the API model.
 * @param {ApiModel} model Api model.
 * @return {EncodeModel[]}
 */
AmfLoader.lookupEncodes = function(model) {
  if (model instanceof Array) {
    model = model[0];
  }
  helper.amf = model;
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.document.encodes);
  return helper._ensureArray(model[key]);
};
