import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@polymer/paper-toast/paper-toast.js';
import './helpers/loader-screen.js';
const apiCache = new WeakMap();

export class DemoBase {
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

  initialize() {
    this.initializeLoader();
    this.initializeApiSelector();
  }

  render() {
    this.selectFirstApi();
  }

  initializeLoader() {
    const node = document.createElement('loader-screen');
    document.body.appendChild(node);
    this.loader = node;
  }

  initializeApiSelector() {
    const listbox = document.getElementById('apiList');
    if (!listbox) {
      return;
    }
    listbox.addEventListener('selected-changed', this._selectApi.bind(this));
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
    const file = node.dataset.value;
    if (!file) {
      return;
    }
    this.loadApi(file, node);
  }

  notifyError(message) {
    const node = document.createElement('paper-toast');
    document.body.appendChild(node);
    node.text = message;
    node.oepened = true;
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
}
