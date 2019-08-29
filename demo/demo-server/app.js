// import Koa from 'koa';
import { createConfig, startServer } from 'es-dev-server';
import { demoApi } from './api.js';

const config = createConfig({
  // port: 8082,
  watch: true,
  nodeResolve: true,
  appIndex: 'demo/index.html',
  moduleDirs: ['node_modules'],
  logStartup: true,
  openBrowser: true,
  middlewares: [
    demoApi
  ]
});
startServer(config);
