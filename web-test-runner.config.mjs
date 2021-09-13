export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  middleware: [
    function rewriteBase(context, next) {
      if (context.url.indexOf('/base') === 0) {
        context.url = context.url.replace('/base', '');
      }
      return next();
    }
  ],
  coverageConfig: {
    include: ['src/**.js'],
  },
  testsFinishTimeout: 20000,
  testRunnerHtml: (testFramework) =>
  `<html>
  <body>
    <script src="./demo/vendor.js"></script>
    <script type="module" src="${testFramework}"></script>
  </body>
  </html>`
};
