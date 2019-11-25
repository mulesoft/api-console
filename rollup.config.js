// https://open-wc.org/building/building-rollup.html#configuration

import { createCompatibilityConfig } from '@open-wc/building-rollup';
import path from 'path';
import vendorConfig from './vendor.rollup.config.js';

const config = createCompatibilityConfig({
  input: path.resolve(__dirname, 'index.html'),
  context: 'window',
  indexHTMLPlugin: {
    minify: {
      minifyJS: true,
      removeComments: true
    }
  }
});

// export default config;

config[0].context = 'window';
config[1].context = 'window';

export default [
  vendorConfig,
  config[0],
  config[1]
];
