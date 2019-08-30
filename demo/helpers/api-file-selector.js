import { html, css, LitElement } from 'lit-element';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';

class ApiFileSelector extends AnypointMenuMixin(LitElement) {
  static get styles() {
    return css`:host {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
    }

    h1 {
      font-size: 112px;
      font-weight: 300;
      letter-spacing: -.044em;
      line-height: 120px;
      box-sizing: border-box;
      margin: 0;
    }

    section[role="main"] {
      height: 60%;
      margin-top: 40px;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      transition: box-shadow 0.23s cubic-bezier(0.4, 0, 0.2, 1);
      width: 80%;
      border: 1px #e5e5e5 solid;
    }

    @media (max-width: 1200px) {
      h1 {
        font-size: 54px;
        text-align: center;
        margin: 0 24px;
        line-height: 64px;
      }
    `;
  }

  static get properties() {
    return {
    };
  }

  constructor() {
    super();
    this._selectHandler = this._selectHandler.bind(this);
  }

  connectedCallback() {
    /* istanbul ignore else  */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.addEventListener('select', this._selectHandler);
  }

  disconnectedCallback() {
    /* istanbul ignore else  */
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('select', this._selectHandler);
  }

  _selectHandler(e) {
    const value = e.detail.item.textContent;
    this.dispatchEvent(new CustomEvent('candidate-selected', {
      detail: value
    }));
  }

  render() {
    return html`
      <h1>Select API main file</h1>
      <p class="intro">We have found multiple API files.</p>
      <section role="main">
        <p class="drop-welcome">Choose the main API file</p>
        <slot></slot>
      </section>
    `;
  }
}
window.customElements.define('api-file-selector', ApiFileSelector);
