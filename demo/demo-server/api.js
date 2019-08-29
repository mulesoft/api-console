
async function apiRequest(ctx) {
  if (ctx.request.url === '/api/parse/api') {
    ctx.body = 'PARSING SERVICE';
  } else {
    ctx.response.status = 404;
    ctx.body = 'unknown';
  }
}

export async function demoApi(ctx, next) {
  if (ctx.request.url.indexOf('/api') === 0) {
    await apiRequest(ctx);
  } else {
    await next();
  }
}
