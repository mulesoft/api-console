/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { html, css, LitElement } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@api-components/raml-aware/raml-aware.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@api-components/api-navigation/api-navigation.js';
import '@api-components/api-documentation/api-documentation.js';
import '@api-components/api-request-panel/api-request-panel.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@api-components/api-console-ext-comm/api-console-ext-comm.js';
import attributionTpl from './attribution-template.js';

export const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
/**
 * he API Console
 *
 * API designed for humans.
 *
 * @customElement
 * @demo demo/index.html
 * @memberof MulesoftApps
 * @appliesMixin AmfHelperMixin
 */
export class ApiConsole extends AmfHelperMixin(LitElement) {
  static get styles() {
    return css`:host {
      display: block;
    }

    :host([app]) {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    *[hidden] {
      display: none !important;
    }

    .nav-content {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .powered-by {
      padding: 12px 0px;
      border-top: 1px rgba(0,0,0,0.24) solid;
      margin: 8px 12px 0 12px;
    }

    a img {
      text-underline: none;
    }

    a.attribution {
      display: inline-block;
      width: 177px;
      margin-left: 24px;
      fill: var(--api-console-menu-color, #424143);
    }

    app-drawer-layout:not([narrow]) [drawer-toggle] {
      display: none;
    }

    /* app-drawer {
      z-index: 0;
    } */

    /* :host(:not([app])) app-drawer {
      position: absolute;
    } */

    /* :host([layout-narrow]) app-drawer {
      z-index: var(--api-console-drawer-zindex, 1);
    } */

    app-toolbar {
      background-color: var(--api-console-toolbar-background-color, #283640); /* #2196f3 */
      color: var(--api-console-toolbar-color, #fff);
    }

    .extension-banner {
      align-items: center;
      display: none;
      border-bottom: 1px var(--api-console-extension-banner-border-bottom-color, rgba(0,0,0,0.12)) solid;
      border-top: 1px var(--api-console-extension-banner-border-bottom-color, rgba(0,0,0,0.12)) solid;
      margin-bottom: 12px;
      box-sizing: border-box;
      color: var(--api-console-extension-banner-color, rgba(0,0,0,0.54));
    }

    .extension-banner[active] {
      display: flex;
      flex-direction: row;
    }

    .main-content {
      margin-left: var(--api-console-main-content-margin-left, 24px);
      margin-right: var(--api-console-main-content-margin-right, 24px);
      margin-top: var(--api-console-main-content-margin-top, 0px);
    }

    .drawer-content-wrapper {
      max-height: calc(100% - 64px);
      display: flex;
      flex-direction: column;
      background-color: var(--api-console-menu-background-color, inherit);
      height: 100%;
    }

    api-navigation {
      flex: 1 1 auto;
    }

    /* :host(:not([app])) app-drawer-layout {
      min-height: inherit;
      overflow: hidden;
    } */

    /* :host(:not([app])) app-header {
      position: absolute;
      right: 0 !important;
      left: 0 !important;
    } */

    api-request-panel,
    api-documentation {
      max-width: var(--api-console-main-max-width, 1600px);
    }

    .api-docs {
      display: flex;
      flex-direction: row;
      overflow: auto;
      margin-top: 12px;
    }

    .api-docs api-documentation {
      flex: 1;
    }

    .api-docs .inline-request {
      max-width: 600px;
      margin-left: 12px;
      background-color: var(--apic-tryint-wide-background-color, transparent);
      border-left-width: 1px;
      border-left-color: var(--apic-tryint-wide-border-color, #e5e5e5);
      border-left-style: solid;
      padding: 0 12px;
      box-sizing: border-box;
      flex: 1;
    }

    .method-title-area {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .method-title-area,
    .extension-banner {
      max-width: var(--api-console-main-max-width, 1600px);
    }

    .method-title {
      flex: 1;
      font-size: var(--arc-font-headline-font-size);
      font-weight: var(--arc-font-headline-font-weight);
      letter-spacing: var(--arc-font-headline-letter-spacing);
      line-height: var(--arc-font-headline-line-height);
      text-transform: capitalize;
    }

    :host([narrow]) .method-title-area {
      margin-bottom: 24px;
      margin-top: 12px;
    }

    :host([narrow]) .method-title {
      font-size: 20px;
      margin: 0;
    }

    .store-link {}`;
  }

