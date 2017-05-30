# The API Console

An API console for RAML (Restful Api Modeling Language) documents. The RAML Console allows browsing of API documentation and in-browser testing of API methods.

## Introduction

The API console is a single HTML element build on top of the [Web Components specifications](https://www.webcomponents.org/introduction) and powered by the [Polymer library](https://www.polymer-project.org/). Knowledge about how Polymer works won't be necessary when using the console.

## 1. Using the API console

The API console comes with two flavors: as a **HTML element** and as a **standalone application**. Depending on your use case you should choose the best option for your users.

### Standalone application

API Console as a standalone application should be used to display the documentation for your API as a web page.

The application will support routing ([Deep linking][deep linking]) and it will render the documentation full screen.

Also, if needed, the application can include RAML parser so it can accept the RAML file and transform its content into internal data model. See [Optimization](#optimisation-options) section below for more information.

Basic example of the standalone application you will find in [demo application] inside this repository.

### HTML element

The API Console was build on top of new Web Components specification. When you include sources of the console into your web application it will register a new HTML element, the `<api-console>` element, that can be used as any other element on your page or web application. This means that you can embed the console into your blog post or as a part of press release and your users will be able to get know your API without being redirected to another web page.

For example:

```html
<api-console></api-console>
```

See full usage documentation and how to import sources into your web page in the [api console element docs].

## 2. Optimisation options

The API Console displays a documentation for RAML definition. It means that it must perform some heavy duty computations to transform RAML data into JavaScript object and this takes time. There are, however, few options to optimise loading time of the API console. It depends on your use case.

### RAML data source

If your API is under active development and changes often, you may want to consider using the RAML file hosted on a server as a data source. The API console application will then parse RAML file using RAML JavaScript parser and use the parser output as a data source. It will take some time during console's load time but you will always display your APIs newest version.

Because this use case requires to include more custom HTML elements it's not suitable for the standalone version. Other options would be a better fit.

### JSON data source

This is a good choice if your API doesn't change often or if you are using our [build tools] in your CI process. In this case you can generate a JSON file from the RAML and use it as a data input in the `<api-console>` element.

This option will significantly reduce the API Console load time. It is also suitable for both standalone application and the HTML element.

### JSON inlined in the page source

This option gives you the fastest load time but may increase initial page weight. It is the same option as the JSON data source but the JSON data are not kept in separate JSON file but the data are included in the page source as a JavaScript object.

You should use this if your API changes rarely or never. Every change to source RAML file would require regenerating the whole page. Though, it can be automated with our [build tools].

## 3. API Console configuration options

Configuration options differs from previous version. Because the API console is a (custom) HTML element it's configuration is based on HTML attributes. You can pass values as an attribute value or set boolean option by simply setting the attribute. Configuration from JavaScript code is based on setting a JavaScript property as the attribute name on the element. If the attribute name contains dashes then the property name should be [camel cased].

Example:

```html
<api-console append-headers="x-api-key: 1234" narrow></api-console>
```

which is equivalent of:

```javascript
var console = document.querySelector('api-console');
console.narrow = true;
console.appendHeaders = 'x-api-key: 1234';
```

Full list of the API console configuration options can be found in the [configuring the api console] document.

## 4. Build tools

The API Console comes with a set of build tools that will help you create the API console from the RAML file. Build tools are configured to produce a production optimized version of the API Console. The build tools can generate both standalone and embeddable version of the console. You can also configure data source strategy (RAML, JSON or inline JSON as a data source).

Available build tools are the `api-console` CLI and node modules: `api-console-builder` and `raml-json-enhance-node`. Depending on your needs you can choose whether you want to use a CLI tool or a node module.

Build tools can be helpful in the CI process to automate documentation release cycle. See the [build tools] documentation for more information and build strategies.

## 5. Theming

The API console support theming. By default it comes with it's own styling but you can create your own theme and style the console to match your corporate style guide.

Theming is based on CSS variables and CSS mixins. Basic concepts of using the variables and mixins are described in [Polymer 1.0 styling] documentation. You can check the [api-console-styles.html](api-console-styles.html) file to see current theme definition and then read [theming documentation] to learn how to create your own theme.

## 6. Preview and development

The API Console is a custom element that serves as a shell element for other custom web components. It means that to develop the API console most probably you'd have to develop one of over a hundred other web components that creates the console. All the elements are described in [the elements catalogue].

1. Clone the element:
```
git clone https://github.com/mulesoft/api-console.git
cd api-console
```

2. Checkout latest version
```
git checkout release/4.0.0
```

3. Install [polymer-cli] and [Bower].
```
sudo npm install -g bower polymer-cli
```

4. Install dependencies
```
bower install
```

5. Serve the element
```
polymer serve --open -p 8080
```

Default page is the element's documentation. Switch to demo to see working example.

You can also append the `/demo/` to the URL to switch to demo page permanently.

## 7. Reporting issues and features requests

The API Console and the Advanced REST client is open and we encourage the community to contribute in the project. However, it is very important to follow couple of simple rules when you create an issue report or send a pull request.

Please, see CONTRIBUTING.md for description of how to file issue report of feature request.

### Contributor's Agreement

To contribute source code to this repository, please read our [contributor's agreement](http://www.mulesoft.org/legal/contributor-agreement.html), and then execute it by running this notebook and following the instructions: https://api-notebook.anypoint.mulesoft.com/notebooks/#380297ed0e474010ff43

## 8. License

The API console is shared under Common Public Attribution License Version 1.0 (CPAL-1.0).

See the LICENSE.md file for more information.

[deep linking]: https://en.wikipedia.org/wiki/Deep_linking
[demo application]: demo/api.html
[api console element docs]: docs/api-console-element.md
[build tools]: docs/build-tools.md
[configuring the api console]: docs/configuring-api-console.md
[theming documentation]: docs/theming.md
[camel cased]: https://en.wikipedia.org/wiki/Camel_case
[polymer-cli]: https://www.polymer-project.org/1.0/docs/tools/polymer-cli
[Bower]: https://bower.io/
[Polymer 1.0 styling]: https://www.polymer-project.org/1.0/docs/devguide/styling
[the elements catalogue]: https://elements.advancedrestclient.com/
