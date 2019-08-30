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
      position: relative;
      overflow: hidden;
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
      position: relative;
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

    .nav-drawer {
      width: var(--app-drawer-width, 256px);
      display: block;
      left: 0;
      top: 0;
      bottom: 0;
      background-color: #fff;
      transform: translateX(-100%);
      transform-origin: top right;
      transition: transform 0.3s cubic-bezier(0.74, 0.03, 0.3, 0.97);
      position: absolute;
    }

    :host([navigationopened]) .nav-drawer {
      transform: translateX(0);
      box-shadow: var(--anypoiont-dropdown-shaddow);
    }

    .nav-scrim {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      transition-property: opacity;
      -webkit-transform: translateZ(0);
      transform:  translateZ(0);

      opacity: 0;
      background: var(--app-drawer-scrim-background, rgba(0, 0, 0, 0.5));
    }

    :host([navigationopened]) .nav-scrim {
      opacity: 1;
    }
    `;
  }

  _getContentTemplate() {
    switch (this.page) {
      case 'docs': return this._getDocsTemplate();
      case 'request': return this._getRequestTemplate();
      default: return '';
    }
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

  _navigationDrawerTemplate() {
    return html`
    ${this.navigationOpened ? html`<div class="nav-scrim"></div>` : ''}
    <div class="nav-drawer">
    ${this._navigationTemplate()}
    </div>
    `;
  }

  _mainContentTemplate() {
    return html`
    <div class="main-content">
      ${this._getContentTemplate()}
    </div>
    ${this._navigationDrawerTemplate()}`;
  }
  /**
   * The components below are optional dependencies. They will not be used until
   * sources of the components are included into AC bundle.
   * This would help build the console and only add a dependency at the build time
   * without statically include the dependency.
   *
   * TBD:
   * xhr-simple-request component placed here will prohibit application from
   * using api-request custom event. If the application uses both this element
   * (by adding it's import file to the build / page) this element would be the
   * first one to handle the event and run the request. Any other listener
   * attached to the console, body or window is called after this one.
   *
   * @return {TemplateResult}
   */
  _helpersTemplate() {
    return html`<paper-toast class="error-toast" id="apiLoadErrorToast"></paper-toast>
    <api-console-ext-comm @has-extension-changed="${this._hasExtensionHandler}"></api-console-ext-comm>
    <xhr-simple-request
      .appendHeaders="${this.appendHeaders}"
      .proxy="${this.proxy}"
      .proxyEncodeUrl="${this.proxyEncodeUrl}"></xhr-simple-request>
    <oauth1-authorization></oauth1-authorization>
    <oauth2-authorization></oauth2-authorization>`;
  }

  render() {
    const { aware } = this;
    return html`
    ${aware ? html`<raml-aware .scope="${aware}" @api-changed="${this._apiChanged}"></raml-aware>` : ''}
    ${this._mainContentTemplate()}
    ${this._helpersTemplate()}
    `;
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
       * True when navigation is opened.
       */
      navigationOpened: { type: Boolean, reflect: true },
      /**
       * OAuth2 redirect URI.
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
       * If set then it renders methods documentation inline with
       * the endpoint documentation.
       * When it's not set (or value is `false`, default) then it renders
       * just a list of methods with links in the documentation panel
       */
      inlineMethods: { type: Boolean, value: false },
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
       eventsTarget: { type: Object },
       /**
        * A default Client ID to set on the OAuth 2 authorization panel
        */
       oauth2clientId: { type: String },
       /**
        * A default Client Secret to set on the OAuth 2 authorization panel
        */
       oauth2clientSecret: { type: String }
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

  get oauth2clientId() {
    return this._oauth2clientId;
  }

  set oauth2clientId(value) {
    const old = this._oauth2clientId;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._oauth2clientId = value;
    // No need to pass the valu via binding system because the auth method
    // uses session storage to restore user values between the screens
    sessionStorage.setItem('auth.methods.latest.client_id', value);
  }

  get oauth2clientSecret() {
    return this._oauth2clientSecret;
  }

  set oauth2clientSecret(value) {
    const old = this._oauth2clientSecret;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._oauth2clientSecret = value;
    sessionStorage.setItem('auth.methods.latest.client_secret', value);
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
   * Dispatches `api-console-ready` event that is used by APIC extension
   * so it can initialize itself when handled
   */
  _notifyApicExtension() {
    this.dispatchEvent(new CustomEvent('api-console-ready', {
      bubbles: true,
      composed: true
    }));
  }

  _hasCorsExtensionChanged(value) {
    if (value && this._extensionBannerActive) {
      this._extensionBannerActive = false;
    }
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

  _apiChanged(e) {
    this.amf = e.detail.value;
  }

  _hasExtensionHandler(e) {
    this._hasApicCorsExtension = e.detail.value;
    this._hasCorsExtensionChanged(e.detail.value);
  }
}
