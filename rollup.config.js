// https://open-wc.org/building/building-rollup.html#configuration

import { createCompatibilityConfig } from '@open-wc/building-rollup';
import path from 'path';
import cpy from 'rollup-plugin-cpy';
import postcss from 'rollup-plugin-postcss';

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
  {
    ...config[0],
    plugins: [
      ...config[0].plugins,
      postcss()
    ]
  },
  {
    ...config[1],
    plugins: [
      ...config[1].plugins,
      postcss(),
      cpy({
        files: [
          path.join('demo', 'vendor.js'),
        ],
        dest: 'dist',
        options: {
          parents: false,
        },
      }),
      cpy({
        files: [
          path.join('demo', 'models', '*.json'),
        ],
        dest: path.join('dist', 'models'),
        options: {
          parents: false,
        },
      }),
    ],
  },
];