  _mediaQueriesTemplate() {
    if (!this.app) {
      return;
    }
    return html`
    <iron-media-query
      query="(max-width: 740px)"
      @query-matches-changed="${this._narrowHandler}"></iron-media-query>
    <iron-media-query
      query="(min-width: 1500px)"
      @query-matches-changed="${this._wideLayoutHandler}"></iron-media-query>`;
  }

  _drawerToolbarTemplate() {
    if (this.noToolbars) {
      return '';
    }
    return html`<app-toolbar>
      <div>API console</div>
    </app-toolbar>`;
  }

  _navigationTemplate() {
    const { amf, noAttribution } = this;
    return html`<div class="drawer-content-wrapper">
      <api-navigation
        .amf="${amf}"
        summary
        endpointsopened
        @api-navigation-selection-changed="${this._apiNavigationOcurred}"></api-navigation>
      ${noAttribution ? '' : attributionTpl}
    </div>`;
  }

  _contentToolbarTemplate() {
    if (this.noToolbars) {
      return '';
    }
    const {
      manualNavigation,
      apiTitle
    } = this;
    return html`<app-header
      slot="header"
      reveals
      effects="waterfall">
      <app-toolbar>
        <anypoint-icon-button drawer-toggle ?hidden="${manualNavigation}">
          <iron-icon icon="arc:menu"></iron-icon>
        </anypoint-icon-button>
        <div main-title>${apiTitle}</div>
        <slot name="toolbar"></slot>
      </app-toolbar>
    </app-header>`;
  }

  _getContentTemplate() {
    switch (this.page) {
      case 'docs': return this._getDocsTemplate();
      case 'request': return this._getRequestTemplate();
      default: return '';
    }
  }

  _bannerMessage() {
    return html`
    <div class="extension-banner" ?active="${this._extensionBannerActive}">
      <p>
        For better experience install API console extension.
        Get it from <a target="_blank"
          class="store-link"
          href="https://chrome.google.com/webstore/detail/olkpohecoakpkpinafnpppponcfojioa">
          Chrome Web Store
        </a>
      </p>
      <anypoint-icon-button
        aria-label="Activate to close the message"
        @click="${this.dismissExtensionBanner}">
        <iron-icon icon="arc:close"></iron-icon>
      </anypoint-icon-button>
    </div>`;
  }

  _getRequestTemplate() {
    const {
      methodName,
      legacy
    } = this;
    return html`
    <div class="method-title-area">
      <h1 class="method-title">${methodName}</h1>
      <div class="method-close-action">
        <anypoint-button
          class="action-button"
          ?legacy="${legacy}"
          @click="${this.closeTryIt}"
          emphasis="medium">Back to docs</anypoint-button>
      </div>
    </div>
    ${this._bannerMessage()}
    ${this._requestPanelTemplate()}
    `;
  }

  _requestPanelTemplate() {
    const {
      legacy,
      outlined,
      amf,
      selectedShape,
      narrow,
      noUrlEditor,
      scrollTarget,
      allowCustom,
      allowDisableParams,
      allowHideOptional,
      redirectUri,
      eventsTarget,
      baseUri,
      noDocs
    } = this;
    return html`<api-request-panel
      .amf="${amf}"
      .selected="${selectedShape}"
      ?narrow="${narrow}"
      ?outlined="${outlined}"
      ?legacy="${legacy}"
      .noUrlEditor="${noUrlEditor}"
      .redirectUri="${redirectUri}"
      .scrollTarget="${scrollTarget}"
      .allowCustom="${allowCustom}"
      .allowDisableParams="${allowDisableParams}"
      .allowHideOptional="${allowHideOptional}"
      .baseUri="${baseUri}"
      .noDocs="${noDocs}"
      .eventsTarget="${eventsTarget}"></api-request-panel>`;
  }

