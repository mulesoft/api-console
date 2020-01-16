import { ApiConsole } from './ApiConsole.js';
import { html, css } from 'lit-element';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { menu } from '@advanced-rest-client/arc-icons/ArcIcons.js';

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
        overflow: scroll;
      }

      app-drawer-layout:not([narrow]) [drawer-toggle] {
        display: none;
      }

      app-toolbar {
        background-color: var(--api-console-toolbar-background-color, #283640); /* #2196f3 */
        color: var(--api-console-toolbar-color, #fff);
      }

      .nav-content {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .main-content {
        margin-left: var(--api-console-main-content-margin-left, 24px);
        margin-right: var(--api-console-main-content-margin-right, 24px);
        margin-top: var(--api-console-main-content-margin-top, 0px);
        position: relative;
        /* Overrides values from the element */
        overflow: initial;
        height: initial;
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
      /**
       * Forces the console to send headers defined in this string overriding
       * any used defined header.
       * It can be useful if the console has to send any headers string
       * to a server without user knowing about it.
       * The headers should be valid HTTP headers string.
       */
      appendHeaders: { type: String },
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
    this.responsiveWidth = '900px';
    this.allowHideOptional = true;
  }

  _updateRenderInlineTyit() {
    const value = this._computeRenderInlineTryIt(this.wideLayout, this._isMethod, this.inlineMethods);
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
   * Computes value for `_renderInlineTyit` property.
   * @param {Boolean} wideLayout
   * @param {Boolean} isMethod
   * @param {Boolean} inlineMethods
   * @return {Boolean} True if is wideLayout, it is a method, or when inlineMethods
   * is not set.
   */
  _computeRenderInlineTryIt(wideLayout, isMethod, inlineMethods) {
    if (!wideLayout || !isMethod ||inlineMethods) {
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
      apiTitle,
      compatibility
    } = this;
    return html`<app-header
      fixed
      slot="header">
      <app-toolbar>
        <anypoint-icon-button
          drawer-toggle
          ?hidden="${manualNavigation}"
          ?compatibility="${compatibility}"
        >
          <span drawer-toggle class="icon">${menu}</span>
        </anypoint-icon-button>
        <div main-title>${apiTitle}</div>
        <slot name="toolbar"></slot>
      </app-toolbar>
    </app-header>`;
  }

  _apiDocumentationTemplate() {
    return html`<section class="api-docs">
    ${super._apiDocumentationTemplate()}
    ${this._renderInlineTyit ? html`<div class="inline-request">
      ${this._bannerMessage()}
      ${this._requestPanelTemplate()}
    </div>` : ''}
    </section>`;
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
      <app-header-layout>
        ${this._contentToolbarTemplate()}
        <div class="main-content">
          <slot name="content"></slot>
          ${this._getPageTemplate()}
        </div>
      </app-header-layout>
    </app-drawer-layout>`;
  }

  /**
   * The components below are optional dependencies. They will not be used until
   * sources of the components are included into AC bundle.
   * This would help build the console and only add a dependency at the build time
   * without statically include the dependency.
   *
   * @return {TemplateResult}
   */
  _helpersTemplate() {
    return html`
    ${super._helpersTemplate()}
    <xhr-simple-request
      .appendHeaders="${this.appendHeaders}"
      .proxy="${this.proxy}"
      .proxyEncodeUrl="${this.proxyEncodeUrl}"></xhr-simple-request>
    <oauth1-authorization></oauth1-authorization>
    <oauth2-authorization></oauth2-authorization>`;
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
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
    const url = `${window.location.pathname}#docs/${type}/${selected}`;
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
    return this._getValue(shape, this.ns.aml.vocabularies.core.name);
  }

  _narrowHandler(e) {
    this.narrow = e.detail.value;
  }

  _wideLayoutHandler(e) {
    this.wideLayout = e.detail.value;
  }
}
