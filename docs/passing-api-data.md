# Passing API data

API console (from version 5) works with [AMF][] data model only. AMF allows to parse different API formats (like RAML or OAS) and produce common data model. This model is used with API console.

This section describes how to pass AMF model to API console.

## Option 1: pre-generated model

For performance reasons it is recommended to generate data model at API publish time and pass generated data when a user runs the console.
Our [build tools][] generate such file when working with standalone application (default setup).

API console accepts `model-location` attribute (or `modelLocation` property on the element) which loads a file from this location.
This property can change at runtime to dynamically render different APIs.

__Example__

```html
<api-console model-location="static/api/api-model.json"></api-console>
```

The location of the model can be relative or absolute. Note that CORS applies to the request.

Other way of passing the data is to read API model from any source and pass the model manually to the console.

__Example__

```html
<api-console id="console"></api-console>
```

```javascript
const model = await downloadModel();
const apic = document.getElementById('console');
apic.amfModel = model;
```

## Option 2: Generating model

Use [amf-client-js][], our JavaScript AMF library, to generate AMF model from sources.
AMF can be use on server side as a JavaScript or Java library to generate the model.
JavaScript client can also be used directly in browser.

The example below shows how to use AMF library in node application on your server.

```javascript
const amf = require('amf-client-js');
const fs = require('fs');

amf.plugins.document.WebApi.register();
amf.plugins.document.Vocabularies.register();
amf.plugins.features.AMFValidation.register();

const apiFile = 'api/api.raml';

amf.Core.init()
.then(() => {
  const parser = amf.Core.parser('RAML 1.0', 'application/yaml');
  return parser.parseFileAsync(`file://${apiFile}`);
})
.then((doc) => {
  // Validation is optional but it is nice to know if your API contains errors.
  const validateProfile = amf.ProfileNames.RAML;
  // amf.ProfileNames.RAML08 for RAML 0.8
  // amf.ProfileNames.OAS for OAS
  return amf.AMF.validate(doc, validateProfile)
  .then((report) => {
    if (!report.conforms) {
      console.log(report.toString());
    }
    return doc;
  });
})
.then((doc) => {
  const resolver = amf.Core.resolver('RAML 1.0');
  doc = resolver.resolve(doc, 'editing');
  // the `editing` is special case of producing AMF model for API console.
  const opts = amf.render.RenderOptions().withSourceMaps.withCompactUris;
  // This options prepare a compact json-ld model and adds source maps to the
  // model.
  const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
  return generator.generateString(doc, opts);
})
.then((data) => {
  fs.writeFileSync('build/api-model.json', data, 'utf8');
});
```

In first step AMF parses API file. The parser needs to know what is the type of the language (RAML or OAS and version) and content type of the file. RAML's and OAS 3.0 content type is `application/yaml`. OAS 1 and 2 is `application/json`.

File location must have valid scheme. Local files should start with `file://` scheme.

In second step the API is being validated. It does not stop model generation. Just prints validation result so the author of the API can see validation errors. AMF tries to parse as much as it can. If there's a validation error (for example YAML syntax error) this part is not included into the model. However everything else that can be read will be.
It is possible to stop model generation here if you detect an error (`report.conforms` is `false`).

Next step is to generate json-ld model from AMF graph. First it creates a resolcer that resolves API model from API file.
In our case we are creating resolver for `RAML 1.0`. Other options are `OAS x.x` or `RAML 0.8` where x.x is version of OAS.
In next line the document is resolved using so called `editing` pipeline. It is a plugin for AMF to generate a model consumed by API console.
This is required or API console render only a portion of the data.

Finally the generator generates a string which is json-ld model that we are storing to the file that can be later used by the console.

The use of `amf.render.RenderOptions().withSourceMaps.withCompactUris` is optional but it generates smaller file so it is recommended to use this option.

Once the model is generated you can pass it to the console directly or reference the file via `model-location` attribute.

## Using raml-aware

[raml-aware][] uses [Monostate Pattern][] to hold AMF data model and propagate it to any listener that uses raml-aware.
Once data is assigned to the aware element it is instantly propagated across the application.
It can be used when application code does not have direct access to the instance of API console (as a pointer to custom element).
In this case application should create `raml-aware`element and put it into the DOM. After that assign AMF model to `raml` property.

API console has to have `aware` property set to the same value as `raml-aware`'s `scope` proeprty.

#### Example

```html
<!-- Somewhere in the application, probably inside shadow root or React component -->
...
<api-console aware="api-model"></api-console>
...
```

```html
<!-- Curernt scope -->
...
<raml-aware id="aware" scope="api-model"></raml-aware>
...
```
```javascript
const model = await downloadModel();
const aware = document.getElementById('aware');
aware.raml = model;
```

After setting `aware.raml = model;` the same model is instantly awailable to
API console.

[AMF]: https://github.com/aml-org/amf
[build tools]: build-tools.md
[amf-client-js]: https://www.npmjs.com/package/amf-client-js
[raml-aware]: https://github.com/advanced-rest-client/raml-aware
[Monostate Pattern]: http://wiki.c2.com/?MonostatePattern
