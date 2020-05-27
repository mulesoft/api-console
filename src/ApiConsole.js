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
import { html, LitElement } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@api-components/raml-aware/raml-aware.js';
import '@api-components/api-navigation/api-navigation.js';
import '@api-components/api-documentation/api-documentation.js';
import '@api-components/api-request-panel/api-request-panel.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@api-components/api-console-ext-comm/api-console-ext-comm.js';
import attributionTpl from './attribution-template.js';
import { close } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import styles from './ApiConsoleStyles.js';

export const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('lit-element').CSSResult} CSSResult */

/**
 * he API Console
 *
 * API designed for humans.
 *
 * @demo demo/index.html
 */
export class ApiConsole extends AmfHelperMixin(LitElement) {
  /**
   * @type {CSSResult|CSSResult[]}
   */
  static get styles() {
    return styles;
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
       * If true it forces the console to render narrow layout.
       * This hides left hand side navigation and some fonts are smaller
       * (like titles).
       */
      narrow: { type: Boolean, reflect: true },
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
        */
       eventsTarget: { type: Object },
       /**
        * A default Client ID to set on the OAuth 2 authorization panel
        */
       oauth2clientId: { type: String },
       /**
        * A default Client Secret to set on the OAuth 2 authorization panel
        */
       oauth2clientSecret: { type: String },
       /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * This property is passed to the `api-navigation` component.
       *
       * When this value is set, the navigation component sorts the list
       * of endpoints based on the `path` value of the endpoint, keeping the order
       * of which endpoint was first in the list, relative to each other.
       *
       * **This is an experimental option and may dissapear without warning.**
       */
      rearrangeEndpoints: { type: Boolean },
      /**
       * Value of the selected server. This is passed into `api-documentation` and
       * `api-request-panel`
       */
      serverValue: { type: String },
      /**
       * Type of the selected server. This is passed into `api-documentation` and
       * `api-request-panel`
       */
      serverType: { type: String },
      /**
       * Optional property to set
       * If true, the server selector is not rendered in any component
       */
      noServerSelector: { type: Boolean },
      /**
       * Optional property to set
       * If true, forces the api-documentation to hide the server selector
       */
      _noDocumentationServerSelector: { type: Boolean },
      /**
       * Optional property to set
       * If true, the server selector custom base URI option is rendered
       */
      allowCustomBaseUri: { type: Boolean },

      _noTryItValue: { type: Boolean },
    };
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

  /**
   * This can be overriten by child classes to decide whether to render the server
   * selector or not.
   * @return {boolean} The final value of `noServerSelector`.
   */
  get _noServerSelector() {
    return !!this.noServerSelector;
  }

  /**
   * @return {Boolean} True when the request panel is being rendered
   */
  get _rendersRequestPanel() {
    return this.page === 'request';
  }

  constructor() {
    super();
    this._tryitHandler = this._tryitHandler.bind(this);
    this._handleServerChange = this._handleServerChange.bind(this);

    this.page = 'docs';
    this.drawerAlign = 'left';

    // the below is done for types only
    this.aware = null;
    this.compatibility = false;
    this.outlined = false;
    this.narrow = false;
    this.noUrlEditor = false;
    this.scrollTarget = undefined;
    this.allowCustom = false;
    this.allowDisableParams = false;
    this.allowHideOptional = false;
    this.redirectUri = undefined;
    this.eventsTarget = undefined;
    this.baseUri = undefined;
    this.noDocs = false;
    this.noServerSelector = false;
    this.allowCustomBaseUri = false;
    this.inlineMethods = false;
    this.noAttribution = false;
    this.rearrangeEndpoints = false;
    this.noTryIt = false;
    this._noTryItValue = false;
  }

  connectedCallback() {
    /* istanbul ignore else */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.addEventListener('tryit-requested', this._tryitHandler);
    this.addEventListener('apiserverchanged', this._handleServerChange);
    this._notifyApicExtension();
    // @ts-ignore
    if (window.ShadyCSS) {
      // @ts-ignore
      window.ShadyCSS.styleElement(this);
    }
  }

  disconnectedCallback() {
    /* istanbul ignore else */
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('tryit-requested', this._tryitHandler);
    this.removeEventListener('apiserverchanged', this._handleServerChange);
  }

  firstUpdated() {
    this._initExtensionBanner();
    this._setupNav();
  }

