import { ApiConsole } from './ApiConsole.js';
import { html, css } from 'lit-element';
import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';

export class ApiConsoleApp extends ApiConsole {
  static get styles() {
    return [
      ApiConsole.styles,
      css`
      :host {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
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
      `
    ];
  }

  static get properties() {
    return {
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
       * By default API console renders itself as an embeddable
       * web component that has changed behavior of main layout elements
       * (menu drawer and main view). When this option is set it renders
       * layout elements in it's static positions instead relative.
       *
       * Note, this option is experimental and mey be removed.
       */
      app: { type: Boolean, reflect: true },
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
       * When true it places try it panel next to the documentation panel.
       * It is set automatically via media queries
       */
      wideLayout: { type: Boolean },

      _renderInlineTyit: { type: Boolean },

      _noTryItValue: { type: Boolean },
    };
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

  constructor() {
    super();
    this.responsiveWidth = '640px';
  }

  _updateRenderInlineTyit() {
    const value = this._computeRenderInlineTryIt(this.wideLayout, this._isMethod, this.app, this.inlineMethods);
    this._renderInlineTyit = value;
    this._noTryItValue = this._computeNoTryItValue(this.noTryIt, value);
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
   * Controls behavior if the extension banner.
   * @param {Boolean} value Current value of `allowExtensionBanner` property
   */
  _allowExtensionBannerChanged(value) {
    if (!value && this._extensionBannerActive) {
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
    return html`<app-toolbar>
      <div>API console</div>
    </app-toolbar>`;
  }

  _contentToolbarTemplate() {
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
          <iron-icon drawer-toggle icon="arc:menu"></iron-icon>
        </anypoint-icon-button>
        <div main-title>${apiTitle}</div>
        <slot name="toolbar"></slot>
      </app-toolbar>
    </app-header>`;
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

  _mainContentTemplate() {
    const {
      responsiveWidth,
      layoutNarrow,
      drawerAlign,
      navigationOpened
    } = this;
    return html`
    ${this._mediaQueriesTemplate()}
    <app-drawer-layout
      .responsiveWidth="${responsiveWidth}"
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
    </app-drawer-layout>`;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this._onRoute.bind(this));
  }

  _onRoute(e) {
    const { state } = e;
    if (!state) {
      return;
    }
    this.selectedShape = state.selected;
    this.selectedShapeType = state.type;
  }

  resetSelection() {
    super.resetSelection();
    history.pushState({
      page: 'docs',
      type: 'summary',
      selected: 'summary'
    }, '', '#');
  }

  _apiNavigationOcurred(e) {
    super._apiNavigationOcurred(e);
    const { selected, type } = e.detail;
    const url = `#docs/${type}/${selected}`;
    history.pushState({
      page: 'docs',
      type,
      selected
    }, '', url);
  }

  async _processModelChange(amf) {
    super._processModelChange(amf);
    this.apiTitle = this._computeApiTitle(this.webApi);
    await this.updateComplete;
    if (window.history.state) {
      this._onRoute(window.history);
    } else {
      this._selectionFromHash(location.hash);
    }
  }

  _selectionFromHash(hash) {
    if (!hash) {
      return;
    }
    const matches = hash.substr(1).match(/(docs|request)\/([^/]*)\/(.*)/);
    if (!matches) {
      return;
    }
    this.page = matches[1];
    this.selectedShape = matches[3];
    this.selectedShapeType = matches[2];
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

  _narrowHandler(e) {
    this.narrow = e.detail.value;
  }

  _wideLayoutHandler(e) {
    this.wideLayout = e.detail.value;
  }
}
