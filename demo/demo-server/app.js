// import Koa from 'koa';
import { createConfig, startServer } from 'es-dev-server';
import { demoApi } from './api.js';

const config = createConfig({
  port: 8001,
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
config.openBrowser = true;
startServer(config);
