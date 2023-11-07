// eslint-disable-next-line no-undef
const amf = require('amf-client-js');

/** @typedef {import('amf-client-js').AMFConfiguration} AMFConfiguration */

/**
 * @typedef ApiSearchResult
 * @property {string} type
 */

/**
 * @typedef ParserApiConfiguration
 * @property {string} source
 * @property {ApiSearchResult} from
 */

const {
  RAMLConfiguration,
  OASConfiguration,
  AsyncAPIConfiguration,
  RenderOptions,
  PipelineId,
} = amf;

/**
 * @param {string} vendor
 * @returns {AMFConfiguration}
 */
const getConfiguration = (vendor) => {
  switch (vendor) {
    case 'RAML 0.8': return RAMLConfiguration.RAML08();
    case 'RAML 1.0': return RAMLConfiguration.RAML10();
    case 'OAS 2.0':
    case 'OAS 2':
      return OASConfiguration.OAS20();
    case 'OAS 3.0':
    case 'OAS 3':
      return OASConfiguration.OAS30();
    case 'ASYNC 2.0': return AsyncAPIConfiguration.Async20();
    default: throw new Error(`Unknown vendor: ${vendor}`);
  }
};

/**
 * AMF parser to be called in a child process.
 *
 * AMF can in extreme cases takes forever to parse API data if, for example,
 * RAML type is defined as a number of union types. It may sometimes cause
 * the process to crash. To protect the renderer process this is run as forked
 * process.
 *
 * @param {ParserApiConfiguration} data
 */
const processData = async (data) => {
  const sourceFile = data.source;
  const { type } = data.from;

  const ro = new RenderOptions().
    withSourceMaps().
    withCompactUris();
  const apiConfiguration = getConfiguration(type).withRenderOptions(ro);
  const client = apiConfiguration.baseUnitClient();
  const file = `file://${sourceFile}`;
  const result = await client.parse(file);
  const transformed = client.transform(result.baseUnit, PipelineId.Editing);
  return client.render(transformed.baseUnit, 'application/ld+json');
};

process.on('message', async (data) => {
  const typed = /** @type ParserApiConfiguration */ (data);
  try {
    const api = await processData(typed);
    process.send({
      api
    });
  } catch (cause) {
    let m = `AMF parser: Unable to parse API ${typed.source}.\n`;
    m += cause.s$1 || cause.message;
    process.send({ error: m });
  }
});
