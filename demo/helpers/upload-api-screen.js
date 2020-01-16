import { html, css, LitElement } from 'lit-element';

class UploadApiScreen extends LitElement {
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

    :host([dragging]) section[role="main"] {
      box-shadow: 0 0 8px 0 rgba(0,0,0,.08),
                  0 0 15px 0 rgba(0,0,0,.02),
                  0 0 20px 4px rgba(0,0,0,.06);
    }

    .drop-welcome {
      font-size: 2rem;
      font-weight: 200;
      line-height: 2rem;
    }

    .accept-info {
      font-size: 1.2rem;
    }

    code {
      background-color: #FFF8E1;
    }

    input[type="file"] {
      display: none;
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
      // True when file is dragged over the element.
      dragging: { type: Boolean, reflect: true },
    };
  }

  get _input() {
    return this.shadowRoot.querySelector('input[type="file"]');
  }

  constructor() {
    super();
    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDrop = this._onDrop.bind(this);
  }

  connectedCallback() {
    /* istanbul ignore else  */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.addEventListener('dragenter', this._onDragEnter);
    this.addEventListener('dragleave', this._onDragLeave);
    this.addEventListener('dragover', this._onDragOver);
    this.addEventListener('drop', this._onDrop);
    this.setAttribute('aria-dropeffect', 'copy');
  }

  disconnectedCallback() {
    /* istanbul ignore else  */
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('dragenter', this._onDragEnter);
    this.removeEventListener('dragleave', this._onDragLeave);
    this.removeEventListener('dragover', this._onDragOver);
    this.removeEventListener('drop', this._onDrop);
  }

  // Handler for dragenter event.
  _onDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    this.dragging = true;
  }

  _onDragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    this.dragging = false;
  }

  _onDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    this.dragging = true;
  }

  // Handler for drop event.
  _onDrop(e) {
    this.dragging = false;
    e.stopPropagation();
    e.preventDefault();

    const files = e.dataTransfer.files;
    this._processEntries(Array.from(files));
  }

  // A handler called when the user manually selected the file (not by drag and drop)
  _manualSelected() {
    const input = this._input;
    if (input.files.length) {
      this._processEntries(Array.from(input.files));
    }
  }

  // Opens a file selector.
  selectFile() {
    this._input.click();
  }

  _processEntries(files) {
    this.dispatchEvent(new CustomEvent('select', {
      detail: {
        value: files[0]
      }
    }));
  }

  render() {
    return html`
      <h1>Upload own API</h1>
      <section role="main">
        <p class="drop-welcome">Drop your API file here</p>
        <p class="accept-info">
          We accept zip files or API single file.
        </p>

        <anypoint-button class="main-button" @click="${this.selectFile}">Select file</anypoint-button>
      </section>

      <input type="file" @change="${this._manualSelected}">
    `;
  }
}
window.customElements.define('upload-api-screen', UploadApiScreen);