  _getDocsTemplate() {
    const {
      inlineMethods,
      legacy,
      outlined,
      _noTryItValue,
      amf,
      selectedShape,
      selectedShapeType,
      narrow,
      scrollTarget,
      redirectUri,
      baseUri,
      _renderInlineTyit
    } = this;
    return html`<section class="api-docs">
      <api-documentation
        .amf="${amf}"
        .selected="${selectedShape}"
        .selectedType="${selectedShapeType}"
        ?narrow="${narrow}"
        ?legacy="${legacy}"
        ?outlined="${outlined}"
        .inlineMethods="${inlineMethods}"
        .noTryIt="${_noTryItValue}"
        .baseUri="${baseUri}"
        .redirectUri="${redirectUri}"
        .scrollTarget="${scrollTarget}"
        @api-navigation-selection-changed="${this._apiNavigationOcurred}"
        @tryit-requested="${this._tryitHandler}"></api-documentation>
      ${_renderInlineTyit ? html`<div class="inline-request">
        ${this._bannerMessage()}
        ${this._requestPanelTemplate()}
      </div>` : ''}
    </section>`;
  }

  render() {
    const {
      responsiveWidth,
      _narrowNavForced,
      layoutNarrow,
      drawerAlign,
      navigationOpened,
      aware
    } = this;
    return html`
    ${aware ? html`<raml-aware .scope="${aware}" @api-changed="${this._apiChanged}"></raml-aware>` : ''}
    ${this._mediaQueriesTemplate()}
    <app-drawer-layout
      .responsiveWidth="${responsiveWidth}"
      ?force-narrow="${_narrowNavForced}"
      ?narrow="${layoutNarrow}"
      fullbleed>
      <app-drawer slot="drawer" .align="${drawerAlign}" .opened="${navigationOpened}">
        ${this._drawerToolbarTemplate()}
        ${this._navigationTemplate()}
      </app-drawer>
      <app-header-layout has-scrolling-region>
        ${this._contentToolbarTemplate()}
        <div class="main-content">
          <slot name="content"></slot>
          ${this._getContentTemplate()}
        </div>
      </app-header-layout>
    </app-drawer-layout>
    <paper-toast class="error-toast" id="apiLoadErrorToast"></paper-toast>
    <api-console-ext-comm @has-extension-changed="${this._hasExtensionHandler}"></api-console-ext-comm>
    <!--
    The components below are optional dependencies. They will not be used until
    sources of the components are included into AC bundle.
    This would help build the console and only add a dependency at the build time
    without statically include the dependency.

    TBD:
    xhr-simple-request component placed here will prohibit application from
    using api-request custom event. If the application uses both this element
    (by adding it's import file to the build / page) this element would be the
    first one to handle the event and run the request. Any other listener
    attached to the console, body or window is called after this one.
    -->
    <xhr-simple-request
      .appendHeaders="${this.appendHeaders}"
      .proxy="${this.proxy}"
      .proxyEncodeUrl="${this.proxyEncodeUrl}"></xhr-simple-request>
    <oauth1-authorization></oauth1-authorization>
    <oauth2-authorization></oauth2-authorization>`;
  }

