import { html, css, LitElement } from 'lit-element';

class LoaderScreen extends LitElement {
  static get styles() {
    return css`:host {
      position: absolute;
      top: 0;
      left: 0;
      display: none;
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

    :host([visible]) {
      right: 0;
      bottom: 0;
      background: #fff;
      display: flex;
    }
    `;
  }

  static get properties() {
    return {
      visible: { type: Boolean, reflect: true }
    };
  }

  render() {
    return html`
      <h1>Loading your API experience</h1>
    `;
  }
}
window.customElements.define('loader-screen', LoaderScreen);
