import path from 'path';
import multiEntry from 'rollup-plugin-multi-entry';
import { uglify } from 'rollup-plugin-uglify';


export default {
  input: [
    path.resolve(__dirname, 'components', 'node_modules', 'jsonlint', 'lib', 'jsonlint.js'),
    './node_modules/codemirror/lib/codemirror.js',
    './node_modules/codemirror/addon/mode/loadmode.js',
    './node_modules/codemirror/mode/meta.js',
    './node_modules/codemirror/mode/javascript/javascript.js',
    './node_modules/codemirror/mode/xml/xml.js',
    './node_modules/codemirror/mode/htmlmixed/htmlmixed.js',
    './node_modules/codemirror/addon/lint/lint.js',
    './node_modules/codemirror/addon/lint/json-lint.js',
    // './node_modules/cryptojslib/components/core.js',
    // './node_modules/cryptojslib/rollups/sha1.js',
    // './node_modules/cryptojslib/components/enc-base64.js',
    // './node_modules/cryptojslib/rollups/md5.js',
    // './node_modules/cryptojslib/rollups/hmac-sha1.js',
    // './node_modules/jsrsasign/lib/jsrsasign-rsa.js',
    './node_modules/web-animations-js/web-animations-next.js'
  ],
  output: {
    format: 'iife',
    file: 'dist/vendor.js'
  },
  plugins: [
    multiEntry(),
    uglify()
  ],
  context: 'window'
};
