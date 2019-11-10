import { html, render } from 'lit-html';
import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '@polymer/paper-toast/paper-toast.js';
import '../../api-console.js';
import { menu } from '@advanced-rest-client/arc-icons/ArcIcons.js';

const SOURCE_KEY = 'api.source';

class ApicApplication {
  constructor() {
    this.initObservableProperties([
      'source',
      'amfModel',
      'loading',
      'navigationOpened',
    ]);
    const storedSource = localStorage.getItem(SOURCE_KEY);
    this.source = storedSource || `#%RAML 1.0
title: API body demo
version: v1
baseUri: http://api.domain.com/

mediaType: [application/json, application/xml]
protocols: [HTTP, HTTPS]

/path:
  description: |
    This is a description for an endpoint

  get:
    displayName: Test GET
    description: |
      This is a description of a method.
    responses:
      404:
        body:
          displayName: Not found response`;

    this._sourceChnaged = this._sourceChnaged.bind(this);
    this.toggleNavigation = this.toggleNavigation.bind(this);
    this._navigationClosed = this._navigationClosed.bind(this);
    this._updateModel();
  }

  /**
   * Creates setters and getters to properties defined in the passed list of properties.
   * Property setter will trigger render function.
   *
   * @param {Array<String>} props List of properties to initialize.
   */
  initObservableProperties(props) {
    props.forEach((item) => {
      Object.defineProperty(this, item, {
        get() {
          return this['_' + item];
        },
        set(newValue) {
          this._setObservableProperty(item, newValue);
        },
        enumerable: true,
        configurable: true
      });
    });
  }

  _setObservableProperty(prop, value) {
    const key = '_' + prop;
    if (this[key] === value) {
      return;
    }
    this[key] = value;
    this.render();
  }

  _sourceChnaged(e) {
    this.source = e.detail.value;
    this._updateModel();
  }

  _updateModel() {
    if (this.__updatingModelDebouncer) {
      clearTimeout(this.__updatingModelDebouncer);
    }
    this.__updatingModelDebouncer = setTimeout(() => {
      this.__updatingModelDebouncer = null;
      this._storeSource();
      this._processSources();
    }, 200);
  }

  _storeSource() {
    const { source } = this;
    localStorage.setItem(SOURCE_KEY, source);
  }

  async _processSources() {
    if (this.loading) {
      this.isDirty = true;
      return;
    }
    const url = '/api/parse/api';
    this.loading = true;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: this.source
      });
      const data = await response.json();
      if (response.status === 200) {
        this.amfModel = JSON.parse(data.data.api);
      } else {
        this.notifyError(data.message);
      }
    } catch (e) {
      this.notifyError(e.message);
    }
    this.loading = false;
    if (this.isDirty) {
      this.isDirty = false;
      this._updateModel();
    }
  }

  notifyError(message) {
    const node = document.createElement('paper-toast');
    document.body.appendChild(node);
    node.text = message;
    node.opened = true;
  }

  toggleNavigation() {
    this.navigationOpened = !this.navigationOpened;
  }

  _navigationClosed() {
    this.navigationOpened = false;
  }

  _demoTemplate() {
    const {
      source,
      amfModel,
      loading,
      navigationOpened,
    } = this;
    return html`
    <header>
      <h1>API Editor</h1>
    </header>
    <main>
      <div class="editor">
        <h2>Editor</h2>
        <code-mirror
          mode="yaml"
          lineNumbers
          id="codeSource"
          .value="${source}"
          @value-changed="${this._sourceChnaged}"
        ></code-mirror>
      </div>
      <div class="main-border"></div>
      <div class="docs">
        <div class="docs-header">
          <anypoint-icon-button
            aria-label="Activate to open API console menu"
            title="Open API console menu"
            @click="${this.toggleNavigation}"
          >
            <span class="icon">${menu}</span>
          </anypoint-icon-button>
          <h2>Documentation</h2>
        </div>
        ${loading ? html`<paper-progress indeterminate></paper-progress>` : ''}
        <api-console
          .amf="${amfModel}"
          selectedShape="summary"
          selectedShapeType="summary"
          redirecturi="https://auth.advancedrestclient.com/oauth-popup.html"
          ?navigationOpened="${navigationOpened}"
          @navigation-close="${this._navigationClosed}"
        >
        </api-console>
      </div>
    </main>

    <xhr-simple-request></xhr-simple-request>
    <oauth1-authorization></oauth1-authorization>
    <oauth2-authorization></oauth2-authorization>
    `;
  }

  render() {
    if (this._rendering) {
      return;
    }
    this._rendering = true;
    setTimeout(() => {
      this._rendering = false;
      this._render();
    });
  }

  _render() {
    const content = this._demoTemplate();
    render(content, document.querySelector('#demo'));
  }
}
const demo = new ApicApplication();
demo.render();
window.demo = demo;