  static get properties() {
    return {
      /**
       * You can use `raml-aware` component to pass AMF data to the console.
       * Raml aware uses monostate pattern to pass the data to any other
       * instance of the same component and receives updates from them.
       *
       * When using `<raml-aware>` set it's `scope` property to some name
       * and this property to the same name. Once you update `raml` property
       * on the aware it updates the model in the console.
       */
      aware: { type: String },
      /**
       * It is current selection from the navigation represented
       * as an `@id` property of the AMD json/ld model.
       *
       * This property is updated internally when the user performs a navigation.
       * Change this property (with `selectedShapeType` property if needed)
       * to force the console to render specific view.
       *
       * ## example
       * ```
       * file://demo/models/api-name/api.raml#/web-api/end-points/%2Ftest-endpoint
       * ```
       */
      selectedShape: { type: String },
      /**
       * One of recognizable bby the console types of currently rendered
       * documentation. It can be one of:
       *
       * - summary
       * - documentation
       * - type
       * - security
       * - endpoint
       * - method
       *
       * Use it with combination of setting `selectedShape` property to control
       * the view.
       */
      selectedShapeType: { type: String },
      /**
       * Computed value, true if current selection represent a method
       */
      _isMethod: { type: Boolean },
      /**
       * Location of the AMF json/ld model. It can be an endpoint that
       * produces AMF model or a file that contains generated model.
       *
       * When changed it download's data from the location
       * and assigns value to the `amfModel` property.
       *
       * ## Example
       * ```html
       * <api-console model-location="https://amf-parser/domain.com"></api-console>
       * ```
       */
      modelLocation: { type: String },
      /**
       * Currently rendered page. It can be either `docs` or `request`.
       */
      page: { type: String },
      /**
       * The API console works with API console extension that proxies
       * request through Chrome extension's sandbox and eliminates CORS.
       *
       * When this is set it enables this feature and renders installation banner
       * when currrent browser profile does not have extension installed.
       */
      allowExtensionBanner: { type: Boolean },
      /**
       * When set the extension banner is rendered.
       */
      _extensionBannerActive: { type: Boolean },

      _hasApicCorsExtension: { type: Boolean },
      /**
       * Forces the console to send headers defined in this string overriding
       * any used defined header.
       * It can be useful if the console has to send any headers string
       * to a server without user knowing about it.
       * The headers should be valid HTTP headers string.
       */
      appendHeaders: { type: String },
      /**
       * If true it forces the console to render narrow layout.
       * This hides left hand side navigation and some fonts are smaller
       * (like titles).
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * If set every request made from the console will be proxied by the service provided in this
       * value.
       * It will prefix entered URL with the proxy value. so the call to
       * `http://domain.com/path/?query=some+value` will become
       * `https://proxy.com/path/http://domain.com/path/?query=some+value`
       *
       * If the proxy require a to pass the URL as a query parameter define value as follows:
       * `https://proxy.com/path/?url=`. In this case be sure to set `proxy-encode-url`
       * attribute.
       */
      proxy: { type: String },
      /**
       * If `proxy` is set, it will URL encode the request URL before appending it to the proxy URL.
       * `http://domain.com/path/?query=some+value` will become
       * `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`
       */
      proxyEncodeUrl: { type: Boolean },
      /**
       * If set then the API console hide the "try it" button from the
       * method documentation view. The request and response panels still will
       * be available, but to enter this section you'll have to do it
       * programatically.
       */
      noTryIt: { type: Boolean },
      /**
       * If set, the open navigation button will be always hidden.
       * The left hand side navigation will be hidden until `navigationOpened`
       * property is set.
       * The navigation will cover full screen, hiding the content.
       * This works best with `narrow` layout.
       */
      manualNavigation: { type: Boolean },
      /**
       * True when navigation is opened.
       */
      navigationOpened: { type: Boolean },
      /**
       * A width when the navigation drawer is automatically toggled to narrow
       * view.
       * By default it is `640px`.
       *
       * To control width of the navigation drawer, set `--app-drawer-width`
       * CSS variable to requested size.
       */
      responsiveWidth: { type: String },
      /**
       * Computed value, true when the navigation drawer should be hidden
       * event with wide layout.
       */
      _narrowNavForced: { type: Boolean },
      /**
       * Location of the `bower_components` folder.
       * It should be a path from server's root path including bower_components.
       */
      bowerLocation: { type: String },
      /**
       * OAuth2 redirect URI.
       * By default the app uses `bowerLocation` to compute redirect location
       * URI. If you set this value if has to work with authorization
       * component meaning it has to pass auth data to the opener window or
       * top frame.
       * See documentation for `advanced-rest-client/oauth-authorization`
       * for API details.
       */
      redirectUri: { type: String },
      /**
       * Hides the URL editor from the view.
       * Note that the editor is still in the DOM. This property just hiddes
       * it.
       */
      noUrlEditor: { type: Boolean },
      /**
       * A base URI for the API. To be set if RAML spec is missing `baseUri`
       * declaration and this produces invalid URL input. This information
       * is passed to the URL editor that prefixes the URL with `baseUri` value
       * if passed URL is a relative URL.
       */
      baseUri: { type: String },
      /**
       * Removes the "Powered by Mulesoft" attribution from the main navigation.
       * The use of this feature must be in accordance with all licensing
       * and copyright protections required by the use of this software
       */
      noAttribution: { type: Boolean },
      /**
       * Computed title of the API
       */
      apiTitle: { type: String },
      /**
       * True when the main layout element renders in narrow view.
       * This changes when media query breakpoint has been reached or
       * when narrow property is set.
       */
      layoutNarrow: { type: Boolean, reflect: true },
      /**
       * An alignment of the layout drawer.
       * Possible values are:
       * - start
       * - end
       *
       * Default to "start".
       */
      drawerAlign: { type: String },
      /**
       * If set the top toolbars are not rendered.
       */
      noToolbars: { type: Boolean },
      /**
       * By default API console renders itself as an embeddable
       * web component that has changed behavior of main layout elements
       * (menu drawer and main view). When this option is set it renders
       * layout elements in it's static positions instead relative.
       *
       * Note, this option is experimental and mey be removed.
       */
      app: { type: Boolean, reflect: true },
      /**
       * When true it places try it panel next to the documentation panel.
       * It is set automatically via media queries
       */
      wideLayout: { type: Boolean },
      /**
       * If set then it renders methods documentation inline with
       * the endpoint documentation.
       * When it's not set (or value is `false`, default) then it renders
       * just a list of methods with links in the documentation panel
       */
      inlineMethods: { type: Boolean, value: false },

      _renderInlineTyit: { type: Boolean },

      _noTryItValue: { type: Boolean },

      /**
       * Computed value from the method model, name of the method.
       * It is either a `displayName` or HTTP method name
       */
      methodName: { type: String },
      /**
       * Scroll target used to observe `scroll` events.
       * Set it to a parent element that is a scroll region (has overflow set)
       * so the app can handle scrolling properly.
       */
      scrollTarget: { type: Object },
      /**
       * Option passed to the try it panel.
       * When set it allows to disable parameters in an editor (headers,
       * query parameters). Disabled parameter won't be used with a test call
       * but won't be removed from the UI.
       */
      allowDisableParams: { type: Boolean },
      /**
       * Option passed to the try it panel.
       * When set, editors renders "add custom" button that allows to define
       * custom parameters next to API spec defined.
       */
      allowCustom: { type: Boolean },
      /**
       * Option passed to the try it panel.
       * Enables auto hiding of optional properties (like query parameters
       * or headers) and renders a checkbox to render optional items in the
       * editor view.
       */
       allowHideOptional: { type: Boolean },
       /**
        * Prohibits rendering documentation (the icon and the
        * description) in request editors.
        */
       noDocs: { type: Boolean },
       /**
        * A HTML element used to listen for events on.
        * If you use one than more API console elements on single page
        * at the same time wrap the console is a HTML element (eg div) and
        * set this value to the container so the request panel only listen
        * to events dispatched inside the container. Otherwise events dispatched
        * by the request panel will be handled by other instances of the console.
        * @type {Element}
        */
       eventsTarget: { type: Object }
    };
  }

