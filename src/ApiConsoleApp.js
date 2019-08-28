import { ApiConsole } from './ApiConsole.js';

import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';

export class ApiConsoleApp extends ApiConsole {
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

  async __amfChanged() {
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
}
