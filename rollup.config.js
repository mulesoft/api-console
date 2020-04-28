// https://open-wc.org/building/building-rollup.html#configuration

import { createSpaConfig } from '@open-wc/building-rollup';
import merge from 'deepmerge';
import path from 'path';
import cpy from 'rollup-plugin-cpy';
import postcss from 'rollup-plugin-postcss';

const baseConfig = createSpaConfig({
  developmentMode: process.env.ROLLUP_WATCH === 'true',
  injectServiceWorker: false,
});

export default merge(baseConfig, {
  input: path.resolve(__dirname, 'index.html'),
  context: 'window',
  output: {
    sourcemap: false,
  },
  plugins: [
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
});

// const config = createCompatibilityConfig({
//   input: path.resolve(__dirname, 'index.html'),
//   context: 'window',
//   indexHTMLPlugin: {
//     minify: {
//       minifyJS: true,
//       removeComments: true
//     }
//   }
// });
//
// // export default config;
//
// config[0].context = 'window';
// config[1].context = 'window';
//
// export default [
//   {
//     ...config[0],
//     plugins: [
//       ...config[0].plugins,
//       postcss()
//     ]
//   },
//   {
//     ...config[1],
//     plugins: [
//       ...config[1].plugins,
//       postcss(),
//       cpy({
//         files: [
//           path.join('demo', 'vendor.js'),
//         ],
//         dest: 'dist',
//         options: {
//           parents: false,
//         },
//       }),
//       cpy({
//         files: [
//           path.join('demo', 'models', '*.json'),
//         ],
//         dest: path.join('dist', 'models'),
//         options: {
//           parents: false,
//         },
//       }),
//     ],
//   },
// ];
