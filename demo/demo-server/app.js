/* eslint-disable import/no-extraneous-dependencies */
import { createConfig, startServer } from 'es-dev-server';
import fs from 'fs-extra';
import path from 'path';
import { demoApi } from './api.js';

async function proxy(ctx, next) {
  if (ctx.request.url === '/demo/vendor.js') {
    /* eslint-disable require-atomic-updates */
    ctx.body = await fs.readFile(path.join(__dirname, '..', 'vendor.js'));
    return;
  }
  if (ctx.request.url === '/node_modules/marked/lib/marked.js') {
    const file = path.join(__dirname, '..', '..', 'node_modules', 'marked', 'lib', 'marked.js');
    const body = await fs.readFile(file, 'utf8');
    ctx.response.set('content-type', 'text/javascript');
    ctx.body = body.replace('(this || (', '(window || (');
    return;
  }
  return next();
}

const config = createConfig({
  // port: 8001,
  watch: true,
  nodeResolve: true,
  appIndex: 'demo/index.html',
  moduleDirs: ['node_modules'],
  logStartup: true,
  openBrowser: true,
  compatibility: 'auto',
  babelExclude: [
    '**/vendor.js'
  ],
  middlewares: [
    demoApi,
    proxy,
  ]
});
config.openBrowser = true;
startServer(config);
