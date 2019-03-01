module.exports = {
  staticFileGlobs: [
    'manifest.json'
  ],
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'fastest'
    },
    {
      urlPattern: /\/@codemirror\//,
      handler: 'fastest'
    },
    {
      urlPattern: /\/@advanced-rest-client\/code-mirror-hint\//,
      handler: 'fastest'
    },
    {
      urlPattern: /\/cryptojslib\//,
      handler: 'fastest'
    }
  ]
};
