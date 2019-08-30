import { html, css, LitElement } from 'lit-element';

class LoaderScreen extends LitElement {
  static get styles() {
    return css`:host {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff;
      display: flex;
      flex-direction: column;
    }

    :host([hidden]) {
      display: none;
    }

    .top {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      background-color: #2196F3;
      color: #fff;
      position: relative;

      transform: scaleY(0);
      transform-origin: top center;
    }

    :host([rendering]) .top {
      transform: scaleY(1);
    }

    :host([animating]) .top {
      transition: transform 0.3s cubic-bezier(0.74, 0.03, 0.3, 0.97);
    }

    .top,
    .bottom {
      flex: 1;
    }

    h1 {
      font-size: 112px;
      font-weight: 300;
      letter-spacing: -.044em;
      line-height: 120px;
      box-sizing: border-box;
      margin: 0;
    }

    .dot {
      position: absolute;
      bottom: -20px;
      animation: xAxis 5s infinite cubic-bezier(0.15, 0.1, 0.4, 0.8);
    }

    @keyframes xAxis {
      50% {
        transform: translateX(160px);
      }
    }

    .dot::after {
      content: '';
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 20px;
      background-color: #fff;
      /* background-color: #E91E63; */
      animation: yAxis 2.5s infinite cubic-bezier(0.3, 0.27, 0.07, 1);
    }

    @keyframes yAxis {
      50% {
        transform: translateY(-60px);
      }
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
      visible: { type: Boolean },

      rendering: { type: Boolean,  reflect: true },
      animating: { type: Boolean,  reflect: true }
    };
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    this._visible = value;
    if (value) {
      this.rendering = true;
      this.animating = false;
      this.removeAttribute('hidden');
    } else {
      this.rendering = false;
      this.animating = true;
    }
  }

  connectedCallback() {
    /* istanbul ignore else  */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.setAttribute('hidden', '');
  }

  _animationEnded() {
    if (!this.rendering) {
      this.setAttribute('hidden', '');
    }
  }

  render() {
    return html`
      <div class="top" @transitionend="${this._animationEnded}">
        <h1>Loading your API experience</h1>
        <div class="dot"></div>
      </div>
      <div class="bottom"></div>
    `;
  }
}
window.customElements.define('loader-screen', LoaderScreen);
