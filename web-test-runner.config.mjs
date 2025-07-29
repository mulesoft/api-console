import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin'

export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  browsers: [
    playwrightLauncher({
      product: 'chromium',
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 20000
      }
    }),
    playwrightLauncher({ product: 'firefox' }),
  ],
  middleware: [
    function rewriteBase(context, next) {
      if (context.url.indexOf('/base') === 0) {
        context.url = context.url.replace('/base', '')
      }
      return next()
    },
  ],
  coverageConfig: {
    include: ['src/**.js'],
  },
  testFramework: {
    config: {
      timeout: 800000,
    },
  },
  browserStartTimeout: 20000,
  testsStartTimeout: 20000,
  testsFinishTimeout: 800000,
  plugins: [
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'),
      diffOptions: {
        threshold: 1,
      },
    }),
  ],
  testRunnerHtml: (testFramework) =>
    `<html>
  <body>
    <script src="./demo/vendor.js"></script>
    <script type="module" src="${testFramework}"></script>
  </body>
  </html>`,
}