  get selectedShape() {
    return this._selectedShape;
  }

  set selectedShape(value) {
    const old = this._selectedShape;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selectedShape = value;
    this.requestUpdate('selectedShape', old);
    this.methodName = this._computeMethodName(value, this.webApi);
  }

  get selectedShapeType() {
    return this._selectedShapeType;
  }

  set selectedShapeType(value) {
    const old = this._selectedShapeType;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selectedShapeType = value;
    this._isMethod = value === 'method';
    this._updateRenderInlineTyit();
    this.requestUpdate('selectedShapeType', old);
  }

  get modelLocation() {
    return this._modelLocation;
  }

  set modelLocation(value) {
    const old = this._modelLocation;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._modelLocation = value;
    this._modelLocationChanged(value);
  }

  get allowExtensionBanner() {
    return this._allowExtensionBanner;
  }

  set allowExtensionBanner(value) {
    const old = this._allowExtensionBanner;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._allowExtensionBanner = value;
    this._allowExtensionBannerChanged(value);
  }

  get inlineMethods() {
    return this._inlineMethods;
  }

  set inlineMethods(value) {
    const old = this._inlineMethods;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._inlineMethods = value;
    this._updateRenderInlineTyit();
  }

  get wideLayout() {
    return this._wideLayout;
  }