  /**
   * On Firefix the navigation hidding animation runs when the app is first rendered,
   * even if the navigation wasn't initially rendered. This to be called
   * after initial render has been made (DOM is constructed) to add the `animatable`
   * class on the navigation to enable animation effects.
   */
  _setupNav() {
    setTimeout(() => {
      const nav = this.shadowRoot.querySelector('.nav-drawer');
      if (nav) {
        nav.classList.add('animatable');
      }
    });
  }

  __amfChanged() {
    /* istanbul ignore if */
    if (this.__amfProcessingDebouncer) {
      return;
    }
    this.__amfProcessingDebouncer = true;
    setTimeout(() => this._processModelChange());
  }

  _processModelChange() {
    this.__amfProcessingDebouncer = false;

    let { amf } = this;
    /* istanbul ignore if */
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
    /* istanbul ignore next */
    xhr.addEventListener('error', () => this._apiLoadErrorHandler());
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
    this.dispatchEvent(new CustomEvent('model-load-success'));
  }

  /**
   * Called by `_modelLocationChanged` when error occurred when getting API data.
   * @param {Error|Object=} error
   */
  _apiLoadErrorHandler(error={}) {
    const message = `Unable to load API model data. ${error.message || ''}`;
    const toast = this.shadowRoot.querySelector('#apiLoadErrorToast');
    // @ts-ignore
    toast.text = message;
    // @ts-ignore
    toast.opened = true;
    this.dispatchEvent(new CustomEvent('model-load-error'));
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

  /**
   * Computes method name for not-wide view, where the request panel
   * has close button.
   * @param {String} selected Curerently selected AMF shape (@id).
   * @param {Object} webApi Computed AMF WebAPI model.
   * @return {String|undefined} Name of current method (verb) as RAML's
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
    let name = /** @type string */ (this._getValue(method, this.ns.aml.vocabularies.core.name));
    if (!name) {
      name = /** @type string */ (this._getValue(method, this.ns.aml.vocabularies.apiContract.method));
    }
    return name;
  }

  /**
   * Handler for the `api-changed` event on the RAML aware element.
   * Sets `amf` property to the detail value.
   * @param {CustomEvent} e
   */
  _apiChanged(e) {
    this.amf = e.detail.value;
  }

  /**
   * A handler for the `api-console-extension-installed` event dispatched by the
   * component that is responsible for communication with the browser extension
   * built for API Console to deal with the CORS issues.
   */
  _hasExtensionHandler() {
    this._hasApicCorsExtension = true;
    this._extensionBannerActive = false;
  }

  /**
   * Handler for the close drawer button click.
   */
  _closeDrawer() {
    this.navigationOpened = false;
    this.dispatchEvent(new CustomEvent('navigation-close'));
  }

  /**
   * Controls behavior if the extension banner.
   * @param {Boolean} value Current value of `allowExtensionBanner` property
   */
  _allowExtensionBannerChanged(value) {
    if (!value && this._extensionBannerActive) {
      this._extensionBannerActive = false;
    } else if (value && isChrome && !this._hasApicCorsExtension) {
      this._extensionBannerActive = true;
    }
  }

  /**
   * Handler for the `apiserverchanged` event dispatched from the components.
   * @param {CustomEvent} e
   */
  _handleServerChange(e) {
    const { value, type } = e.detail;
    this.serverType = type;
    this.serverValue = value;
  }

  render() {
    const { aware } = this;
    return html`
    ${aware ? html`<raml-aware .scope="${aware}" @api-changed="${this._apiChanged}"></raml-aware>` : ''}
    ${this._mainContentTemplate()}
    ${this._helpersTemplate()}
    `;
  }

  /**
   * @return {TemplateResult|string} A template for current page
   */
  _getPageTemplate() {
    switch (this.page) {
      case 'docs': return this._apiDocumentationTemplate();
      case 'request': return this._getRequestTemplate();
      default: return '';
    }
  }

  /**
   * @return {TemplateResult|string} A template the extension banner, if allowed.
   */
  _bannerMessage() {
    if (!this.allowExtensionBanner) {
      return '';
    }
    return html`
    <div class="extension-banner" ?active="${this._extensionBannerActive}">
      <p>
        For better experience install API console extension.
        Get it from <a target="_blank"
          class="store-link"
          href="https://chrome.google.com/webstore/detail/olkpohecoakpkpinafnpppponcfojioa"
        >
          Chrome Web Store
        </a>
      </p>
      <anypoint-icon-button
        aria-label="Activate to close the message"
        @click="${this.dismissExtensionBanner}"
      >
        <span class="icon">${close}</span>
      </anypoint-icon-button>
    </div>`;
  }

