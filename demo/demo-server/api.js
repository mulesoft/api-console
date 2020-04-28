import { ApiParser } from './api/api-parser.js';
const parser = new ApiParser();

function wrapError(cause) {
  return {
    error: true,
    code: 500,
    message: cause.message,
    detail: 'The server misbehave. That is all we know.'
  };
}

async function apiRequest(ctx) {
  let body;
  try {
    if (ctx.request.url === '/api/parse/api') {
      body = await parser.parseFile(ctx.req);
    } else if (ctx.request.url.indexOf('/api/parse/candidate') === 0) {
      body = await parser.parseCandidate(ctx.req);
    } else if (ctx.request.url.indexOf('/api/parse/result/') === 0) {
      const id = ctx.request.url.substr(18);
      body = await parser.checkStatus(id);
    } else {
      ctx.response.status = 404;
      body = 'unknown';
    }
  } catch (e) {
    body = wrapError(e);
    console.error(e);
  }
  /* eslint-disable require-atomic-updates */
  if (body.code) {
    ctx.status = body.code;
  }
  // console.log('response', body);
  ctx.body = body;
}

export async function demoApi(ctx, next) {
  if (ctx.request.url.indexOf('/api/') === 0) {
    await apiRequest(ctx);
  } else {
    return next();
  }
}
