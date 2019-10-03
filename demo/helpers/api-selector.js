import { html, css, LitElement } from 'lit-element';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import { close, addCircleOutline } from '@advanced-rest-client/arc-icons/ArcIcons.js';

class ApiSelector extends AnypointMenuMixin(LitElement) {
  static get styles() {
    return css`:host {
      width: 340px;
      display: block;
      right: 0;
      top: 0;
      bottom: 0;
      background-color: #fff;
      transform: translateX(100%);
      transform-origin: top right;
      transition: transform 0.3s cubic-bezier(0.74, 0.03, 0.3, 0.97);
      position: fixed;
      box-shadow: var(--anypoiont-dropdown-shaddow);
    }

    :host([opened]) {
      transform: translateX(0);
    }

    .header {
      display: flex;
      align-items: center;
      margin: 0 12px;
    }

    .title {
      flex: 1;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .upload {
      width: 100%;
    }

    .icon {
      display: inlink-block;
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    `;
  }

  static get properties() {
    return {
      opened: { type: Boolean, reflect: true }
    };
  }

  get opened() {
    return this._opened;
  }

  set opened(value) {
    const old = this._opened;
    if (old === value) {
      return;
    }
    this._opened = value;
    this.requestUpdate('opened', value);
    this.dispatchEvent(new CustomEvent('opened-changed', {
      detail: {
        value
      }
    }));
  }

  close() {
    this.opened = false;
  }

  opeen() {
    this.opened = true;
  }

  _uploadHandler() {
    this.dispatchEvent(new CustomEvent('upload'));
    this.opened = false;
  }

  render() {
    return html`
      <div class="header">
        <div class="title">Select API</div>
        <anypoint-icon-button
          aria-label="Activate to close the API menu"
          @click="${this.close}"
        >
          <span class="icon">${close}</span>
        </anypoint-icon-button>
      </div>
      <anypoint-button @click="${this._uploadHandler}" class="upload">
        <span class="icon">${addCircleOutline}</span>
        Upload an API
      </anypoint-button>
      <section>
        <slot></slot>
      </section>
    `;
  }
}
window.customElements.define('api-selector', ApiSelector);
