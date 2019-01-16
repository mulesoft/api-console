# Using the API Console as a HTML element

## Development environment

When developing an API portal which API console is a part, it's easier to start with source files that the build. With sources it's faster to identify specific component in the developer tools.

1) Install the console as a dependency of your project. Use [bower][bower] for this.

```
bower install --save mulesoft/api-console
```

2) Import the console.

```html
<!-- Very small library that imports polyfills if needed -->
<script src="bower_components/webcomponentsjs/webcomponents-loader.js"></script>
<!-- Sources of the console -->
<link rel="import" href="bower_components/api-console/api-console.html">
```

3) Use the HTML tag.

```html
<body>
  <api-console amf-model="{...}"></api-console>
</body>
```

## Production environment

We encourage you to use our [build tools](build-tools.md) to generate production ready bundles.

1) Install the console

```
bower install --save mulesoft/api-console
```

2) Generate build bundles

```javascript
const builder = require('api-console-builder');
builder({
  embedded: true,
  themeFile: './my-theme.html', // optional
  destination: './public/api-console/'
})
.then(() => console.log('Build complete <3'))
.catch((cause) => console.log('Build error <\\3', cause.message));
```

3) Use import script to detect bundle type to load

```HTML
<!doctype html>
<html lang="en">
  <head>
    <script>
    window.apic = {
      // This is optional, default to `/` path.
      basePath: '/public/api-console/'
    };
    </script>
    <script src="bower_components/api-console/apic-import.js"></script>
  </head>
  <body>
    ...
    <api-console amf-model="{...}"></api-console>
    ...
  </body>
</html>
```

The bundles generator creates `es5-bundle` and `es6-bundle`. The `apic-import.js`
script decides which one to use depending on browsers capabilities.
The script also includes `webcomponents-loader.js` to load polyfills if needed.

## Roadmap notes

HTML imports is abandoned specification of web components. Preferred way is to
use ES6 modules imports. This version of the console won't use it as the tooling
set at the moment of development of this version of the console is rather non existing.

Next release will be hosted on NPM only and will use modules syntax.

[bower]: https://bower.io/
