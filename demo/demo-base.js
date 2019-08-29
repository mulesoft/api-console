import { html, render } from 'lit-html';
import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@polymer/paper-toast/paper-toast.js';
import './helpers/loader-screen.js';
import './helpers/upload-api-screen.js';
const apiCache = new WeakMap();

export class DemoBase {
  constructor() {
    this.allowUpload = true;
    this.initObservableProperties([
      'hasUploader'
    ]);

    this._selectApi = this._selectApi.bind(this);
    this._processApiFile = this._processApiFile.bind(this);
  }

  get loading() {
    return this._loading;
  }

  set loading(value) {
    const old = this._loading;
    if (old === value) {
      return;
    }
    this._loading = value;
    this.loader.visible = value;
    if (value) {
      document.body.classList.add('loading-api');
    } else {
      document.body.classList.remove('loading-api');
    }
  }

  get model() {
    return this._model;
  }

  set model(value) {
    const old = this._model;
    if (old === value) {
      return;
    }
    this._model = value;
    this._setAmfModel(value);
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

  initialize() {
    this.initializeLoader();
  }

  initializeLoader() {
    const node = document.createElement('loader-screen');
    document.body.appendChild(node);
    this.loader = node;
  }

  selectFirstApi() {
    const listbox = document.getElementById('apiList');
    if (!listbox) {
      return;
    }
    listbox.selected = 0;
  }

  _selectApi(e) {
    const node = e.target.selectedItem;
    if (!node) {
      return;
    }
    const model = apiCache.get(node);
    if (model) {
      this.model = model;
      return;
    }
    const file = node.dataset.src;
    if (!file) {
      this.openUploader();
      return;
    }
    this.loadApi(file, node);
  }

  notifyError(message) {
    const node = document.createElement('paper-toast');
    document.body.appendChild(node);
    node.text = message;
    node.opened = true;
  }

  async loadApi(file, cacheKey) {
    const url = `/demo/models/${file}.json`;
    const absoluteUrl = new URL(url, location.href).toString();
    this.loading = true;
    try {
      const response = await fetch(absoluteUrl);
       const model = await response.json();
      apiCache.set(cacheKey, model);
      this.model = model;
    } catch (e) {
      this.notifyError(e.message);
    }
    this.loading = false;
  }

  _setAmfModel(model) {
    const apic = document.querySelector('api-console');
    apic.amf = model;
    apic.selectedShape = 'summary';
    apic.selectedShapeType = 'summary';
  }

  async _processApiFileUpload(e) {
    const { value } = e.detail;
    this.hasUploader = false;
    this.loading = true;
    const url = '/api/parse/api';
    this.loading = true;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: value
      });
      const data = await response.json();
      console.log(data);
    } catch (e) {
      this.notifyError(e.message);
    }
    this.loading = false;
  }

  firstRendered() {}

  menuSelectorTemplate() {
    const items = this.apis;
    if (!items) {
      return '';
    }
    const result = items.map(([file, label]) => html`<anypoint-item data-src="${file}">${label}</anypoint-item>`);
    return html`<anypoint-dropdown-menu
      slot="toolbar"
      aria-label="Select an API from the available options"
      nolabelfloat id="apisDropdown"
      class="api-dropdown">
      <label slot="label">Select an API</label>
      <anypoint-listbox
        slot="dropdown-content"
        id="apiList"
        @selected-changed="${this._selectApi}">
        ${result}
        ${this.allowUpload ? html`<anypoint-item data-value="">Upload own API</anypoint-item>` : ''}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  openUploader() {
    this.hasUploader = true;
  }

  render() {
    if (this._rendering) {
      return;
    }
    this._rendering = true;
    setTimeout(() => {
      this._rendering = false;
      this._render();
      if (!this.__firstRendered) {
        this.__firstRendered = true;
        setTimeout(() => this.firstRendered());
      }
    });
  }

  _render() {
    let content;
    if (!this.demoTemplate) {
      content = html`Implement <code>_render()</code> function`;
    } else if (this.hasUploader) {
      content = html`<upload-api-screen @select="${this._processApiFileUpload}"></upload-api-screen>`;
    } else {
      content = this.demoTemplate();
    }
    render(content, document.querySelector('#demo'));
  }
}
