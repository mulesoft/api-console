# Getting started with web components

Web Components is relatively new specification for the web platform and therefore it is understandable that not all developers know how to use them.

Fortunately for the use of the API console you have to learn basics only but we are encouraging you to learn more about the spec(s) to maximize your efficiency while working with web components.

## Basic concepts

The web components is a combination of 4 specifications that browser vendors and developers community agreed on.

### Custom Elements

The specification allows to define new HTML elements. The HTML standard is limited to a set number of defined elements but new specification allows us to extend it to new elements with its own behaviors.

See the specification here: [Custom elements](https://w3c.github.io/webcomponents/spec/custom/)

### Shadow DOM

Allows us to encapsulate logic and view of the custom element. Nothing leaks out and nothing can interfere with your element until you allow this by exposing element's API or CSS variables / mixins to style the element. You can think of it as how current `<video>` element is constructed. You can see a video and controls to control the
playback and volume. It expose its behavior (`play()`, `pause()` etc), properties (attributes) to control UI state (`controls`, `src`), events (`playing`, `loadstart`) and styling options. Element that declares shadow DOM can do the same thing and
hide any properties that the hosting application shouldn't use.

See the specification here: [shadow dom](https://w3c.github.io/webcomponents/spec/shadow/)

### HTML template

Allows to declare a HTML fragments that are not used during the page load but can be instantiated anytime later. This way you can include a lot of HTML structure without adding it to the DOM. This specification is heavily used in the Polymer library where you can create an element defining it's markup in the element definition but it is unused until the element is actually registered and attached to the DOM.


### Imports

This version of the console still works with original HTML imports specification implemented in Chrome only. Currently all browsers already implemented ES6 module imports which works with web components. However, this version of the console won't support it at the time. ES6 modules imports will be supported with next major release.


## Custom element lifecycle callbacks

Because your web component is not a part of the HTML tags spec it is undefined for the browser until you actually register the element. It doesn't mean that you can't use the custom element in the markup before its registration. On the contrary. When you use an element that is not yet registered it is recognized as the [unknown element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLUnknownElement). Later, when the custom element is (possibly) imported and registered the instance of the unknown element is upgraded with the actual definition of the element.

**Custom elements can be used before their definition is registered.**

When the element is already registered and it is instantiated and inserted into the DOM few functions are called as a lifecycle methods.

**Constructor** is called when an instance of the element is created or upgraded. It is useful for initializing state, settings up event listeners, or creating shadow dom.

**connectedCallback** is called every time the element is inserted into the DOM. Remind that an element can be inserted more than once to the DOM, especially when it is used in dynamic applications.

**disconnectedCallback** is an inverse of `connectedCallback`. It is called when the element is removed from the DOM.

**attributeChangedCallback** is called when an attribute was added, removed, updated, or replaced. It is a method to use to expose an API of the element in a HTML way - by setting attributes. Like in the `<video>` example, the `controls` getter and setter can control whether the player controls are visible or not. This would be handled by this method call.

**adoptedCallback** is called when the custom element has been moved into a new document.

## So when an element is ready to use?

If you include definition of your element into the source of the web page and register it before application code runs then you can use the element's API right away. When using API console build tools the default build is a standalone application that contains all dependencies in index page source. At the time when browser parser runs JavaScript code of the application (when it suppose to parse RAML data or set JavaScript object on the console) all elements are already registered and full API is available.

It is possible to include console's sources from an external file (to reduce initial load time, for example). In this
case web components are not yet registered when running application's JavaScript code.
Properties can be set whether the element is `HTMLUnknownElement` or defined element. Once the element is upgraded created the `attributeChangedCallback` is called for each set attribute.

Calling element's API methods exposed to external environment (outside shadow DOM) will result with error because at the time the element hasn't been upgraded. Application must wait until `WebComponentsReady` event is fired by the polyfill library. After that event all components are upgraded and ready to use.

## Creating a web component

There are already a lot of good tutorials about creating web components so it's redundant. Personally I can suggest Eric Bidelman's [Custom Elements v1: Reusable Web Components](https://developers.google.com/web/fundamentals/architecture/building-components/customelements). It is a good introduction to web components and explanation how to register and use them.

If you have any question use our issue tracker to contact me. I'll be happy to help you to use the API console.

[Pawel Psztyc](https://github.com/jarrodek)