  set wideLayout(value) {
    const old = this._wideLayout;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._wideLayout = value;
    this._updateRenderInlineTyit();
  }

  get app() {
    return this._app;
  }

  set app(value) {
    const old = this._app;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._app = value;
    this._updateRenderInlineTyit();
  }

  get narrow() {
    return this._narrow;
  }

  set narrow(value) {
    const old = this._narrow;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._narrow = value;
    this._narrowNavForced = this._computeNarrowNavForced(this.manualNavigation, value);
  }

  get manualNavigation() {
    return this._manualNavigation;
  }

  set manualNavigation(value) {
    const old = this._manualNavigation;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._manualNavigation = value;
    this._narrowNavForced = this._computeNarrowNavForced(value, this.narrow);
  }

  constructor() {
    super();
    this._tryitHandler = this._tryitHandler.bind(this);

    this.page = 'docs';
    this.drawerAlign = 'left';
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.addEventListener('tryit-requested', this._tryitHandler);
    this._notifyApicExtension();
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('tryit-requested', this._tryitHandler);
  }

  firstUpdated() {
    this._initExtensionBanner();
  }

  _updateRenderInlineTyit() {
    const value = this._computeRenderInlineTryIt(this.wideLayout, this._isMethod, this.app, this.inlineMethods);
    this._renderInlineTyit = value;
    this._noTryItValue = this._computeNoTryItValue(this.noTryIt, value);
  }

  __amfChanged() {
    if (this.__amfProcessingDebouncer) {
      return;
    }
    this.__amfProcessingDebouncer = true;
    setTimeout(() => this._processModelChange());
  }