  /**
   * @return {TemplateResult} The template for the request panel section.
   */
  _getRequestTemplate() {
    const {
      methodName,
      compatibility
    } = this;
    return html`
    <div class="method-title-area">
      <h1 class="method-title">${methodName}</h1>
      <div class="method-close-action">
        <anypoint-button
          class="action-button"
          ?compatibility="${compatibility}"
          @click="${this.closeTryIt}"
          emphasis="medium">Back to docs</anypoint-button>
      </div>
    </div>
    ${this._bannerMessage()}
    ${this._requestPanelTemplate()}
    `;
  }

  /**
   * @return {TemplateResult} The template for the request panel element.
   */
  _requestPanelTemplate() {
    const {
      compatibility,
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
      noDocs,
      serverValue,
      serverType,
      noServerSelector,
      allowCustomBaseUri,
    } = this;
    return html`<api-request-panel
      .amf="${amf}"
      .selected="${selectedShape}"
      ?narrow="${narrow}"
      ?outlined="${outlined}"
      ?compatibility="${compatibility}"
      ?noServerSelector="${noServerSelector}"
      ?allowCustomBaseUri="${allowCustomBaseUri}"
      .noUrlEditor="${noUrlEditor}"
      .redirectUri="${redirectUri}"
      .scrollTarget="${scrollTarget}"
      .allowCustom="${allowCustom}"
      .allowDisableParams="${allowDisableParams}"
      .allowHideOptional="${allowHideOptional}"
      .baseUri="${baseUri}"
      .noDocs="${noDocs}"
      .serverValue="${serverValue}"
      .serverType="${serverType}"
      .eventsTarget="${eventsTarget}"
      >
        <slot name="custom-base-uri" slot="custom-base-uri"></slot>
      </api-request-panel>`;
  }

  /**
   * @return {TemplateResult} The template for the documentation element
   */
  _apiDocumentationTemplate() {
    const {
      inlineMethods,
      compatibility,
      outlined,
      _noTryItValue,
      amf,
      selectedShape,
      selectedShapeType,
      narrow,
      scrollTarget,
      redirectUri,
      baseUri,
      serverValue,
      serverType,
      _noServerSelector,
      allowCustomBaseUri,
    } = this;

    return html`<api-documentation
      .amf="${amf}"
      .selected="${selectedShape}"
      .selectedType="${selectedShapeType}"
      ?narrow="${narrow}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?noServerSelector="${_noServerSelector}"
      ?allowCustomBaseUri="${allowCustomBaseUri}"
      .inlineMethods="${inlineMethods}"
      .noTryIt="${_noTryItValue}"
      .baseUri="${baseUri}"
      .redirectUri="${redirectUri}"
      .scrollTarget="${scrollTarget}"
      .serverValue="${serverValue}"
      .serverType="${serverType}"
      @api-navigation-selection-changed="${this._apiNavigationOcurred}"
    >
      ${this._documentationBaseSlot()}
    </api-documentation>`;
  }

  /**
   * Renders the `<slot>` element in the `<api-documentation>` only when
   * ther request panel is not rendered. When it is rendered then it
   * is the target for slots.
   * @return {TemplateResult|string} Template for a slot to be used in the api documentation
   */
  _documentationBaseSlot() {
    if (this._rendersRequestPanel) {
      return '';
    }
    return html`<slot name="custom-base-uri" slot="custom-base-uri"></slot>`;
  }

  /**
   * @return {TemplateResult} The template for api navigation element
   */
  _navigationTemplate() {
    const { amf, noAttribution, rearrangeEndpoints } = this;
    return html`<div class="drawer-content-wrapper">
      <api-navigation
        .amf="${amf}"
        summary
        endpointsopened
        ?rearrangeendpoints="${rearrangeEndpoints}"
        @api-navigation-selection-changed="${this._apiNavigationOcurred}"></api-navigation>
      ${noAttribution ? '' : attributionTpl}
    </div>`;
  }

  /**
   * @return {TemplateResult} The template for the navigation drawer
   */
  _navigationDrawerTemplate() {
    return html`
    ${this.navigationOpened ? html`<div class="nav-scrim" @click="${this._closeDrawer}"></div>` : ''}
    <div class="nav-drawer">
    ${this._navigationTemplate()}
    </div>
    `;
  }

  /**
   * @return {TemplateResult} The template for the main content
   */
  _mainContentTemplate() {
    return html`
    <div class="main-content">
      <slot name="content"></slot>
      ${this._getPageTemplate()}
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
    <api-console-ext-comm @api-console-extension-installed="${this._hasExtensionHandler}"></api-console-ext-comm>
    `;
  }
}