  _processModelChange() {
    this.__amfProcessingDebouncer = false;

    let { amf } = this;
    if (!amf) {
      return;
    }
    if (amf instanceof Array) {
      amf = amf[0];
    }
    const webApi = this.webApi = this._computeWebApi(amf);
    this.apiTitle = this._computeApiTitle(webApi);
    this.methodName = this._computeMethodName(this.selectedShape, webApi);
  }
  /**
   * Loads model from a file described in `modelLocation` property.
   * This function is called automatically when the value of the property
   * change.
   *
   * @param {String} url Model location
   */
  _modelLocationChanged(url) {
    if (!url) {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('error', (error) => this._apiLoadErrorHandler(error));
    xhr.addEventListener('loadend', () => this._apiLoadEndHandler(xhr));
    xhr.open('GET', url, true);
    xhr.send();
  }
  /**
   * Called by `_modelLocationChanged` when model data are read from remote location.
   * @param {XMLHttpRequest} xhr
   */
  _apiLoadEndHandler(xhr) {
    let data;
    try {
      data = JSON.parse(xhr.response);
    } catch (e) {
      this._apiLoadErrorHandler(e);
      return;
    }
    this.amf = data;
  }
  /**
   * Called by `_modelLocationChanged` when error occurred when getting API data.
   * @param {Error} error
   */
  _apiLoadErrorHandler(error) {
    const message = 'Unable to load API model data. ' + (error.message ? error.message : '');
    const toast = this.shadowRoot.querySelector('#apiLoadErrorToast');
    toast.text = message;
    toast.opened = true;
  }
  /**
   * Handler for the `tryit-requested` event. Sets current screen to
   * `request`.
   */
  _tryitHandler() {
    this.page = 'request';
  }
  /**
   * Resets current selection to "summary" page
   */
  resetSelection() {
    if (this.page !== 'docs') {
      this.page = 'docs';
    }
    this.selectedShapeType = 'summary';
    this.selectedShape = 'summary';
  }
  /**
   * Computes value of `apiTitle` property.
   *
   * @param {Object} shape Shape of AMF model.
   * @return {String|undefined} Description if defined.
   */
  _computeApiTitle(shape) {
    return this._getValue(shape, this.ns.schema.schemaName);
  }
  /**
   * Renders the extension banner if is Chrome and extension is not detected.
   */
  _initExtensionBanner() {
    if (!isChrome || !this.allowExtensionBanner) {
      return;
    }
    setTimeout(() => {
      if (this.allowExtensionBanner && !this._hasApicCorsExtension) {
        this._extensionBannerActive = true;
      }
    });
  }
  /**
   * Dismisses Chrome extension banner.
   */
  dismissExtensionBanner() {
    this._extensionBannerActive = false;
  }
  /**
   * Handler for the navigation event dispatched by the `api-navigation`
   * component.
   *
   * @param {CustomEvent} e
   */
  _apiNavigationOcurred(e) {
    const { selected, type, passive } = e.detail;
    const isPassive = passive === true;
    if (!isPassive && this.page !== 'docs') {
      this.closeTryIt();
    }
    this.selectedShape = selected;
    this.selectedShapeType = type;
  }
  /**
   * Closes "try it" panel and restores docs view.
   */
  closeTryIt() {
    this.page = 'docs';
  }
  /**
   * Computes value of `_narrowNavForced` property.
   *
   * @param {Boolean} manualNavigation
   * @param {Boolean} narrow
   * @return {Boolean}
   */
  _computeNarrowNavForced(manualNavigation, narrow) {
    return !!(manualNavigation || narrow);
  }
  /**
   * When the console is initialized when being hidden
   * it may not layout properly. The app drawer layout component
   * positions elements statically so if the console is hidden it cannot do
   * this properly. In this case call `resetLayout()` function
   * when getting the console back from the hidden state.
   */
  resetLayout() {
    this.shadowRoot.querySelector('app-drawer-layout').notifyResize();
  }
  /**
   * Dispatches `api-console-ready` event that is used by APIC extension
   * so it can initialize itself when handled
   */
  _notifyApicExtension() {
    this.dispatchEvent(new CustomEvent('api-console-ready', {
      bubbles: true,
      composed: true
    }));
  }
  /**
   * Controls behavior if the extension banner.
   * @param {Boolean} value Current value of `allowExtensionBanner` property
   */
  _allowExtensionBannerChanged(value) {
    if (!value && this._extensionBannerActive) {
      this._extensionBannerActive = false;
    }
  }
  _hasCorsExtensionChanged(value) {
    if (value && this._extensionBannerActive) {
      this._extensionBannerActive = false;
    }
  }
  /**
   * Computes value for `_renderInlineTyit` property.
   * @param {Boolean} wideLayout
   * @param {Boolean} isMethod
   * @param {Boolean} app
   * @param {Boolean} inlineMethods
   * @return {Boolean} True if is wideLayout, it is a method, it is the app
   * and when inlineMethods is not set.
   */
  _computeRenderInlineTryIt(wideLayout, isMethod, app, inlineMethods) {
    if (!wideLayout || !app || !isMethod ||inlineMethods) {
      return false;
    }
    return wideLayout;
  }

  _computeNoTryItValue(noTryIt, renderInlineTyit) {
    if (renderInlineTyit) {
      return true;
    }
    return noTryIt;
  }
  /**
   * Computes method name for not-wide view, where the request panel
   * has close button.
   * @param {String} selected Curerently selected AMF shape (@id).
   * @param {Object} webApi Computed AMF WebAPI model.
   * @return {String|Undefined} Name of current method (verb) as RAML's
   * `displayName` property or name of the HTTP method.
   */
  _computeMethodName(selected, webApi) {
    if (!selected || !webApi) {
      return;
    }
    let method;
    try {
      method = this._computeMethodModel(webApi, selected);
    } catch (_) {
      return;
    }
    if (!method) {
      return;
    }
    let name = this._getValue(method, this.ns.schema.schemaName);
    if (!name) {
      name = this._getValue(method, this.ns.w3.hydra.core + 'method');
    }
    return name;
  }

  _narrowHandler(e) {
    this.narrow = e.detail.value;
  }

  _wideLayoutHandler(e) {
    this.wideLayout = e.detail.value;
  }

  _apiChanged(e) {
    this.amf = e.detail.value;
  }

  // _selectedHandler(e) {
  //   this.selectedShape = e.detail.value;
  // }
  //
  // _selectedTypeHandler(e) {
  //   this.selectedShapeType = e.detail.value;
  // }

  _hasExtensionHandler(e) {
    this._hasApicCorsExtension = e.detail.value;
    this._hasCorsExtensionChanged(e.detail.value);
  }
}
